/**
 * 家会话是谁（2026-11-08 加）
 *
 * 这个插件原来自带一个 AI：自己按兴趣挑片、自己刷、自己回私信。
 * 现在那套已经拆掉 —— 插件只留「手」（浏览器 + 工具），
 * 动手的是 dsh-world 的家会话，也就是主人在对话框里说话的那个她。
 *
 * 为了让主人一眼看出「现在是哪一个她在刷」，这里读世界目录里的 life.json，
 * 把家会话 id 和标题带出来。读不到就老实说读不到，不猜。
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function dshHome() {
  const explicit = String(process.env.DSH_HOME ?? '').trim();
  if (explicit) return explicit;
  const profile = String(process.env.DSH_PROFILE_DIR ?? '').trim();
  if (profile) {
    const up = join(profile, '..', '..');
    try {
      if (existsSync(join(up, 'worlds'))) return up;
    } catch {}
  }
  return join(homedir(), '.dsh');
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** 会话标题存在 DSH 的投影缓存里；读不到就空串，界面上不编名字。 */
function titleOf(home, sessionId) {
  const file = join(home, 'storages', 'session_projcache', 'sessions', sessionId + '.json');
  const parsed = readJson(file);
  const title = parsed?.record?.rows?.title?.val;
  return typeof title === 'string' ? title : '';
}

export function wiredHomeSession(worldId = process.env.DSH_WORLD_ID || 'default') {
  const home = dshHome();
  const life = readJson(join(home, 'worlds', worldId || 'default', 'life.json'));
  const id = String(life?.homeSessionId ?? '').trim();
  return {
    worldId: worldId || 'default',
    homeSessionId: id || null,
    title: id ? titleOf(home, id) : '',
    wired: Boolean(id),
    note: id
      ? '刷视频的是这个家会话：插件只出手，不动脑。'
      : '还没找到家会话（worlds/' + (worldId || 'default') + '/life.json）——现在没有人能自己刷。',
  };
}
