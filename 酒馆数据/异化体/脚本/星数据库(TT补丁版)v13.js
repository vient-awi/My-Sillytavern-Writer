// 加载数据库插件
import 'https://gcore.jsdelivr.net/gh/AlbusKen/shujuku@spv5.5.7/index.js'; 

// 补丁v13：修复定期同步Bug + TT定期用updateJson合并 + 添加ui_theme/windowStates同步 + 间隔2.5分钟静默
(async () => {
    const topWin = (typeof window.parent !== 'undefined') ? window.parent : window;
    const TAG = '[ACU数据保护v13]';
    const BRIDGE_KEY = '__ACU_USERSCRIPT_BRIDGE__';
    const NS_KEY = 'shujuku_v120__userscript_settings_v1';
    const IDB_NAME = 'shujuku_v120_config_v1';
    const IDB_STORE = 'kv';
    const TT_NAMESPACE = 'acu-data-protection';
    const TT_KEY = 'settings-mirror';

    // ═══ 防重入 ═══
    if (topWin.__ACU_SYNC_LOCK__) return;
    topWin.__ACU_SYNC_LOCK__ = true;
    if (topWin.__ACU_SYNC_V13_DONE__) {
        topWin.__ACU_SYNC_LOCK__ = false;
        return;
    }

    // ═══ 竞态保护：初始推送后一段时间内不把Bridge变化写回TT ═══
    // 目的：spv1.2插件可能在补丁推送后才启动，从Bridge读旧数据再写回Bridge
    //       这段"保护窗口"内Bridge的变化不会污染TT
    let _ttProtectionUntil = 0;
    const TT_PROTECTION_WINDOW_MS = 45000; // 45秒保护窗口

    const getToastr = () => {
        try { return topWin.toastr || window.toastr; } catch (e) { return null; }
    };

    function toast(type, msg) {
        if (type === 'error') console.error(`${TAG} ${msg}`);
        else if (type === 'warning') console.warn(`${TAG} ${msg}`);
        else console.log(`${TAG} ${msg}`);
        const t = getToastr();
        if (!t) return;
        const opts = {
            timeOut: type === 'error' ? 8000 : type === 'warning' ? 5000 : 3000,
            extendedTimeOut: 2000, closeButton: true, progressBar: true,
            newestOnTop: true, positionClass: 'toast-top-right', escapeHtml: false,
        };
        try {
            if (type === 'error') t.error(msg, TAG, opts);
            else if (type === 'warning') t.warning(msg, TAG, opts);
            else if (type === 'success') t.success(msg, TAG, opts);
            else t.info(msg, TAG, opts);
        } catch (e) {}
    }

    // ═══ IDB 辅助 ═══
    const getTopIndexedDB = () => {
        try { return topWin.indexedDB; } catch (e) { return window.indexedDB; }
    };

    let _idbConn = null;

    const openIDB = async () => {
        if (_idbConn) {
            try {
                _idbConn.transaction(IDB_STORE, 'readonly');
                return _idbConn;
            } catch (e) {
                _idbConn = null;
            }
        }
        const idb = getTopIndexedDB();
        if (!idb) return null;
        return new Promise((resolve, reject) => {
            try {
                const req = idb.open(IDB_NAME, 1);
                req.onupgradeneeded = () => {
                    if (!req.result.objectStoreNames.contains(IDB_STORE)) {
                        req.result.createObjectStore(IDB_STORE);
                    }
                };
                req.onsuccess = () => {
                    _idbConn = req.result;
                    _idbConn.onclose = () => { _idbConn = null; };
                    resolve(_idbConn);
                };
                req.onerror = () => reject(req.error);
            } catch (e) { reject(e); }
        });
    };

    const idbGet = (db, key) => new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    const idbPut = (db, key, value) => new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const req = tx.objectStore(IDB_STORE).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });

    const idbGetAllKeys = (db) => new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).getAllKeys();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });

    // ═══ TauriTavern extension.store ═══
    let ttStore = null;
    let isTauriTavern = false;

    const initTauriTavern = async () => {
        try {
            const tt = topWin.__TAURITAVERN__;
            if (!tt) return false;
            const readyPromise = tt.ready ?? topWin.__TAURITAVERN_MAIN_READY__;
            if (readyPromise) {
                await Promise.race([readyPromise, new Promise(r => setTimeout(r, 10000))]);
            }
            if (tt.api?.extension?.store) {
                ttStore = tt.api.extension.store;
                return true;
            }
            return false;
        } catch (e) { return false; }
    };

    const ttRead = async () => {
        if (!ttStore) return null;
        try {
            const data = await ttStore.getJson({ namespace: TT_NAMESPACE, key: TT_KEY });
            return (data && typeof data === 'object') ? data : null;
        } catch (e) {
            return null;
        }
    };

    // 写入锁：防止并发写入TT
    let _ttWriteLock = false;
    const ttWrite = async (dataObj) => {
        if (!ttStore) return false;
        let waitCount = 0;
        while (_ttWriteLock && waitCount < 50) {
            await new Promise(r => setTimeout(r, 100));
            waitCount++;
        }
        _ttWriteLock = true;
        try {
            await ttStore.setJson({ namespace: TT_NAMESPACE, key: TT_KEY, value: dataObj });
            return true;
        } catch (e) { return false; }
        finally { _ttWriteLock = false; }
    };
    const ttUpdateJson = async (dataObj) => {
        if (!ttStore) return false;
        let waitCount = 0;
        while (_ttWriteLock && waitCount < 50) {
            await new Promise(r => setTimeout(r, 100));
            waitCount++;
        }
        _ttWriteLock = true;
        try {
            await ttStore.updateJson({ namespace: TT_NAMESPACE, key: TT_KEY, value: dataObj });
            return true;
        } catch (e) { return false; }
        finally { _ttWriteLock = false; }
    };

    // ═══ 指数退避轮询 ═══
    const pollUntil = async (checkFn, { maxMs = 20000, initInterval = 20, maxInterval = 500 } = {}) => {
        const start = Date.now();
        let interval = initInterval;
        while (Date.now() - start < maxMs) {
            if (checkFn()) return true;
            await new Promise(r => setTimeout(r, interval));
            interval = Math.min(interval * 1.5, maxInterval);
        }
        return false;
    };

    try {
        // ═══ 第1步：检测环境 ═══
        isTauriTavern = await initTauriTavern();

        if (!isTauriTavern) {
            try {
                const storage = (topWin.navigator?.storage) || navigator?.storage;
                if (storage?.persist) {
                    const wasPersisted = await storage.persisted();
                    if (!wasPersisted) await storage.persist();
                }
            } catch (e) {}
        }

        // ═══ 第2步：等待 Bridge ═══
        const bridgeReady = await pollUntil(() => {
            try {
                const b = topWin[BRIDGE_KEY];
                return !!(b && b.extension_settings && !b.error);
            } catch (e) { return false; }
        });

        if (!bridgeReady) {
            try {
                const doc = topWin.document;
                if (doc && !topWin.__ACU_BRIDGE_RETRY_V13__) {
                    topWin.__ACU_BRIDGE_RETRY_V13__ = true;
                    const s = doc.createElement('script');
                    s.type = 'module';
                    s.textContent = `
                        (async () => {
                            try {
                                const ext = await import('/scripts/extensions.js');
                                const main = await import('/script.js');
                                window['${BRIDGE_KEY}'] = window['${BRIDGE_KEY}'] || {};
                                window['${BRIDGE_KEY}'].extension_settings = ext?.extension_settings || null;
                                window['${BRIDGE_KEY}'].saveSettingsDebounced = main?.saveSettingsDebounced || null;
                                window['${BRIDGE_KEY}'].saveSettings = main?.saveSettings || null;
                            } catch (e) {
                                window['${BRIDGE_KEY}'] = window['${BRIDGE_KEY}'] || {};
                                window['${BRIDGE_KEY}'].error = String(e && (e.message || e));
                            }
                        })();
                    `;
                    (doc.head || doc.documentElement || doc.body).appendChild(s);
                }
            } catch (e) {}

            await pollUntil(() => {
                try {
                    const b = topWin[BRIDGE_KEY];
                    return !!(b && b.extension_settings && !b.error);
                } catch (e) { return false; }
            }, { maxMs: 10000 });
        }

        // 等待插件 API
        await pollUntil(() => {
            try {
                return !!(topWin.AutoCardUpdaterAPI && typeof topWin.AutoCardUpdaterAPI.exportTableAsJson === 'function');
            } catch (e) { return false; }
        }, { maxMs: 25000 });

        // ═══ 第3步：等待设置稳定 ═══
        let bridge, extSettings;
        try {
            bridge = topWin[BRIDGE_KEY];
            extSettings = bridge?.extension_settings;
        } catch (e) { bridge = null; extSettings = null; }

        if (extSettings?.__userscripts?.[NS_KEY]) {
            let lastSnapshot = '';
            try { lastSnapshot = JSON.stringify(extSettings.__userscripts[NS_KEY]); } catch (e) {}
            let stableCount = 0;

            for (let i = 0; i < 30; i++) {
                await new Promise(r => setTimeout(r, 1000));
                let cur = '';
                try { cur = JSON.stringify(extSettings.__userscripts[NS_KEY]); } catch (e) {}
                if (cur === lastSnapshot) {
                    stableCount++;
                    if (stableCount >= 3) break;
                } else {
                    stableCount = 0;
                    lastSnapshot = cur;
                }
            }
        } else {
            await new Promise(r => setTimeout(r, 5000));
        }

        // ═══ 第4步：数据同步 ═══
        try {
            bridge = topWin[BRIDGE_KEY];
            extSettings = bridge?.extension_settings;
        } catch (e) { bridge = null; extSettings = null; }

        const bridgeFinalReady = !!(extSettings);

        let ttData = isTauriTavern ? await ttRead() : null;

        let tavernNs = null;
        if (extSettings) {
            if (!extSettings.__userscripts) extSettings.__userscripts = {};
            if (!extSettings.__userscripts[NS_KEY]) extSettings.__userscripts[NS_KEY] = {};
            tavernNs = extSettings.__userscripts[NS_KEY];
        }

        let db = null;
        let pluginIdbKeys = [];
        try {
            db = await openIDB();
            if (db) {
                const allIdbKeys = await idbGetAllKeys(db);
                pluginIdbKeys = allIdbKeys.filter(k => typeof k === 'string' && k.startsWith('shujuku_v120_'));
            }
        } catch (e) {}

        const allKeys = new Set();
        if (ttData) Object.keys(ttData).forEach(k => allKeys.add(k));
        if (tavernNs) Object.keys(tavernNs).filter(k => k.startsWith('shujuku_v120_') || k === 'shujuku_v120_ui_theme_v1' || k === 'shujuku_v120_windowStates').forEach(k => allKeys.add(k));
        pluginIdbKeys.forEach(k => allKeys.add(k));

        const stats = { tt: 0, tavern: 0, idb: 0, err: 0 };

        if (isTauriTavern && ttData && Object.keys(ttData).length > 0) {
            // ═══ TT有数据：TT是权威源，单向推送到Bridge和IDB ═══
            console.log(`${TAG} TT有数据(${Object.keys(ttData).length}键)，以TT为权威源`);

            for (const key of Object.keys(ttData)) {
                try {
                    const ttVal = ttData[key] || '';
                    if (!ttVal) continue;

                    if (tavernNs && String(tavernNs[key] || '') !== ttVal) {
                        tavernNs[key] = ttVal;
                        stats.tavern++;
                    }
                    if (db) {
                        try {
                            const idbVal = await idbGet(db, key);
                            if (String(idbVal || '') !== ttVal) {
                                await idbPut(db, key, ttVal);
                                stats.idb++;
                            }
                        } catch (e) { stats.err++; }
                    }
                } catch (e) { stats.err++; }
            }

            // Bridge/IDB中有但TT没有的键：补充到TT（不覆盖）
            let ttDirty = false;
            for (const key of allKeys) {
                if (ttData[key]) continue;
                try {
                    const tavernVal = tavernNs ? String(tavernNs[key] || '') : '';
                    let idbVal = '';
                    if (db) {
                        try {
                            const raw = await idbGet(db, key);
                            idbVal = raw != null ? String(raw) : '';
                        } catch (e) {}
                    }
                    const best = tavernVal.length >= idbVal.length ? tavernVal : idbVal;
                    if (best) {
                        ttData[key] = best;
                        ttDirty = true;
                        stats.tt++;
                    }
                } catch (e) { stats.err++; }
            }
            if (ttDirty) {
                if (!await ttWrite(ttData)) stats.err++;
            }

            // 开启保护窗口：推送完毕后一段时间内不把Bridge变化写回TT
            _ttProtectionUntil = Date.now() + TT_PROTECTION_WINDOW_MS;

        } else if (isTauriTavern) {
            // ═══ TT无数据：首次初始化，从Bridge/IDB收集 ═══
            console.log(`${TAG} TT无数据，从Bridge/IDB初始化`);
            const initialData = {};

            for (const key of allKeys) {
                try {
                    const tavernVal = tavernNs ? String(tavernNs[key] || '') : '';
                    let idbVal = '';
                    if (db) {
                        try {
                            const raw = await idbGet(db, key);
                            idbVal = raw != null ? String(raw) : '';
                        } catch (e) {}
                    }

                    const candidates = [
                        { val: tavernVal, src: 'Bridge' },
                        { val: idbVal, src: 'IDB' }
                    ].filter(c => c.val);

                    if (!candidates.length) continue;
                    candidates.sort((a, b) => b.val.length - a.val.length);
                    let best = candidates[0].val;

                    if (candidates.length > 1 && candidates[0].val.length < candidates[1].val.length * 1.1) {
                        try {
                            const o0 = JSON.parse(candidates[0].val);
                            const o1 = JSON.parse(candidates[1].val);
                            if (typeof o0 === 'object' && o0 && typeof o1 === 'object' && o1) {
                                if (Object.keys(o1).length > Object.keys(o0).length) best = candidates[1].val;
                            }
                        } catch (e) {}
                    }

                    initialData[key] = best;
                    stats.tt++;
                } catch (e) { stats.err++; }
            }

            if (Object.keys(initialData).length > 0) {
                if (!await ttWrite(initialData)) stats.err++;
                else ttData = initialData;
            }

        } else {
            // ═══ 非TT环境：Bridge ↔ IDB双向同步 ═══
            for (const key of allKeys) {
                try {
                    const tavernVal = tavernNs ? String(tavernNs[key] || '') : '';
                    let idbVal = '';
                    if (db) {
                        try {
                            const raw = await idbGet(db, key);
                            idbVal = raw != null ? String(raw) : '';
                        } catch (e) {}
                    }

                    const candidates = [
                        { val: tavernVal, src: 'Bridge' },
                        { val: idbVal, src: 'IDB' }
                    ].filter(c => c.val);

                    if (!candidates.length) continue;
                    candidates.sort((a, b) => b.val.length - a.val.length);
                    const best = candidates[0].val;

                    if (candidates.every(c => c.val === best)) continue;

                    if (tavernNs && tavernVal !== best) {
                        tavernNs[key] = best;
                        stats.tavern++;
                    }
                    if (db && idbVal !== best) {
                        try { await idbPut(db, key, best); stats.idb++; } catch (e) { stats.err++; }
                    }
                } catch (e) { stats.err++; }
            }
        }

        // Bridge保存
        if (stats.tavern > 0) {
            let saveFn = null;
            try {
                saveFn = bridge?.saveSettingsDebounced || bridge?.saveSettings
                    || topWin.saveSettingsDebounced || topWin.saveSettings;
            } catch (e) {}
            if (typeof saveFn === 'function') {
                try { saveFn(); } catch (e) { stats.err++; }
            }
        }

        // ═══ 汇总 ═══
        const total = stats.tt + stats.tavern + stats.idb;
        const env = isTauriTavern ? 'TT' : 'std';
        const br = bridgeFinalReady ? '✓' : '✗';
        const protMs = Math.max(0, _ttProtectionUntil - Date.now());
        const hooks = [
            'SaveHook',
            isTauriTavern ? 'ChangeDetect(3s)' : null,
            'BtnClick',
            'FileImport',
            'SelectChange',
            'CheckboxChange',
            'Periodic(2.5m)',
            protMs > 0 ? `Guard(${Math.round(protMs/1000)}s)` : null
        ].filter(Boolean).join('+');

        if (stats.err > 0) {
            toast('warning', `[${env}|Bridge:${br}] 同步 ${total} 键, ${stats.err} 错误<br><small>监听: ${hooks}</small>`);
        } else if (total > 0) {
            toast('success', `[${env}|Bridge:${br}] 同步 ${total} 键 (TT+${stats.tt} B+${stats.tavern} IDB+${stats.idb})<br><small>监听: ${hooks}</small>`);
        } else {
            toast('success', `[${env}|Bridge:${br}] 数据一致 ✓<br><small>监听: ${hooks}</small>`);
        }

        if (!bridgeFinalReady && !isTauriTavern) {
            alert(`${TAG}\nBridge 不可用且非 TauriTavern！\n数据仅存于无保护的 IDB。`);
        }

        // ═══════════════════════════════════════════════════════════
        // 核心功能：拦截保存/导入操作，操作后同步到TT
        // ═══════════════════════════════════════════════════════════
        
        const collectCurrentNsData = () => {
            try {
                let ns = null;
                try {
                    const b = topWin[BRIDGE_KEY];
                    const es = b?.extension_settings;
                    if (es?.__userscripts?.[NS_KEY]) {
                        ns = es.__userscripts[NS_KEY];
                    }
                } catch (e) {}

                if (!ns) return null;

                const dataToSync = {};
                Object.keys(ns).forEach(k => {
                    if (k.startsWith('shujuku_v120_') || k === 'shujuku_v120_ui_theme_v1' || k === 'shujuku_v120_windowStates') {
                        dataToSync[k] = ns[k];
                    }
                });

                return Object.keys(dataToSync).length > 0 ? dataToSync : null;
            } catch (e) {
                return null;
            }
        };

        // ═══ 判断是否是"用户主动操作"触发的同步 ═══
        // 在保护窗口内：只有用户主动操作（按钮点击、文件导入等）才写入TT
        // 自动检测到的Bridge变化不写入TT（防止index3.0.1.js加载旧数据后回写覆盖TT）
        const syncAllToTT = async (isUserAction = false) => {
            if (!isTauriTavern || !ttStore) return;

            // 保护窗口内，只有用户主动操作才能写入TT
            if (!isUserAction && Date.now() < _ttProtectionUntil) {
                console.log(`${TAG} 保护窗口内(剩${Math.round((_ttProtectionUntil - Date.now())/1000)}s)，跳过自动同步到TT`);
                return;
            }

            try {
                const dataToSync = collectCurrentNsData();
                if (!dataToSync) return;

                // 合并写入：只更新有变化的键，不删除TT中已有的键
                const currentTT = await ttRead() || {};
                let changed = false;
                for (const [k, v] of Object.entries(dataToSync)) {
                    if (v && v !== currentTT[k]) {
                        currentTT[k] = v;
                        changed = true;
                    }
                }
                
                if (changed) {
                    const ok = await ttWrite(currentTT);
                    if (ok) {
                        console.log(`${TAG} 同步到TT成功 (${Object.keys(dataToSync).length}键, 用户操作=${isUserAction})`);
                    }
                }
            } catch (e) {
                console.warn(`${TAG} 同步到TT失败:`, e);
            }
        };
        
        const syncAllToIDB = async () => {
            try {
                const dataToSync = collectCurrentNsData();
                if (!dataToSync) return;
                
                const idbConn = await openIDB();
                if (!idbConn) return;
                
                for (const [k, v] of Object.entries(dataToSync)) {
                    try {
                        await idbPut(idbConn, k, v);
                    } catch (e) {}
                }
            } catch (e) {}
        };
        
        // 防抖同步（区分用户操作和自动检测）
        let _postOpSyncTimer = null;
        const postOpSync = async (reason = 'unknown', isUserAction = false) => {
            clearTimeout(_postOpSyncTimer);
            _postOpSyncTimer = setTimeout(async () => {
                console.log(`${TAG} 触发同步: ${reason} (用户操作=${isUserAction})`);
                await Promise.all([
                    syncAllToTT(isUserAction),
                    syncAllToIDB()
                ]);
            }, 500);
        };
        
        // ═══ Hook saveSettings ═══
        const hookSaveFn = (obj, fnName) => {
            if (!obj || typeof obj[fnName] !== 'function') return;
            const original = obj[fnName];
            if (original.__acuSyncHooked) return;
            
            obj[fnName] = function(...args) {
                const result = original.apply(this, args);
                setTimeout(() => {
                    // saveSettings是插件内部调用，视为用户操作
                    postOpSync(`hook:${fnName}`, true).catch(e => {
                        console.warn(`${TAG} postOpSync 失败:`, e);
                    });
                }, 800);
                return result;
            };
            obj[fnName].__acuSyncHooked = true;
        };
        
        try {
            if (bridge?.saveSettingsDebounced) hookSaveFn(bridge, 'saveSettingsDebounced');
            if (bridge?.saveSettings) hookSaveFn(bridge, 'saveSettings');
        } catch (e) {}
        
        try {
            if (typeof topWin.saveSettingsDebounced === 'function') hookSaveFn(topWin, 'saveSettingsDebounced');
            if (typeof topWin.saveSettings === 'function') hookSaveFn(topWin, 'saveSettings');
        } catch (e) {}
        
        // ═══ 变化检测（自动检测，非用户操作）═══
        if (isTauriTavern && ttStore) {
            let lastNsSnapshot = '';
            try {
                lastNsSnapshot = JSON.stringify(tavernNs || {});
            } catch (e) {}
            
            setInterval(async () => {
                try {
                    let currentNs = null;
                    try {
                        const b = topWin[BRIDGE_KEY];
                        currentNs = b?.extension_settings?.__userscripts?.[NS_KEY];
                    } catch (e) { return; }
                    
                    if (!currentNs) return;
                    
                    const currentSnapshot = JSON.stringify(currentNs);
                    if (currentSnapshot !== lastNsSnapshot) {
                        lastNsSnapshot = currentSnapshot;
                        // 自动检测 → isUserAction=false → 保护窗口内不写TT
                        await postOpSync('change-detect', false);
                    }
                } catch (e) {}
            }, 3000);
        }
        
        // ═══ 按钮点击（用户操作）═══
        try {
            const targetDoc = topWin.document || document;
            
            targetDoc.addEventListener('click', (e) => {
                const target = e.target;
                if (!target) return;
                
                const el = target.closest ? target.closest('button, .button, [role="button"], .menu_button, a.button') : null;
                if (!el) return;
                
                const id = (el.id || '').toLowerCase();
                const text = (el.textContent || el.innerText || '').trim();
                const classList = (el.className || '').toLowerCase();
                const title = (el.title || '').toLowerCase();
                
                const saveKw = ['save','apply','reset','export','保存','应用','恢复默认','覆盖','删除'];
                const importKw = ['import','load','upload','导入','加载','上传','读取','选择文件','打开文件'];
                
                const match = (kws) => kws.some(kw => {
                    const l = kw.toLowerCase();
                    return id.includes(l) || classList.includes(l) || title.includes(l) || text.includes(kw);
                });
                
                const isSave = match(saveKw) || classList.includes('primary');
                const isImport = match(importKw);
                
                if (isSave || isImport) {
                    const delay = isImport ? 3000 : 1500;
                    setTimeout(() => {
                        // 用户操作 → isUserAction=true → 保护窗口内也写TT
                        postOpSync(isImport ? 'import-btn' : 'save-btn', true);
                    }, delay);
                }
            }, true);
        } catch (e) {}
        
        // ═══ 文件导入（用户操作）═══
        try {
            const targetDoc = topWin.document || document;
            
            targetDoc.addEventListener('change', (e) => {
                const target = e.target;
                if (!target || target.tagName !== 'INPUT' || target.type !== 'file') return;
                
                const id = (target.id || '').toLowerCase();
                const accept = (target.accept || '').toLowerCase();
                
                const relevant =
                    accept.includes('.json') || accept.includes('.txt') ||
                    accept.includes('application/json') ||
                    id.includes('import') || id.includes('preset') ||
                    id.includes('template') || id.includes('shujuku');
                
                if (!relevant || !target.files || target.files.length === 0) return;
                
                // 用户操作
                setTimeout(() => postOpSync('file-import-fast', true), 3000);
                setTimeout(() => postOpSync('file-import-slow', true), 8000);
                setTimeout(() => postOpSync('file-import-final', true), 15000);
            }, true);
        } catch (e) {}
        
        // ═══ Select变更（用户操作）═══
        try {
            const targetDoc = topWin.document || document;
            
            targetDoc.addEventListener('change', (e) => {
                const target = e.target;
                if (!target || target.tagName !== 'SELECT') return;
                
                const id = (target.id || '').toLowerCase();
                const relevant =
                    id.includes('preset') || id.includes('template') ||
                    id.includes('profile') || id.includes('api-mode') ||
                    id.includes('injection-target') || id.includes('worldbook') ||
                    id.includes('shujuku');
                
                if (!relevant) return;
                
                setTimeout(() => postOpSync('select:' + (target.id || '?'), true), 2000);
            }, true);
        } catch (e) {}
        
        // ═══ Checkbox变更（用户操作）═══
        try {
            const targetDoc = topWin.document || document;
            let cbTimer = null;
            
            targetDoc.addEventListener('change', (e) => {
                const target = e.target;
                if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox') return;
                
                const id = (target.id || '').toLowerCase();
                const relevant =
                    id.includes('shujuku') || id.includes('acu') ||
                    id.includes('auto-update') || id.includes('enabled') ||
                    id.includes('plot') || id.includes('optimization') ||
                    id.includes('template') || id.includes('mute') ||
                    id.includes('streaming');
                
                if (!relevant) return;
                
                clearTimeout(cbTimer);
                cbTimer = setTimeout(() => postOpSync('checkbox:' + (target.id || '?'), true), 1500);
            }, true);
        } catch (e) {}

        // ═══ 定期同步 (2.5分钟，静默) ═══
        if (!topWin.__ACU_PERIODIC_SYNC_V13__) {
            topWin.__ACU_PERIODIC_SYNC_V13__ = setInterval(async () => {
                try {
                    if (isTauriTavern && ttStore) {
                        // TT→IDB：始终独立执行（不依赖 Bridge）
                        const freshTT = await ttRead() || {};
                        if (Object.keys(freshTT).length > 0) {
                            const idb2 = await openIDB();
                            if (idb2) {
                                for (const [k, v] of Object.entries(freshTT)) {
                                    try {
                                        const iv = await idbGet(idb2, k);
                                        if (v && String(iv || '') !== v) {
                                            await idbPut(idb2, k, v);
                                        }
                                    } catch (e) {}
                                }
                            }
                        }

                        // TT→Bridge（保护窗口外才写，使用 updateJson 合并覆盖）
                        if (Date.now() >= _ttProtectionUntil) {
                            const nsData = collectCurrentNsData();
                            if (nsData && Object.keys(nsData).length > 0) {
                                try {
                                    await ttUpdateJson(nsData);
                                } catch (e) {}
                            }
                        }
                    } else {
                        // 非TT：Bridge→IDB（补充模式，取长者）
                        let ns2;
                        try { ns2 = topWin[BRIDGE_KEY]?.extension_settings?.__userscripts?.[NS_KEY]; } catch (e) { return; }
                        let idb2;
                        try { idb2 = await openIDB(); } catch (e) { return; }
                        if (!ns2 || !idb2) return;

                        for (const key of Object.keys(ns2)) {
                            if (!key.startsWith('shujuku_v120_') && key !== 'shujuku_v120_ui_theme_v1' && key !== 'shujuku_v120_windowStates') continue;
                            const val = String(ns2[key] || '');
                            if (!val) continue;
                            try {
                                const iv = await idbGet(idb2, key);
                                if (val !== String(iv || '') && val.length >= String(iv || '').length) {
                                    await idbPut(idb2, key, val);
                                }
                            } catch (e) {}
                        }
                    }
                } catch (e) {}
            }, 2.5 * 60 * 1000);
        }

        // ═══ 聊天切换时立即同步 ═══
        if (!topWin.__ACU_CHAT_CHANGE_LISTENER__) {
            topWin.__ACU_CHAT_CHANGE_LISTENER__ = true;
            try {
                const st = topWin.SillyTavern;
                if (st?.eventSource?.on) {
                    st.eventSource.on('chat_id_changed', () => {
                        setTimeout(() => postOpSync('chat-changed', true), 2000);
                    });
                }
            } catch (e) {}
        }

        topWin.__ACU_SYNC_V13_DONE__ = true;

    } catch (e) {
        alert(`${TAG}\n补丁异常: ${e.message}`);
    } finally {
        try { topWin.__ACU_SYNC_LOCK__ = false; } catch (e) {}
    }
})();