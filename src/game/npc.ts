export type NPCBehavior = 'static' | 'patrol' | 'flock' | 'escort';

export type NPCSpriteType =
  | 'mildred'
  | 'shrimp_flock'
  | 'boris'
  | 'pafnutiy'
  | 'hermit_crabs'
  | 'glafira'
  | 'critic_crabs'
  | 'kesha'
  | 'queen_angler';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface NPCData {
  id: string;
  name: string;
  chapter: number;
  sprite: NPCSpriteType;
  lines: [string, string];
  panicLines?: [string, string];
  behavior: NPCBehavior;
  position: Vec3;
  anchorPosition: Vec3;
  patrolRadius: number;
  triggerRadius: number;
  reward?: string;
  revealed: boolean;
  talkTimer: number;
  panicCount: number;
  hiddenUntilSec: number;
  activeText: [string, string];
}

export function createChapter1NPCs(): NPCData[] {
  return [
    {
      id: 'mildred',
      name: 'Медуза Милдред',
      chapter: 1,
      sprite: 'mildred',
      lines: [
        'Молодёжь совсем летать разучилась.',
        'Аккуратнее! Разучишься чуять — жми E (Зов).',
      ],
      behavior: 'patrol',
      position: { x: -2.2, y: 3.4, z: -16 },
      anchorPosition: { x: -2.2, y: 3.4, z: -16 },
      patrolRadius: 2.2,
      triggerRadius: 6.2,
      reward: 'call_hint',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Молодёжь совсем летать разучилась.',
        'Аккуратнее! Разучишься чуять — жми E (Зов).',
      ],
    },
    {
      id: 'panic_shrimps',
      name: 'Креветки-паникёры',
      chapter: 1,
      sprite: 'shrimp_flock',
      lines: [
        'УЧЕБНАЯ ТРЕВОГА! Прячьтесь в коралл!',
        'Держись в розовых ветвях, пока кальмар мимо пройдёт!',
      ],
      panicLines: [
        'Эй, хулиганка! Мы устали прятаться!',
        'Уходим в щель на минутку!',
      ],
      behavior: 'flock',
      position: { x: 4.8, y: 1.6, z: -34 },
      anchorPosition: { x: 4.8, y: 1.6, z: -34 },
      patrolRadius: 3.0,
      triggerRadius: 7.0,
      reward: 'distract_predator',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'УЧЕБНАЯ ТРЕВОГА! Прячьтесь в коралл!',
        'Держись в розовых ветвях, пока кальмар мимо пройдёт!',
      ],
    },
  ];
}

export const CAMPAIGN_NPC_BLUEPRINTS: Array<{
  id: string;
  name: string;
  chapter: number;
  sprite: NPCSpriteType;
  behavior: NPCBehavior;
  lines: [string, string];
  reward?: string;
}> = [
  {
    id: 'mildred',
    name: 'Медуза Милдред',
    chapter: 1,
    sprite: 'mildred',
    behavior: 'patrol',
    lines: [
      'Молодёжь совсем летать разучилась.',
      'Разучишься чуять — жми E (Зов).',
    ],
    reward: 'call_hint',
  },
  {
    id: 'boris',
    name: 'Осьминог Борис',
    chapter: 2,
    sprite: 'boris',
    behavior: 'static',
    lines: [
      'Потерял любимую кружку, она ламповая.',
      'Найдёшь на камбузе — покажу тайный ход!',
    ],
    reward: 'dash_mutation',
  },
  {
    id: 'pafnutiy',
    name: 'Рыба-шар Пафнутий',
    chapter: 2,
    sprite: 'pafnutiy',
    behavior: 'static',
    lines: [
      'Тише! Я от любого шума раздуваюсь!',
      'Не гони мимо, а то вышибу в соседний трюм!',
    ],
  },
  {
    id: 'hermit_crabs',
    name: 'Раковое Братство',
    chapter: 3,
    sprite: 'hermit_crabs',
    behavior: 'static',
    lines: [
      'Гвардия в коралловых касках на посту!',
      'Принеси 3 блестящих обломка — разберём завал.',
    ],
    reward: 'clear_rubble_ch4',
  },
  {
    id: 'glafira',
    name: 'Черепаха Глафира',
    chapter: 3,
    sprite: 'glafira',
    behavior: 'patrol',
    lines: [
      'Икринки? Тут такие таскают вниз всех.',
      'Верхний удильщик — Дрозд. Крупный. Жадный.',
    ],
  },
  {
    id: 'critic_crabs',
    name: 'Крабы-критики',
    chapter: 4,
    sprite: 'critic_crabs',
    behavior: 'static',
    lines: [
      'Прекрасный пируэт! Три уворота — будет жемчужина.',
      'А вот об стенку биться — это не искусство!',
    ],
    reward: 'pearl_style',
  },
  {
    id: 'queen_angler',
    name: 'Королева-удильщица',
    chapter: 5,
    sprite: 'queen_angler',
    behavior: 'escort',
    lines: [
      'Ой, да ты тоже бирюзовенькая? Бери детку...',
      'Пойду провожу до выхода, чтоб не обидели.',
    ],
    reward: 'abyss_escort',
  },
  {
    id: 'kesha',
    name: 'Рыба-попугай Кеша',
    chapter: 9,
    sprite: 'kesha',
    behavior: 'patrol',
    lines: [
      'КР-Р-РА! Кто тут светится в каюте?!',
      'Не пугай меня, а то как крикну Зовом!',
    ],
  },
];

export function distanceSq3(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function triggerShrimpPanic(
  npc: NPCData,
  nowSec: number,
): { npc: NPCData; distractedPredator: boolean; wentHiding: boolean } {
  if (nowSec < npc.hiddenUntilSec) {
    return { npc, distractedPredator: false, wentHiding: false };
  }
  const nextCount = npc.panicCount + 1;
  if (nextCount >= 5) {
    return {
      npc: {
        ...npc,
        panicCount: 0,
        hiddenUntilSec: nowSec + 60,
        revealed: true,
        talkTimer: 5.5,
        activeText: npc.panicLines ?? npc.lines,
      },
      distractedPredator: false,
      wentHiding: true,
    };
  }
  return {
    npc: {
      ...npc,
      panicCount: nextCount,
      revealed: true,
      talkTimer: 5.0,
      activeText: npc.lines,
    },
    distractedPredator: true,
    wentHiding: false,
  };
}

export function updateNPCProximity(
  npc: NPCData,
  playerPos: Vec3,
  dt: number,
  nowSec: number,
): { npc: NPCData; justMet: boolean } {
  const distSq = distanceSq3(npc.position, playerPos);
  const inRange = distSq <= npc.triggerRadius * npc.triggerRadius;
  const wasRevealed = npc.revealed;

  if (nowSec < npc.hiddenUntilSec) {
    return {
      npc: {
        ...npc,
        talkTimer: Math.max(0, npc.talkTimer - dt),
        revealed: npc.talkTimer > 0,
      },
      justMet: false,
    };
  }

  if (inRange) {
    return {
      npc: {
        ...npc,
        revealed: true,
        talkTimer: 4.5,
        activeText: npc.lines,
      },
      justMet: !wasRevealed,
    };
  }

  const nextTimer = Math.max(0, npc.talkTimer - dt);
  return {
    npc: {
      ...npc,
      talkTimer: nextTimer,
      revealed: nextTimer > 0,
    },
    justMet: false,
  };
}
