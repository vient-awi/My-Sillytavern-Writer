import { compare } from 'compare-versions';
import { checkMinimumVersion } from '../../../util/common';

const CHARACTER_NAME = '性斗学园超级重制版';
const WORLDBOOK_NAME = '性斗学园';
const VERSION_ENTRY_NAME = '版本号';
const GITHUB_BASE_URL = 'https://raw.githack.com/vincentrong2005/Fatria/main/src/性斗学园';

// 检查酒馆助手最低版本
checkMinimumVersion('4.6.2', CHARACTER_NAME);

export async function checkUpdate() {
  const version =
    (await getWorldbook(WORLDBOOK_NAME)).find(entry => entry.name === VERSION_ENTRY_NAME)?.content.trim() ?? '0.0.0';

  const remoteVersion = await fetch(`${GITHUB_BASE_URL}/版本号.txt`)
    .then(response => response.text())
    .then(text => text.trim())
    .catch(() => '0.0.0');

  if (compare(version, remoteVersion, '>=')) {
    return;
  }

  await importRawCharacter(
    CHARACTER_NAME,
    await fetch(`${GITHUB_BASE_URL}/性斗学园超级重制版.png`).then(response => response.blob()),
  );

  // 导入后直接生效，不再需要刷新页面
  toastr.success('角色卡自动更新成功', CHARACTER_NAME);
}

checkUpdate();
