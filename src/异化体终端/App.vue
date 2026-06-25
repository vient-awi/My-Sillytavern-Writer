<template>
  <div class="lh-terminal select-none text-[#7cb3c7] font-sans antialiased overflow-hidden p-2 md:p-4">
    <div class="relative mx-auto w-full max-w-[760px] bg-[#0a1018]/90 backdrop-blur-md border border-[#174257] rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_12px_rgba(94,196,230,0.2)] flex flex-col hud-corners">

      <!-- Top Decorative Line with Breath -->
      <div class="absolute top-0 left-0 right-0 h-[3px] bg-[#5ec4e6] z-10 animate-top-breath"></div>

      <!-- Grid Background Pattern Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(94, 196, 230, 0.1) 3px, rgba(94, 196, 230, 0.1) 6px);"></div>
      <!-- Scanline Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-10 animate-scanline bg-[linear-gradient(to_bottom,transparent,rgba(94,196,230,0.5),transparent)] bg-[length:100%_4px]"></div>
      <!-- Data Particles -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div v-for="i in 8" :key="'p'+i" class="data-particle" :style="{ left: (10 + i * 11) + '%', animationDelay: (i * 0.7) + 's', animationDuration: (3 + i * 0.5) + 's' }"></div>
      </div>

      <!-- Header -->
      <header class="relative z-10 flex justify-between items-center px-5 py-3.5 bg-gradient-to-r from-[#174257]/60 to-transparent border-b border-[#174257] cursor-pointer hover:from-[#174257]/80 transition-colors" @click="isCollapsed = !isCollapsed">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-[22px] h-[22px] border border-[#5ec4e6] bg-[#5ec4e6]/10 rounded-sm text-[#5ec4e6] text-[12px] shadow-[0_0_8px_rgba(94,196,230,0.3)] relative overflow-hidden">
            <div class="absolute inset-0 bg-[#5ec4e6]/20 animate-radar-spin"></div>
            <i class="fas fa-satellite-dish text-[10px] relative z-10"></i>
          </div>
          <span class="text-[#5ec4e6] font-bold text-base tracking-[2px] drop-shadow-[0_0_10px_rgba(94,196,230,0.4)] uppercase terminal-title" :class="{ 'animate-glitch': glitchTrigger }">
            战术体能监控终端 <span class="text-xs text-[#5ec4e6]/60 tracking-widest ml-1 font-mono">v3.0</span>
          </span>
          <div class="hidden sm:flex items-center gap-2 ml-4">
            <span class="px-1.5 py-0.5 bg-[#5ec4e6]/20 border border-[#5ec4e6]/40 text-[#5ec4e6] text-[9px] font-mono tracking-widest rounded-sm">SYS.ON</span>
            <span class="px-1.5 py-0.5 bg-[#4cd47a]/20 border border-[#4cd47a]/40 text-[#4cd47a] text-[9px] font-mono tracking-widest rounded-sm animate-pulse">LINK.STABLE</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- Signal Strength -->
          <div class="hidden md:flex items-center gap-[2px]">
            <div v-for="i in 4" :key="'sig'+i" class="w-[3px] rounded-[1px] transition-all duration-300" :class="i <= signalBars ? 'bg-[#5ec4e6] shadow-[0_0_4px_#5ec4e6]' : 'bg-[#174257]'" :style="{ height: (4 + i * 3) + 'px' }"></div>
          </div>
          <!-- Encryption Badge -->
          <span class="hidden lg:block text-[#3d6f82] text-[9px] font-mono tracking-widest bg-[#174257]/30 px-1.5 py-0.5 rounded-sm border border-[#174257]/50">{{ cipherText }}</span>
          <!-- Live Clock -->
          <span class="hidden sm:block font-mono text-[#5ec4e6] text-[12px] tracking-widest drop-shadow-[0_0_5px_rgba(94,196,230,0.3)]">{{ liveClock }}<span class="animate-blink">:</span><span class="text-[#7cb3c7]">{{ liveSeconds }}</span></span>
          <div class="text-[#5ec4e6] text-sm transition-transform duration-300 flex items-center gap-3" :class="{ 'rotate-[-90deg]': isCollapsed }">
            <div class="hidden sm:flex flex-col gap-[2px] items-end opacity-60">
              <div class="w-8 h-[2px] bg-[#5ec4e6]"></div>
              <div class="w-4 h-[2px] bg-[#5ec4e6]"></div>
              <div class="w-6 h-[2px] bg-[#5ec4e6]"></div>
            </div>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </header>

      <!-- System Status Ribbon -->
      <div v-show="!isCollapsed" class="relative z-10 flex items-center justify-between px-5 py-1.5 bg-[#06090e]/80 border-b border-[#174257]/50 text-[10px] font-mono tracking-widest">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5" :class="sysStatus.class">
            <span class="w-[6px] h-[6px] rounded-full" :class="sysStatus.dot"></span>
            {{ sysStatus.label }}
          </span>
          <span class="text-[#3d6f82]">|</span>
          <span class="text-[#3d6f82]">SYNC <span class="text-[#5ec4e6]">{{ syncTimestamp }}</span></span>
          <span class="text-[#3d6f82]">|</span>
          <span class="text-[#3d6f82]">BUF <span class="text-[#5ec4e6]">{{ dataBuffer }}%</span></span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-[#3d6f82]">THREAT</span>
          <span class="font-bold" :class="threatLevel.class">{{ threatLevel.label }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div v-show="!isCollapsed" class="relative z-10 flex flex-col bg-transparent">

        <div class="p-5 pb-4">
          <div class="flex gap-6">

            <!-- Left Side: Bars (Flex-1) -->
            <div class="flex-1 flex flex-col gap-6 min-w-0">
              <!-- Core Metrics -->
            <div class="space-y-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="h-[1px] w-4 bg-[#5ec4e6] shadow-[0_0_5px_#5ec4e6]"></div>
                <span class="text-[#5ec4e6] text-[11px] font-bold tracking-[3px] uppercase">核心读数 [CORE]</span>
                <div class="flex-1 h-px bg-gradient-to-r from-[#5ec4e6]/40 to-transparent"></div>
                <!-- Mini ECG Waveform -->
                <div class="ecg-waveform shrink-0" :class="ecgClass">
                  <svg viewBox="0 0 80 24" class="w-[80px] h-[24px]">
                    <polyline :points="ecgPoints" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-line"/>
                  </svg>
                </div>
              </div>

              <div class="space-y-3.5">
                <div v-for="bar in coreBars" :key="bar.id" class="flex items-center gap-3 group">
                  <div class="w-7 h-7 flex items-center justify-center border rounded-[3px] shrink-0 transition-colors"
                       :class="bar.isDanger ? 'border-[#e04060]/60 bg-[#e04060]/15 text-[#e04060] shadow-[0_0_10px_rgba(224,64,96,0.3)]' : 'border-[#5ec4e6]/30 bg-[#5ec4e6]/5 text-[#5ec4e6] shadow-[0_0_10px_rgba(94,196,230,0.1)]'">
                    <i :class="bar.icon" class="text-[13px]"></i>
                  </div>
                  <span class="text-[#7cb3c7] text-[12px] font-bold tracking-[2px] w-10 shrink-0">{{ bar.label }}</span>

                  <div class="flex-1 h-[14px] bg-[#06090e] border border-[#174257] p-[2px] flex relative group-hover:border-[#5ec4e6]/50 transition-colors overflow-hidden">
                    <div class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(94,196,230,0.05)_10%,rgba(94,196,230,0.05)_10.5%)] pointer-events-none"></div>
                    <div class="h-full relative transition-all duration-500 overflow-hidden bg-gradient-to-r"
                         :class="bar.isDanger ? 'from-[#e04060]/40 to-[#e04060] shadow-[0_0_12px_#e04060]' : bar.color"
                         :style="{ width: bar.percent + '%' }">
                      <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_6px)]"></div>
                      <div class="absolute right-0 top-0 bottom-0 w-[2px] bg-white animate-bar-breath"></div>
                    </div>
                  </div>

                  <span class="font-mono text-[15px] font-bold w-12 text-right shrink-0 transition-colors duration-300"
                        :class="bar.isDanger ? 'text-[#e04060] drop-shadow-[0_0_6px_#e04060] animate-pulse' : bar.glow">
                    {{ bar.value }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Container Load -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center gap-3 mb-4">
                <div class="h-[1px] w-4 bg-[#5ec4e6] shadow-[0_0_5px_#5ec4e6]"></div>
                <span class="text-[#5ec4e6] text-[11px] font-bold tracking-[3px] uppercase">容器载荷 [LOAD]</span>
                <div class="flex-1 h-px bg-gradient-to-r from-[#5ec4e6]/40 to-transparent"></div>
              </div>

              <div class="space-y-3.5">
                <div v-for="bar in containerBars" :key="bar.id" class="flex items-center gap-3 group">
                  <div class="w-7 h-7 flex items-center justify-center border rounded-[3px] shrink-0 transition-colors"
                       :class="bar.isDanger ? 'border-[#e04060]/60 bg-[#e04060]/15 text-[#e04060] shadow-[0_0_10px_rgba(224,64,96,0.3)]' : 'border-[#5ec4e6]/30 bg-[#5ec4e6]/5 text-[#5ec4e6] shadow-[0_0_10px_rgba(94,196,230,0.1)]'">
                    <i :class="bar.icon" class="text-[13px]"></i>
                  </div>
                  <span class="text-[#7cb3c7] text-[12px] font-bold tracking-[2px] w-10 shrink-0">{{ bar.label }}</span>

                  <div class="flex-1 h-[14px] bg-[#06090e] border border-[#174257] p-[2px] flex relative group-hover:border-[#5ec4e6]/50 transition-colors overflow-hidden">
                    <div class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(94,196,230,0.05)_10%,rgba(94,196,230,0.05)_10.5%)] pointer-events-none"></div>
                    <div class="h-full relative transition-all duration-500 overflow-hidden bg-gradient-to-r"
                         :class="bar.isDanger ? 'from-[#e04060]/40 to-[#e04060] shadow-[0_0_12px_#e04060]' : bar.color"
                         :style="{ width: bar.percent + '%' }">
                      <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_6px)]"></div>
                      <div class="absolute right-0 top-0 bottom-0 w-[2px] bg-white animate-bar-breath"></div>
                    </div>
                  </div>

                  <span class="font-mono text-[15px] font-bold w-12 text-right shrink-0 transition-colors duration-300"
                        :class="bar.isDanger ? 'text-[#e04060] drop-shadow-[0_0_6px_#e04060] animate-pulse' : bar.glow">
                    {{ bar.value }}
                  </span>
                </div>
              </div>
            </div>
            </div>

            <!-- Right Side: Status Monitoring (Sidebar) -->
            <div class="w-[200px] shrink-0 border-l border-[#174257]/60 pl-5 flex flex-col gap-4 relative">
              <div class="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#5ec4e6]/60 via-transparent to-transparent"></div>

              <div class="flex items-center gap-3 mb-1">
                <div class="h-[1px] w-4 bg-[#5ec4e6] shadow-[0_0_5px_#5ec4e6]"></div>
                <span class="text-[#5ec4e6] text-[11px] font-bold tracking-[3px] uppercase">状态监控</span>
                <div class="flex-1 h-px bg-gradient-to-r from-[#5ec4e6]/40 to-transparent"></div>
              </div>

              <div class="flex flex-col gap-3">
                <!-- Mental Wall Card -->
              <div class="bg-[#06090e] border border-[#174257] rounded-[3px] flex flex-col overflow-hidden hover:border-[#5ec4e6]/50 transition-colors">
                <div class="px-2 py-1 bg-[#174257]/30 border-b border-[#174257] flex justify-between items-center">
                  <span class="text-[#3d6f82] text-[9px] font-mono uppercase tracking-widest">Mental</span>
                  <i class="fas fa-brain text-[#3d6f82] text-[10px]"></i>
                </div>
                <div class="px-2.5 py-2 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="mentalTag.dot"></span>
                  <span class="text-[11px] font-bold tracking-wider truncate" :class="mentalTag.text">{{ state.mentalWall }}</span>
                </div>
              </div>

              <!-- Heat Stage Card -->
              <div class="bg-[#06090e] border border-[#174257] rounded-[3px] flex flex-col overflow-hidden hover:border-[#5ec4e6]/50 transition-colors">
                <div class="px-2 py-1 bg-[#174257]/30 border-b border-[#174257] flex justify-between items-center">
                  <span class="text-[#3d6f82] text-[9px] font-mono uppercase tracking-widest">Heat</span>
                  <i class="fas fa-fire text-[#3d6f82] text-[10px]"></i>
                </div>
                <div class="px-2.5 py-2 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="heatTag.dot"></span>
                  <span class="text-[11px] font-bold tracking-wider truncate" :class="heatTag.text">{{ heatTag.name }}</span>
                </div>
              </div>

              <!-- Absorb Rate Card -->
              <div class="bg-[#06090e] border border-[#174257] rounded-[3px] flex flex-col overflow-hidden hover:border-[#5ec4e6]/50 transition-colors">
                <div class="px-2 py-1 bg-[#174257]/30 border-b border-[#174257] flex justify-between items-center">
                  <span class="text-[#3d6f82] text-[9px] font-mono uppercase tracking-widest">Absorb</span>
                  <i class="fas fa-tint text-[#3d6f82] text-[10px]"></i>
                </div>
                <div class="px-2.5 py-2 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0 bg-[#4cd47a] shadow-[0_0_4px_#4cd47a]"></span>
                  <span class="text-[#4cd47a] text-[11px] font-bold tracking-wider truncate">{{ absorbRateShort }}</span>
                </div>
              </div>
            </div>

            <!-- Active Physio Flags -->
            <div class="bg-[#06090e] border border-[#174257] rounded-[3px] flex flex-col relative group overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-[#174257] group-hover:bg-[#5ec4e6]/60 transition-colors z-10"></div>
              <div class="px-3 py-1.5 bg-[#174257]/15 flex items-center gap-2 border-b border-[#174257]/50">
                <i class="fas fa-heartbeat text-[#3d6f82] text-[11px] animate-pulse"></i>
                <span class="text-[#5ec4e6] text-[10px] font-mono uppercase tracking-widest">Active Signs</span>
              </div>
              <div class="p-2.5 flex flex-wrap gap-2 min-h-[44px] items-center">
                <div v-for="(p, i) in physioTags" :key="i" class="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold rounded-[2px] border" :class="p.classes">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="p.dot"></span>
                  {{ p.name }}
                </div>
                <!-- Fallback if array is empty -->
                <span v-if="physioTags.length === 0" class="text-[#3d6f82] text-[11px] font-mono pl-1">NO ABNORMALITIES DETECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-transparent via-[#5ec4e6]/15 to-transparent mb-0"></div>

        <!-- Accordions -->

        <!-- Contact Records -->
        <div class="border-b border-[#5ec4e6]/15">
          <div class="flex justify-between items-center px-5 py-3 cursor-pointer bg-black/25 hover:bg-[#5ec4e6]/10 transition-colors" @click="isRecCollapsed = !isRecCollapsed">
            <span class="text-[#5ec4e6] text-[13px] font-bold tracking-wide flex items-center gap-2">
              <i class="fas fa-database text-[13px]"></i> 接触与损耗记录
            </span>
            <span class="text-[#7cb3c7] text-sm transition-transform duration-200" :class="{ 'rotate-[-90deg]': isRecCollapsed }">▼</span>
          </div>

          <div v-show="!isRecCollapsed" class="bg-black/15 p-5 pb-6 border-t border-[#5ec4e6]/10">
            <!-- Recent Event -->
            <div class="mb-4">
              <div class="text-[#7cb3c7] text-[11px] font-bold tracking-[2px] uppercase mb-3 flex items-center gap-1.5">
                <span class="text-[12px] text-[#5ec4e6]">▸</span> 近期事件报告
              </div>

              <div class="flex items-center gap-3 bg-black/35 border border-[#5ec4e6]/15 border-l-[3px] border-l-[#5ec4e6] px-3 py-2 rounded-[3px] mb-2">
                <span class="text-[#3d6f82] text-[11px] tracking-wide min-w-[64px]">交互对象</span>
                <span class="text-white text-[13px] font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{{ record.last.target }} ({{ record.last.targetType }})</span>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-2">
                <div class="flex justify-between items-center bg-black/35 border border-[#5ec4e6]/15 px-3 py-1.5 rounded-[3px]">
                  <span class="text-[#3d6f82] text-[11px] tracking-wide">同步时间</span>
                  <span class="text-[#dbeef5] text-[13px] font-mono font-bold">{{ record.last.time }}</span>
                </div>
                <div class="flex justify-between items-center bg-black/35 border border-[#5ec4e6]/15 px-3 py-1.5 rounded-[3px]">
                  <span class="text-[#3d6f82] text-[11px] tracking-wide">接触时长</span>
                  <span class="text-[#dbeef5] text-[13px] font-mono font-bold">{{ record.last.duration }}</span>
                </div>
                <div class="flex justify-between items-center bg-black/35 border border-[#5ec4e6]/15 px-3 py-1.5 rounded-[3px]">
                  <span class="text-[#3d6f82] text-[11px] tracking-wide">侵入部位</span>
                  <span class="text-[#dbeef5] text-[13px] font-mono font-bold">{{ record.last.parts }}</span>
                </div>
                <div class="flex justify-between items-center bg-black/35 border border-[#5ec4e6]/15 px-3 py-1.5 rounded-[3px]">
                  <span class="text-[#3d6f82] text-[11px] tracking-wide">源质注入</span>
                  <span class="text-[#dbeef5] text-[13px] font-mono font-bold">{{ record.last.inject }}</span>
                </div>
                <div class="flex justify-between items-center bg-black/35 border border-[#5ec4e6]/15 px-3 py-1.5 rounded-[3px]">
                  <span class="text-[#3d6f82] text-[11px] tracking-wide">高潮激增</span>
                  <span class="text-[#dbeef5] text-[13px] font-mono font-bold">{{ record.last.orgasmCount }}</span>
                </div>
                <div class="flex justify-between items-center bg-black/35 border border-[#5ec4e6]/15 px-3 py-1.5 rounded-[3px]">
                  <span class="text-[#3d6f82] text-[11px] tracking-wide">刺激等级</span>
                  <span class="text-[#dbeef5] text-[13px] font-mono font-bold">{{ record.last.intensity }}</span>
                </div>
              </div>

              <div class="flex items-center gap-3 bg-black/35 border border-[#5ec4e6]/15 px-3 py-2 rounded-[3px] mb-2">
                <span class="text-[#3d6f82] text-[11px] tracking-wide min-w-[64px]">主控倾向</span>
                <span class="text-[#dbeef5] text-[13px] font-mono font-bold flex-1 text-right">{{ record.last.active }}</span>
              </div>
              <div class="flex items-center gap-3 bg-black/35 border border-[#5ec4e6]/15 px-3 py-2 rounded-[3px] mb-2">
                <span class="text-[#3d6f82] text-[11px] tracking-wide min-w-[64px]">数值波动</span>
                <span class="text-[#dbeef5] text-[13px] font-mono font-bold flex-1 text-right">{{ impactText }}</span>
              </div>
              <div v-if="specialsText" class="flex items-center gap-3 bg-[#e07040]/5 border border-[#e07040]/35 border-l-[3px] border-l-[#e07040] px-3 py-2 rounded-[3px] mb-2">
                <span class="text-[#e07040] text-[11px] tracking-wide min-w-[64px]">异常生理</span>
                <span class="text-[#e07040] text-[13px] font-mono font-bold flex-1 text-right">{{ specialsText }}</span>
              </div>

              <div class="flex items-baseline gap-3 mt-3">
                <span class="text-[#3d6f82] text-[12px] min-w-[64px] text-right shrink-0">单位自检</span>
                <span class="text-[#5ab8a0] text-[12px] italic leading-relaxed border-l-2 border-[#5ab8a0]/50 bg-[#5ab8a0]/5 px-2.5 py-1.5 rounded-r-[3px]">"{{ record.last.comment }}"</span>
              </div>
            </div>

            <!-- Global Stats -->
            <div class="pt-4 border-t border-black/30">
              <div class="text-[#7cb3c7] text-[11px] font-bold tracking-[2px] uppercase mb-3 flex items-center gap-1.5">
                <span class="text-[12px] text-[#5ec4e6]">▸</span> 全周期数据累加
              </div>
              <div class="grid grid-cols-3 gap-2.5">
                <div class="bg-black/40 border border-[#5ec4e6]/15 rounded-[4px] py-3 px-2 text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#5ec4e6]/40 before:to-transparent">
                  <span class="block font-mono text-[#5ec4e6] text-[22px] font-bold leading-tight drop-shadow-[0_0_10px_rgba(94,196,230,0.4)]">{{ record.stats.total }}</span>
                  <span class="block text-[#3d6f82] text-[11px] mt-1.5 tracking-wide">总役次数</span>
                </div>
                <div class="bg-black/40 border border-[#5ec4e6]/15 rounded-[4px] py-3 px-2 text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#5ec4e6]/40 before:to-transparent">
                  <span class="block font-mono text-[#5ec4e6] text-[22px] font-bold leading-tight drop-shadow-[0_0_10px_rgba(94,196,230,0.4)]">{{ record.stats.human }}</span>
                  <span class="block text-[#3d6f82] text-[11px] mt-1.5 tracking-wide">人类接触</span>
                </div>
                <div class="bg-black/40 border border-[#5ec4e6]/15 rounded-[4px] py-3 px-2 text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#5ec4e6]/40 before:to-transparent">
                  <span class="block font-mono text-[#5ec4e6] text-[22px] font-bold leading-tight drop-shadow-[0_0_10px_rgba(94,196,230,0.4)]">{{ record.stats.alien }}</span>
                  <span class="block text-[#3d6f82] text-[11px] mt-1.5 tracking-wide">异化体接触</span>
                </div>
                <div class="bg-black/40 border border-[#5ec4e6]/15 rounded-[4px] py-3 px-2 text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#5ec4e6]/40 before:to-transparent">
                  <span class="block font-mono text-[#5ec4e6] text-[22px] font-bold leading-tight drop-shadow-[0_0_10px_rgba(94,196,230,0.4)]">{{ record.stats.orgasms }}</span>
                  <span class="block text-[#3d6f82] text-[11px] mt-1.5 tracking-wide">高潮总频次</span>
                </div>
                <div class="bg-black/40 border border-[#5ec4e6]/15 rounded-[4px] py-3 px-2 text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#5ec4e6]/40 before:to-transparent">
                  <span class="block font-mono text-[#5ec4e6] text-[15px] mt-[5px] font-bold leading-tight drop-shadow-[0_0_10px_rgba(94,196,230,0.4)]">{{ record.stats.longest }}</span>
                  <span class="block text-[#3d6f82] text-[11px] mt-[7px] tracking-wide">耐受峰值时长</span>
                </div>
                <div class="bg-black/40 border border-[#5ec4e6]/15 rounded-[4px] py-3 px-2 text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#5ec4e6]/40 before:to-transparent">
                  <span class="block font-mono text-[#5ec4e6] text-[22px] font-bold leading-tight drop-shadow-[0_0_10px_rgba(94,196,230,0.4)]">{{ record.stats.maxOrg }}</span>
                  <span class="block text-[#3d6f82] text-[11px] mt-1.5 tracking-wide">单次绝顶纪录</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Incubation Records -->
        <div class="border-b border-[#5ec4e6]/15">
          <div class="flex justify-between items-center px-5 py-3 cursor-pointer bg-black/25 hover:bg-[#5ec4e6]/10 transition-colors" @click="isPregCollapsed = !isPregCollapsed">
            <span class="text-[#5ec4e6] text-[13px] font-bold tracking-wide flex items-center gap-2">
              <i class="fas fa-microscope text-[13px]"></i> 生物寄宿侦测
              <span class="text-[#7cb3c7] text-[12px] ml-1 font-mono tracking-widest bg-[#5ec4e6]/10 px-1.5 py-0.5 rounded border border-[#5ec4e6]/30">{{ preg.count }} / {{ preg.cap }}</span>
            </span>
            <span class="text-[#7cb3c7] text-sm transition-transform duration-200" :class="{ 'rotate-[-90deg]': isPregCollapsed }">▼</span>
          </div>

          <div v-show="!isPregCollapsed" class="bg-black/10 py-4 border-t border-[#5ec4e6]/10">

            <div class="px-5 space-y-3">
              <template v-if="pregnancyEntries.length > 0">
                <div v-for="entry in pregnancyEntries" :key="entry.id" class="bg-black/30 border border-[#5ec4e6]/15 border-l-[3px] border-l-[#e07040] rounded-[3px] p-3.5">
                  <div class="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                    <span class="font-mono text-white text-[13px] font-bold">⬡ {{ entry.id }} <span class="ml-1 text-[#7cb3c7] font-sans font-normal text-xs">[{{ entry.type }}]</span></span>
                    <span class="text-[11px] px-2.5 py-1 rounded-[3px] font-bold flex items-center gap-1.5" :class="entry.stageClasses">
                      <span class="w-1.5 h-1.5 rounded-full" :class="entry.stageDot"></span>{{ entry.stage }}
                    </span>
                  </div>
                  <div class="text-[12px] text-[#3d6f82] leading-[1.7]">
                    供体：<span class="text-[#dbeef5] font-medium">{{ entry.source }}</span> ({{ entry.sourceType }})<br>
                    着床：<span class="text-[#dbeef5] font-medium">{{ entry.sites }}</span>　规模：<span class="text-[#dbeef5] font-medium">{{ entry.amount }}</span>　体型：<span class="text-[#dbeef5] font-medium">{{ entry.size }}</span><br>
                    载入：<span class="text-[#dbeef5] font-medium font-mono">{{ entry.time }}</span>　预估释出：<span class="text-[#dbeef5] font-medium font-mono">{{ entry.estimate }}</span>
                  </div>
                  <div class="mt-2.5 h-[6px] bg-black/50 border border-white/5 rounded-[3px] overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-[#4cd47a] via-[#d4b438] to-[#e04060] rounded-[3px]" :style="{ width: entry.progress + '%' }"></div>
                  </div>
                  <div v-if="entry.comment" class="mt-2 bg-[#5ab8a0]/5 border-l-2 border-[#5ab8a0]/50 px-2.5 py-1.5 rounded-r-[3px] text-[12px] italic text-[#5ab8a0]">
                    "{{ entry.comment }}"
                  </div>
                </div>
              </template>
              <div v-else class="text-center text-[#3d6f82] text-[12px] py-6 tracking-wide">
                [ 扫描完毕 · 当前寄宿区无活跃体 ]
              </div>
            </div>

            <div class="flex items-center gap-5 px-5 py-3.5 mt-2 bg-black/20 border-y border-white/5">
              <div class="text-[#3d6f82] text-[11px]">载录周期：<span class="text-[#dbeef5] font-mono text-[14px] font-bold ml-0.5">{{ preg.birthTotal }}</span> 回</div>
              <div class="text-[#3d6f82] text-[11px]">幼体排出：<span class="text-[#dbeef5] font-mono text-[14px] font-bold ml-0.5">{{ preg.birthOffspring }}</span> 只</div>
            </div>

            <div v-if="preg.lastBirth" class="px-5 mt-4">
              <div class="flex items-center gap-3 bg-[#e04060]/5 border border-[#e04060]/30 rounded-t-[3px] px-3 py-2">
                <span class="text-[#e04060] text-[11px] tracking-wide min-w-[64px] font-bold">最新释出</span>
                <span class="text-white text-[13px] font-bold flex-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{{ preg.lastBirth.title }}</span>
                <span class="text-[#3d6f82] font-mono text-[12px]">{{ preg.lastBirth.time }}</span>
              </div>
              <div class="bg-black/25 border border-[#5ec4e6]/15 border-t-0 rounded-b-[3px] p-3.5 py-2">
                <div class="flex justify-between mb-1.5"><span class="text-[#3d6f82] text-[11px]">排出身位</span><span class="text-[#dbeef5] text-[12px] font-bold">{{ preg.lastBirth.part }}</span></div>
                <div class="flex justify-between mb-1.5"><span class="text-[#3d6f82] text-[11px]">体型规格</span><span class="text-[#dbeef5] text-[12px] font-bold">{{ preg.lastBirth.size }}</span></div>
                <div class="flex justify-between"><span class="text-[#3d6f82] text-[11px]">神经负荷</span><span class="text-[#e04060] text-[12px] font-bold">{{ preg.lastBirth.exp }}</span></div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Environment Footer -->
      <div class="relative z-10 bg-[#06090e]/90 border-t border-[#174257]">
        <!-- System Log Ticker -->
        <div class="px-5 py-1.5 border-b border-[#174257]/40 overflow-hidden">
          <div class="syslog-track flex gap-8 whitespace-nowrap">
            <span v-for="(log, i) in sysLogs" :key="i" class="text-[#3d6f82] text-[10px] font-mono tracking-wide shrink-0">
              <span class="text-[#174257]">[{{ log.time }}]</span> {{ log.msg }}
            </span>
          </div>
        </div>
        <!-- Terminal Prompt -->
        <div class="px-5 py-1 border-b border-[#174257]/40 flex items-center gap-2">
          <span class="text-[#5ec4e6] text-[10px] font-mono tracking-widest">H.U.D.F://TAC-TERM&gt;</span>
          <span class="text-[#7cb3c7] text-[10px] font-mono tracking-wide">{{ cmdText }}</span>
          <span class="w-[6px] h-[12px] bg-[#5ec4e6] animate-blink-cursor"></span>
        </div>
        <!-- Env Data -->
        <div class="px-5 py-3 flex flex-wrap justify-between items-center gap-2">
          <div class="text-[#3d6f82] text-[11px] flex items-center gap-1.5 tracking-wide">
            <span class="w-[7px] h-[7px] rounded-full shadow-[0_0_6px_currentColor] animate-pulse" :class="envTag.dot"></span>
            诱导浓度: <span class="text-[#5ec4e6] font-mono text-[13px] font-bold ml-0.5">{{ state.pheromone }}%</span>
          </div>
          <div class="text-[#3d6f82] text-[11px] flex items-center gap-1.5 tracking-wide">战区: <span class="text-[#5ec4e6] font-bold text-[12px] drop-shadow-[0_0_5px_rgba(94,196,230,0.3)]">{{ state.combat }}</span></div>
          <div class="text-[#3d6f82] text-[11px] flex items-center gap-1.5 tracking-wide">时间: <span class="text-[#5ec4e6] font-bold font-mono text-[12px] drop-shadow-[0_0_5px_rgba(94,196,230,0.3)]">{{ state.time }}</span></div>
          <div class="text-[#3d6f82] text-[11px] flex items-center gap-1.5 tracking-wide">位置: <span class="text-[#5ec4e6] font-bold text-[12px] drop-shadow-[0_0_5px_rgba(94,196,230,0.3)]">{{ state.location }}</span></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import _ from 'lodash';

// Collapsible states
const isCollapsed = ref(false);
const isRecCollapsed = ref(true);
const isPregCollapsed = ref(true);

// UI decorative state
const liveClock = ref('--:--');
const liveSeconds = ref('--');
const signalBars = ref(3);
const cipherIndex = ref(0);
const cipherText = ref('AES-256-GCM');
const glitchTrigger = ref(false);
const syncTimestamp = ref('--:--:--');
const dataBuffer = ref(100);
const cmdIndex = ref(0);
const cmdText = ref('monitor --pid=LINHAO --continuous');
const ecgPhase = ref(0);

const ciphers = ['AES-256-GCM', 'QUANTUM-KEY', 'GHOST-PROTO', 'CHACHA20', 'ECDH-P521', 'HMAC-SHA3'];
const commands = [
  'monitor --pid=LINHAO --continuous',
  'trace --signal=bio-feedback --live',
  'sync --target=H.U.D.F://TAC-TERM --interval=2s',
  'watch --var=sanity,heat,lewd,orgasm',
  'log --level=ALL --output=buffer',
  'ping --host=GHOST-PROTO://PRIMARCH',
  'scan --range=pheromone --threshold=20%',
  'report --format=TAC-BRIEF --auto',
];

const sysLogs = ref([
  { time: '00:00', msg: '终端初始化完成 · 加密握手成功' },
  { time: '00:00', msg: '生物传感器阵列在线 · 6/6 通道活跃' },
  { time: '00:00', msg: '幽灵协议链路确认 · PRIMARCH 锚点已同步' },
  { time: '00:00', msg: 'H.U.D.F 战术网络接入 · 延迟 12ms' },
  { time: '00:00', msg: '环境诱导液传感器校准完成' },
  { time: '00:00', msg: '孕育监测子系统待命中 · 容量 5/5' },
]);

// Mock/Global state fallback
const state = reactive({
  sanity: 100,
  heat: 0,
  lewd: 30,
  orgasm: 0,
  energy: 80,
  fluid: 0,
  mentalWall: '铁壁封锁',
  physioStates: ['冷静备战'],
  absorbRate: '无近期注入',
  pheromone: 0,
  combat: '未知',
  time: '—',
  location: '—'
});

// Records state
const record = reactive({
  last: {
    target: '—', targetType: '—', time: '无记录', parts: '—', duration: '—',
    orgasmCount: 0, intensity: '—', active: '强制随动', inject: 0, comment: '无评价'
  },
  impact: {
    sanityDelta: 0, heatDelta: 0, lewdDelta: 0, fluidDelta: 0, specials: [] as string[]
  },
  stats: {
    total: 0, human: 0, alien: 0, orgasms: 0, longest: '—', maxOrg: 0
  }
});

// Pregnancy state
const preg = reactive({
  count: 0, cap: 5, records: {} as Record<string, any>,
  birthTotal: 0, birthOffspring: 0, lastBirth: null as any
});

// Sync data loop
let timer: number;

const syncData = () => {
  const getVars = (window as any).getAllVariables;
  if (!getVars) return;

  const allVars = getVars() || {};
  const lh = _.get(allVars, 'stat_data.林昊', {});
  const world = _.get(allVars, 'stat_data.世界', {});

  // Core
  state.sanity = _.get(lh, '理智值', 100);
  state.heat = _.get(lh, '情热值', 0);
  state.lewd = _.get(lh, '淫荡值', 30);
  state.orgasm = _.get(lh, '高潮值', 0);
  state.energy = _.get(lh, '能量饱食度', 80);
  state.fluid = _.get(lh, '腹腔积液量', 0);
  state.mentalWall = _.get(lh, '_心理防线', '铁壁封锁');
  state.physioStates = _.get(lh, '_生理状态', ['冷静备战']);
  state.absorbRate = _.get(lh, '当前吸收效率', '无近期注入');

  // Environment
  state.pheromone = _.get(world, '异化体诱导液浓度', 0);
  state.combat = _.get(world, '当前战况', '未知');
  state.time = _.get(world, '当前时间', '—');
  state.location = _.get(world, '当前位置', '—');

  // Records
  const rec = _.get(lh, '性交记录', {});
  const last = _.get(rec, '最近一次', {});
  const impact = _.get(rec, '影响记录', {});
  const stats = _.get(rec, '累计统计', {});

  record.last.target = _.get(last, '对象', '—');
  record.last.targetType = _.get(last, '对象类型', '—');
  const parts = _.get(last, '性交部位', []);
  record.last.parts = Array.isArray(parts) && parts.length > 0 ? parts.join('、') : '—';
  record.last.time = _.get(last, '时间', '无记录');
  record.last.duration = _.get(last, '持续时长', '—');
  record.last.orgasmCount = _.get(last, '高潮次数', 0);
  record.last.intensity = _.get(last, '强度等级', '—');
  record.last.active = _.get(last, '是否主动', false) ? '主动应答' : '强制随动';
  record.last.inject = _.get(last, '源质注入量', 0);
  record.last.comment = _.get(last, '林昊评价', '无评价');

  record.impact.sanityDelta = _.get(impact, '理智变化', 0);
  record.impact.heatDelta = _.get(impact, '情热变化', 0);
  record.impact.lewdDelta = _.get(impact, '淫荡变化', 0);
  record.impact.fluidDelta = _.get(impact, '_腹腔积液变化', 0);
  record.impact.specials = _.get(impact, '特殊效果', []);

  record.stats.total = _.get(stats, '总次数', 0);
  record.stats.human = _.get(stats, '人类交合次数', 0);
  record.stats.alien = _.get(stats, '异化体交合次数', 0);
  record.stats.orgasms = _.get(stats, '总高潮次数', 0);
  record.stats.longest = _.get(stats, '最长单次持续', '—');
  record.stats.maxOrg = _.get(stats, '最高单次高潮数', 0);

  // Pregnancy
  const p = _.get(lh, '孕育状态', {});
  preg.count = _.get(p, '当前怀孕数', 0);
  preg.cap = _.get(p, '总孕育容量', 5);
  preg.records = _.get(p, '孕育记录', {});

  const birthHistory = _.get(p, '生产历史', {});
  preg.birthTotal = _.get(birthHistory, '总生产次数', 0);
  preg.birthOffspring = _.get(birthHistory, '总产出数量', 0);

  const lb = _.get(birthHistory, '最近一次生产', {});
  if (preg.birthTotal > 0) {
    preg.lastBirth = {
      title: `${_.get(lb, '产出种类', '—')} ×${_.get(lb, '产出数量', 0)}`,
      time: _.get(lb, '时间', '无记录'),
      part: _.get(lb, '生产部位', '—'),
      size: _.get(lb, '胎儿体型', '—'),
      exp: _.get(lb, '生产体验', '—')
    };
  } else {
    preg.lastBirth = null;
  }
};

// Computed Mappings

const calcPercent = (val: number, max: number) => Math.min(100, Math.max(0, (val / max) * 100));

const coreBars = computed(() => [
  { id: 'sanity', icon: 'fas fa-brain', label: '理智', value: state.sanity, percent: calcPercent(state.sanity, 100), color: 'from-[#5ec4e6]/20 to-[#5ec4e6] shadow-[0_0_12px_rgba(94,196,230,0.5)]', glow: 'text-[#dbeef5] drop-shadow-[0_0_6px_#5ec4e6]', isDanger: state.sanity <= 30 },
  { id: 'heat', icon: 'fas fa-temperature-high', label: '情热', value: state.heat, percent: calcPercent(state.heat, 100), color: 'from-[#e8754a]/20 to-[#e8754a] shadow-[0_0_12px_rgba(232,117,74,0.5)]', glow: 'text-[#ffebd9] drop-shadow-[0_0_6px_#e8754a]', isDanger: state.heat >= 60 },
  { id: 'lewd', icon: 'fas fa-dna', label: '淫荡', value: state.lewd, percent: calcPercent(state.lewd, 100), color: 'from-[#b85ce6]/20 to-[#b85ce6] shadow-[0_0_12px_rgba(184,92,230,0.5)]', glow: 'text-[#f4d9ff] drop-shadow-[0_0_6px_#b85ce6]', isDanger: false },
  { id: 'orgasm', icon: 'fas fa-bolt', label: '高潮', value: state.orgasm, percent: calcPercent(state.orgasm, 999), color: 'from-[#e6c45e]/20 to-[#e6c45e] shadow-[0_0_12px_rgba(230,196,94,0.5)]', glow: 'text-[#fff8d9] drop-shadow-[0_0_6px_#e6c45e]', isDanger: false }
]);

const containerBars = computed(() => [
  { id: 'energy', icon: 'fas fa-battery-half', label: '能量', value: state.energy, percent: calcPercent(state.energy, 100), color: 'from-[#4cd47a]/20 to-[#4cd47a] shadow-[0_0_12px_rgba(76,212,122,0.5)]', glow: 'text-[#d9ffea] drop-shadow-[0_0_6px_#4cd47a]', isDanger: state.energy <= 30 },
  { id: 'fluid', icon: 'fas fa-tint', label: '积液', value: state.fluid, percent: calcPercent(state.fluid, 100), color: 'from-[#5a9ae8]/20 to-[#5a9ae8] shadow-[0_0_12px_rgba(90,154,232,0.5)]', glow: 'text-[#d9edff] drop-shadow-[0_0_6px_#5a9ae8]', isDanger: state.fluid >= 60 }
]);

const absorbRateShort = computed(() => state.absorbRate.replace(/（最优）|（次优）|（低效）/g, ''));

const mentalTag = computed(() => {
  let text = 'text-[#5ec4e6]';
  let dot = 'bg-[#5ec4e6] shadow-[0_0_4px_#5ec4e6]';
  if (state.sanity < 20 || state.sanity < 40) {
    text = 'text-[#e04060]';
    dot = 'bg-[#e04060] shadow-[0_0_6px_#e04060] animate-pulse';
  } else if (state.sanity < 60) {
    text = 'text-[#d4b438]';
    dot = 'bg-[#d4b438] shadow-[0_0_4px_#d4b438]';
  }
  return { text, dot };
});

const heatTag = computed(() => {
  let name = '性器休眠';
  let text = 'text-[#5ec4e6]';
  let dot = 'bg-[#5ec4e6] shadow-[0_0_4px_#5ec4e6]';

  if (state.heat < 20) { name = '性器休眠'; }
  else if (state.heat < 40) { name = '体温微升'; text = 'text-[#e8754a]'; dot = 'bg-[#e8754a] shadow-[0_0_4px_#e8754a]'; }
  else if (state.heat < 60) { name = '肉体叛离'; text = 'text-[#e07040]'; dot = 'bg-[#e07040] shadow-[0_0_5px_#e07040]'; }
  else if (state.heat < 80) { name = '强制发情'; text = 'text-[#ff6b8b]'; dot = 'bg-[#ff6b8b] shadow-[0_0_6px_#ff6b8b] animate-pulse'; }
  else { name = '失控淫热'; text = 'text-[#ff6b8b]'; dot = 'bg-[#ff6b8b] shadow-[0_0_6px_#ff6b8b] animate-pulse'; }

  return { name, text, dot };
});

const physioTags = computed(() => {
  const alertStates = ['强制发情', '失控发情', '源质饥渴', '源质饥渴待机', '诱导液中毒', '强制昏睡', '生产中'];
  const criticalStates = ['失控发情', '诱导液中毒', '强制昏睡'];

  return (Array.isArray(state.physioStates) ? state.physioStates : []).map(s => {
    let classes = 'bg-[#4cd47a]/10 text-[#4cd47a] border-[#4cd47a]/30';
    let dot = 'bg-[#4cd47a] shadow-[0_0_4px_#4cd47a]';
    if (criticalStates.includes(s)) {
      classes = 'bg-[#e04060]/15 text-[#ff6b8b] border-[#e04060]/40';
      dot = 'bg-[#ff6b8b] shadow-[0_0_6px_#ff6b8b] animate-pulse';
    } else if (alertStates.includes(s)) {
      classes = 'bg-[#e07040]/10 text-[#e07040] border-[#e07040]/30';
      dot = 'bg-[#e07040] shadow-[0_0_4px_#e07040]';
    }
    return { name: s, classes, dot };
  });
});

const envTag = computed(() => {
  let dot = 'bg-[#4cd47a] text-[#4cd47a]';
  if (state.pheromone >= 80) dot = 'bg-[#e04060] text-[#e04060] animate-pulse';
  else if (state.pheromone >= 50) dot = 'bg-[#e07040] text-[#e07040]';
  else if (state.pheromone >= 20) dot = 'bg-[#d4b438] text-[#d4b438]';
  return { dot };
});

const impactText = computed(() => {
  const parts = [];
  if (record.impact.sanityDelta !== 0) parts.push(`理智${record.impact.sanityDelta > 0 ? '+' : ''}${record.impact.sanityDelta}`);
  if (record.impact.heatDelta !== 0) parts.push(`情热${record.impact.heatDelta > 0 ? '+' : ''}${record.impact.heatDelta}`);
  if (record.impact.lewdDelta !== 0) parts.push(`肉体${record.impact.lewdDelta > 0 ? '+' : ''}${record.impact.lewdDelta}`);
  if (record.impact.fluidDelta !== 0) parts.push(`积液+${record.impact.fluidDelta}`);
  return parts.length > 0 ? parts.join(' · ') : '无数值波动';
});

const specialsText = computed(() => {
  return record.impact.specials && record.impact.specials.length > 0 ? record.impact.specials.join('；') : '';
});

const pregnancyEntries = computed(() => {
  return Object.entries(preg.records).map(([id, r]: [string, any]) => {
    const stage = _.get(r, '_当前发育阶段', '刚着床');
    let stageClasses = 'bg-[#4cd47a]/15 text-[#4cd47a] border border-[#4cd47a]/20';
    let stageDot = 'bg-[#4cd47a]';
    if (stage === '生产中') { stageClasses = 'bg-[#e04060]/20 text-[#ff6b8b] border border-[#e04060]/50'; stageDot = 'bg-[#ff6b8b] shadow-[0_0_6px_#ff6b8b] animate-pulse'; }
    else if (stage === '临产期') { stageClasses = 'bg-[#e07040]/15 text-[#e07040] border border-[#e07040]/30'; stageDot = 'bg-[#e07040] shadow-[0_0_4px_#e07040]'; }
    else if (stage === '活跃期' || stage === '成形期') { stageClasses = 'bg-[#d4b438]/15 text-[#d4b438] border border-[#d4b438]/30'; stageDot = 'bg-[#d4b438]'; }

    const sitesArr = _.get(r, '着床部位', []);
    const sitesText = Array.isArray(sitesArr) ? sitesArr.join('、') : String(sitesArr);

    return {
      id,
      type: _.get(r, '后代种类', '未知'),
      stage,
      stageClasses,
      stageDot,
      source: _.get(r, '来源', '—'),
      sourceType: _.get(r, '来源类型', '—'),
      sites: sitesText,
      amount: _.get(r, '后代数量', 1),
      size: _.get(r, '胎儿体型', '—'),
      time: _.get(r, '受孕时间', '—'),
      estimate: _.get(r, '预计生产时间', '—'),
      progress: _.get(r, '发育进度', 0),
      comment: _.get(r, '林昊感受', '') && _.get(r, '林昊感受', '') !== '未记录' ? _.get(r, '林昊感受', '') : ''
    };
  });
});

// ── UI Decorative Computed ──

const sysStatus = computed(() => {
  const critical = state.sanity <= 20 || state.heat >= 80 || state.energy <= 20;
  const warn = state.sanity <= 50 || state.heat >= 60 || state.energy <= 40;
  if (critical) return { label: 'SYS.ALERT', class: 'text-[#e04060]', dot: 'bg-[#e04060] shadow-[0_0_6px_#e04060] animate-pulse' };
  if (warn) return { label: 'SYS.CAUTION', class: 'text-[#d4b438]', dot: 'bg-[#d4b438] shadow-[0_0_4px_#d4b438]' };
  return { label: 'SYS.NOMINAL', class: 'text-[#4cd47a]', dot: 'bg-[#4cd47a] shadow-[0_0_4px_#4cd47a]' };
});

const threatLevel = computed(() => {
  const p = state.pheromone;
  if (p >= 80) return { label: 'CODE:BLACK', class: 'text-[#e04060] drop-shadow-[0_0_6px_#e04060] animate-pulse' };
  if (p >= 50) return { label: 'CODE:CRIMSON', class: 'text-[#e07040] drop-shadow-[0_0_4px_#e07040]' };
  if (p >= 20) return { label: 'CODE:AMBER', class: 'text-[#d4b438]' };
  return { label: 'CODE:GREEN', class: 'text-[#4cd47a]' };
});

const ecgClass = computed(() => {
  if (state.sanity <= 0) return 'text-[#e04060] ecg-flatline';
  if (state.sanity <= 30) return 'text-[#e04060]';
  if (state.sanity <= 60) return 'text-[#d4b438]';
  return 'text-[#5ec4e6]';
});

const ecgPoints = computed(() => {
  const phase = ecgPhase.value;
  const pts: string[] = [];
  for (let x = 0; x <= 80; x += 2) {
    let y = 12;
    const t = (x + phase) % 80;
    if (t < 8) y = 12 - (t / 8) * 4;
    else if (t < 10) y = 8 + (t - 8) * 4;
    else if (t < 12) y = 16 - (t - 10) * 8;
    else if (t < 14) y = 0 + (t - 12) * 8;
    else if (t < 16) y = 16 - (t - 14) * 4;
    else if (t < 20) y = 12 + Math.sin((t - 16) * 2) * 1.5;
    else y = 12 + Math.sin(t * 0.3) * 1.5;
    pts.push(`${x},${Math.round(y)}`);
  }
  return pts.join(' ');
});

// ── Decorative Timers ──

let decoTimer: number;
let ecgTimer: number;
let glitchTimer: number;

const updateDeco = () => {
  const now = new Date();
  liveClock.value = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  liveSeconds.value = now.getSeconds().toString().padStart(2, '0');
  syncTimestamp.value = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');

  signalBars.value = Math.random() > 0.3 ? 4 : (Math.random() > 0.5 ? 3 : 2);
  dataBuffer.value = Math.floor(85 + Math.random() * 15);

  if (Math.random() < 0.08) {
    cipherIndex.value = (cipherIndex.value + 1) % ciphers.length;
    cipherText.value = ciphers[cipherIndex.value];
  }

  if (Math.random() < 0.15) {
    cmdIndex.value = (cmdIndex.value + 1) % commands.length;
    cmdText.value = commands[cmdIndex.value];
  }

  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  sysLogs.value.forEach(log => { log.time = h + ':' + m; });
};

const updateEcg = () => {
  ecgPhase.value = (ecgPhase.value + 1) % 80;
};

const triggerGlitch = () => {
  glitchTrigger.value = true;
  setTimeout(() => { glitchTrigger.value = false; }, 150);
  glitchTimer = window.setTimeout(triggerGlitch, 8000 + Math.random() * 12000);
};

onMounted(() => {
  syncData();
  timer = window.setInterval(syncData, 2000);
  decoTimer = window.setInterval(updateDeco, 1000);
  ecgTimer = window.setInterval(updateEcg, 80);
  updateDeco();
  glitchTimer = window.setTimeout(triggerGlitch, 10000 + Math.random() * 15000);
});

onUnmounted(() => {
  clearInterval(timer);
  clearInterval(decoTimer);
  clearInterval(ecgTimer);
  clearTimeout(glitchTimer);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');

.font-mono {
  font-family: 'Rajdhani', 'Consolas', 'Courier New', monospace;
}

.animate-pulse {
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0% { opacity: 1; }
  50% { opacity: 0.65; }
  100% { opacity: 1; }
}

/* Breathing UI Elements */
.animate-bar-breath {
  animation: breath-glow 2.5s ease-in-out infinite;
}

@keyframes breath-glow {
  0%, 100% { opacity: 0.4; box-shadow: 0 0 4px rgba(255, 255, 255, 0.4); }
  50% { opacity: 1; box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px currentColor; }
}

.animate-top-breath {
  animation: top-glow 3s ease-in-out infinite;
}

@keyframes top-glow {
  0%, 100% { opacity: 0.8; box-shadow: 0 0 6px #5ec4e6; }
  50% { opacity: 1; box-shadow: 0 0 14px #5ec4e6; }
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.animate-scanline {
  animation: scanline 8s linear infinite;
}

@keyframes radar-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-radar-spin {
  animation: radar-spin 4s linear infinite;
  background: conic-gradient(from 0deg, transparent 70%, rgba(94,196,230,0.6) 100%);
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
::-webkit-scrollbar-thumb {
  background: rgba(94, 196, 230, 0.3);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(94, 196, 230, 0.5);
}

/* ═══════ HUD Corner Brackets ═══════ */
.hud-corners::before,
.hud-corners::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  z-index: 20;
  pointer-events: none;
}
.hud-corners::before {
  top: 5px;
  left: 5px;
  border-top: 1px solid rgba(94, 196, 230, 0.5);
  border-left: 1px solid rgba(94, 196, 230, 0.5);
}
.hud-corners::after {
  bottom: 5px;
  right: 5px;
  border-bottom: 1px solid rgba(94, 196, 230, 0.5);
  border-right: 1px solid rgba(94, 196, 230, 0.5);
}

/* ═══════ Data Particles ═══════ */
.data-particle {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 2px;
  background: rgba(94, 196, 230, 0.6);
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(94, 196, 230, 0.8);
  animation: particle-fall linear infinite;
}
@keyframes particle-fall {
  0% { transform: translateY(-4px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(calc(100vh - 200px)); opacity: 0; }
}

/* ═══════ Blink Animations ═══════ */
.animate-blink {
  animation: blink-cursor 1s step-end infinite;
}
.animate-blink-cursor {
  animation: blink-cursor 0.8s step-end infinite;
}
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ═══════ Glitch Effect ═══════ */
.animate-glitch {
  animation: glitch-skew 0.15s ease-in-out;
}
@keyframes glitch-skew {
  0% { transform: translate(0); text-shadow: 0 0 10px rgba(94,196,230,0.4); }
  20% { transform: translate(-2px, 1px); text-shadow: -2px 0 #e04060, 2px 0 #5ec4e6; }
  40% { transform: translate(2px, -1px); text-shadow: 2px 0 #5ec4e6, -2px 0 #e04060; }
  60% { transform: translate(-1px, 0); text-shadow: 0 0 10px rgba(94,196,230,0.4); }
  80% { transform: translate(1px, 1px); text-shadow: 1px 0 #e04060; }
  100% { transform: translate(0); text-shadow: 0 0 10px rgba(94,196,230,0.4); }
}

/* ═══════ Syslog Ticker ═══════ */
.syslog-track {
  display: inline-flex;
  animation: ticker-scroll 40s linear infinite;
}
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ═══════ ECG Waveform ═══════ */
.ecg-waveform {
  opacity: 0.8;
}
.ecg-waveform .ecg-line {
  filter: drop-shadow(0 0 3px currentColor);
}
.ecg-flatline .ecg-line {
  animation: ecg-flat 0.5s ease-in-out;
}
@keyframes ecg-flat {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
</style>
