export type NPCBehavior = 'static' | 'patrol' | 'flock' | 'escort';

import {
  getChapter3FloorHeight,
  getChapter4FloorHeight,
  getChapter5FloorHeight,
  getChapter6FloorHeight,
  getChapter7FloorHeight,
  getChapter8FloorHeight,
  getChapter9FloorHeight,
  getChapter10FloorHeight,
} from './physics';
import { ChapterId } from './campaign';

export type NPCSpriteType =
  | 'mildred'
  | 'shrimp_flock'
  | 'boris'
  | 'pafnutiy'
  | 'hermit_crabs'
  | 'glafira'
  | 'critic_crabs'
  | 'kesha'
  | 'queen_angler'
  | 'young_whale';

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

export function createChapter2NPCs(): NPCData[] {
  return [
    {
      id: 'boris',
      name: 'Осьминог Борис',
      chapter: 2,
      sprite: 'boris',
      lines: [
        'Потерял любимую кружку, она ламповая.',
        'Найдёшь на камбузе — покажу тайный ход!',
      ],
      panicLines: [
        'Вот это да! Моя ламповая кружка цела!',
        'Открываю створку «Пеликан» и дарю тебе Рывок!',
      ],
      behavior: 'static',
      position: { x: -4.8, y: 1.8, z: -16 },
      anchorPosition: { x: -4.8, y: 1.8, z: -16 },
      patrolRadius: 0.8,
      triggerRadius: 6.5,
      reward: 'dash_mutation',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Потерял любимую кружку, она ламповая.',
        'Найдёшь на камбузе — покажу тайный ход!',
      ],
    },
    {
      id: 'pafnutiy',
      name: 'Рыба-шар Пафнутий',
      chapter: 2,
      sprite: 'pafnutiy',
      lines: [
        'Тише! Я от любого шума раздуваюсь!',
        'Не гони мимо, а то вышибу в соседний трюм!',
      ],
      panicLines: [
        'СЛИШКОМ БЫСТРО! РАЗДУВАЮСЬ!',
        'Шум разнёсся по камбузу — держись!',
      ],
      behavior: 'static',
      position: { x: 0.4, y: 1.4, z: -48 },
      anchorPosition: { x: 0.4, y: 1.4, z: -48 },
      patrolRadius: 0.6,
      triggerRadius: 6.8,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Тише! Я от любого шума раздуваюсь!',
        'Не гони мимо, а то вышибу в соседний трюм!',
      ],
    },
  ];
}

export function createChapter3NPCs(): NPCData[] {
  const crabsY = getChapter3FloorHeight(-4.4, -16) + 0.95;
  const glafiraY = getChapter3FloorHeight(3.8, -34) + 2.2;
  return [
    {
      id: 'hermit_crabs',
      name: 'Раковое Братство',
      chapter: 3,
      sprite: 'hermit_crabs',
      lines: [
        'Гвардия в коралловых касках на посту!',
        'Принеси 3 светящиеся раковины — разберём завал.',
      ],
      panicLines: [
        'Блеск! Все три раковины уравновесят наш кран!',
        'Крабовый кран поднимает завал — путь в бездну открыт!',
      ],
      behavior: 'static',
      position: { x: -4.4, y: crabsY, z: -16 },
      anchorPosition: { x: -4.4, y: crabsY, z: -16 },
      patrolRadius: 0.7,
      triggerRadius: 6.5,
      reward: 'clear_rubble_ch4',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Гвардия в коралловых касках на посту!',
        'Принеси 3 светящиеся раковины — разберём завал.',
      ],
    },
    {
      id: 'glafira',
      name: 'Черепаха Глафира',
      chapter: 3,
      sprite: 'glafira',
      lines: [
        'Икринки? Тут такие таскают вниз всех.',
        'Держись корней ламинарии, когда охотник выходит на шёпот.',
      ],
      behavior: 'patrol',
      position: { x: 3.8, y: glafiraY, z: -34 },
      anchorPosition: { x: 3.8, y: glafiraY, z: -34 },
      patrolRadius: 3.2,
      triggerRadius: 6.8,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Икринки? Тут такие таскают вниз всех.',
        'Держись корней ламинарии, когда охотник выходит на шёпот.',
      ],
    },
  ];
}

export function createChapter4NPCs(): NPCData[] {
  const criticsY = getChapter4FloorHeight(-4.6, -16) + 1.0;
  const glafiraY = getChapter4FloorHeight(4.0, -35) + 2.3;
  return [
    {
      id: 'critic_crabs',
      name: 'Крабы-критики',
      chapter: 4,
      sprite: 'critic_crabs',
      lines: [
        'Прекрасный пируэт! Три уворота — будет жемчужина.',
        'Добудь капсулу резонанса у скелета кашалота — откроем кран «Харибда»!',
      ],
      panicLines: [
        'Браво! Капсула левиафана у нас в клешнях!',
        'Кран «Харибда» открыт — спускайся к Чёрным курильщикам!',
      ],
      behavior: 'static',
      position: { x: -4.6, y: criticsY, z: -16 },
      anchorPosition: { x: -4.6, y: criticsY, z: -16 },
      patrolRadius: 0.8,
      triggerRadius: 6.8,
      reward: 'pearl_style',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Прекрасный пируэт! Три уворота — будет жемчужина.',
        'Добудь капсулу резонанса у скелета кашалота — откроем кран «Харибда»!',
      ],
    },
    {
      id: 'glafira',
      name: 'Черепаха Глафира',
      chapter: 4,
      sprite: 'glafira',
      lines: [
        'Старые кости левиафанов хранят эхо твоей икринки.',
        'Прячься внутри позвонков-укрытий, когда глубинный хищник замечает свет.',
      ],
      behavior: 'patrol',
      position: { x: 4.0, y: glafiraY, z: -35 },
      anchorPosition: { x: 4.0, y: glafiraY, z: -35 },
      patrolRadius: 3.0,
      triggerRadius: 6.8,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Старые кости левиафанов хранят эхо твоей икринки.',
        'Прячься внутри позвонков-укрытий, когда глубинный хищник замечает свет.',
      ],
    },
  ];
}

export function createChapter5NPCs(): NPCData[] {
  const queenY = getChapter5FloorHeight(-4.4, -18) + 2.2;
  const crabsY = getChapter5FloorHeight(4.5, -52) + 1.05;
  return [
    {
      id: 'queen_angler',
      name: 'Королева-удильщица',
      chapter: 5,
      sprite: 'queen_angler',
      lines: [
        'Ой, какая славная бирюзовая искорка у самых курильщиков!',
        'Принеси Глубинную люминар-жемчужину — провожу к Бирюзовому сердцу.',
      ],
      panicLines: [
        'Умница! Фонарь настроен — держись рядом, я отвлеку хищника!',
        'Термальный шлюз открыт — спускайся прямо к своей икринке!',
      ],
      behavior: 'escort',
      position: { x: -4.4, y: queenY, z: -18 },
      anchorPosition: { x: -4.4, y: queenY, z: -18 },
      patrolRadius: 2.2,
      triggerRadius: 7.2,
      reward: 'abyss_escort',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Ой, какая славная бирюзовая искорка у самых курильщиков!',
        'Принеси Глубинную люминар-жемчужину — провожу к Бирюзовому сердцу.',
      ],
    },
    {
      id: 'critic_crabs',
      name: 'Крабы-критики',
      chapter: 5,
      sprite: 'critic_crabs',
      lines: [
        'Глубоковато, а?! Берегись горячих столбов курильщиков!',
        'Когда столб темнеет и гудит — через секунду рванёт вверх.',
      ],
      behavior: 'static',
      position: { x: 4.5, y: crabsY, z: -52 },
      anchorPosition: { x: 4.5, y: crabsY, z: -52 },
      patrolRadius: 0.7,
      triggerRadius: 6.5,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Глубоковато, а?! Берегись горячих столбов курильщиков!',
        'Когда столб темнеет и гудит — через секунду рванёт вверх.',
      ],
    },
  ];
}

export function createChapter6NPCs(): NPCData[] {
  const queenY = getChapter6FloorHeight(-4.8, -18) + 2.3;
  return [
    {
      id: 'queen_angler',
      name: 'Королева-удильщица',
      chapter: 6,
      sprite: 'queen_angler',
      lines: [
        'Смотри — твоя икринка сияет в самом сердце бездны!',
        'Забери её и кричи Зовом [E]: при подъёме он оглушает хищников!',
      ],
      panicLines: [
        'Ты забрала малышку! Теперь плыви наверх!',
        'Твой Зов теперь бьёт ударной волной — прорывайся к выходу!',
      ],
      behavior: 'patrol',
      position: { x: -4.8, y: queenY, z: -18 },
      anchorPosition: { x: -4.8, y: queenY, z: -18 },
      patrolRadius: 2.0,
      triggerRadius: 7.4,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Смотри — твоя икринка сияет в самом сердце бездны!',
        'Забери её и кричи Зовом [E]: при подъёме он оглушает хищников!',
      ],
    },
  ];
}

export function createChapter7NPCs(): NPCData[] {
  const whaleY = getChapter7FloorHeight(-4.8, -50) + 2.4;
  const glafiraY = getChapter7FloorHeight(4.4, -22) + 2.2;
  return [
    {
      id: 'glafira',
      name: 'Черепаха Глафира',
      chapter: 7,
      sprite: 'glafira',
      lines: [
        'Восходящие струи сами несут вверх — входи в сияющие кольца!',
        'Ниже к шлюзу старый канат зацепил китёнка — освободи его!',
      ],
      behavior: 'patrol',
      position: { x: 4.4, y: glafiraY, z: -22 },
      anchorPosition: { x: 4.4, y: glafiraY, z: -22 },
      patrolRadius: 2.6,
      triggerRadius: 7.0,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Восходящие струи сами несут вверх — входи в сияющие кольца!',
        'Ниже к шлюзу старый канат зацепил китёнка — освободи его!',
      ],
    },
    {
      id: 'young_whale',
      name: 'Китёнок Поющий',
      chapter: 7,
      sprite: 'young_whale',
      lines: [
        'У-у-у... Трос держит мой плавник у засова!',
        'Поверни клапан сброса слева — и я расчищу путь наверх!',
      ],
      panicLines: [
        'У-У-У! Свободен! Моя песня сбивает кальмаров!',
        'Плывите скорее в Ламинариевый мятеж — вы дома почти!',
      ],
      behavior: 'static',
      position: { x: -4.8, y: whaleY, z: -50 },
      anchorPosition: { x: -4.8, y: whaleY, z: -50 },
      patrolRadius: 1.0,
      triggerRadius: 7.8,
      reward: 'whale_rescue',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'У-у-у... Трос держит мой плавник у засова!',
        'Поверни клапан сброса слева — и я расчищу путь наверх!',
      ],
    },
  ];
}

export function createChapter8NPCs(): NPCData[] {
  const borisY = getChapter8FloorHeight(4.4, -52) + 1.8;
  const glafiraY = getChapter8FloorHeight(-4.2, -20) + 2.2;
  return [
    {
      id: 'glafira',
      name: 'Черепаха Глафира',
      chapter: 8,
      sprite: 'glafira',
      lines: [
        'Твоя икринка будит споровые фонари ламинарий!',
        'Жми E (Зов), чтобы зажечь просеки и оглушить преследователя!',
      ],
      behavior: 'patrol',
      position: { x: -4.2, y: glafiraY, z: -20 },
      anchorPosition: { x: -4.2, y: glafiraY, z: -20 },
      patrolRadius: 2.8,
      triggerRadius: 7.0,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Твоя икринка будит споровые фонари ламинарий!',
        'Жми E (Зов), чтобы зажечь просеки и оглушить преследователя!',
      ],
    },
    {
      id: 'boris',
      name: 'Осьминог Борис',
      chapter: 8,
      sprite: 'boris',
      lines: [
        'Эй, ты уже с икринкой?! Вот это рывок из бездны!',
        'Я расчистил тайный люк к «Поющему киту» — открой рычаг!',
      ],
      panicLines: [
        'Тайный люк открыт! Быстрее к затонувшему лайнеру!',
        'Там тебя ждёт горластый попугай Кеша — не пугайся его!',
      ],
      behavior: 'static',
      position: { x: 4.4, y: borisY, z: -52 },
      anchorPosition: { x: 4.4, y: borisY, z: -52 },
      patrolRadius: 0.8,
      triggerRadius: 7.4,
      reward: 'boris_shortcut',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Эй, ты уже с икринкой?! Вот это рывок из бездны!',
        'Я расчистил тайный люк к «Поющему киту» — открой рычаг!',
      ],
    },
  ];
}

export function createChapter9NPCs(): NPCData[] {
  const keshaY = getChapter9FloorHeight(4.0, -24) + 2.4;
  const pafY = getChapter9FloorHeight(-2.6, -46) + 1.5;
  return [
    {
      id: 'kesha',
      name: 'Рыба-попугай Кеша',
      chapter: 9,
      sprite: 'kesha',
      lines: [
        'КР-Р-РА! Сирена в трюме! Прожекторы ищут чужаков!',
        'Подай Зов [E] рядом со мной — крикну так, что кальмар оглохнет!',
      ],
      panicLines: [
        'КР-Р-РА! Перегрузка переборки снята! Прожекторы мигают!',
        'Путь к выходу свободен — пора домой на Тихий риф!',
      ],
      behavior: 'patrol',
      position: { x: 4.0, y: keshaY, z: -24 },
      anchorPosition: { x: 4.0, y: keshaY, z: -24 },
      patrolRadius: 2.5,
      triggerRadius: 7.5,
      reward: 'kesha_alert',
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'КР-Р-РА! Сирена в трюме! Прожекторы ищут чужаков!',
        'Подай Зов [E] рядом со мной — крикну так, что кальмар оглохнет!',
      ],
    },
    {
      id: 'pafnutiy',
      name: 'Рыба-шар Пафнутий',
      chapter: 9,
      sprite: 'pafnutiy',
      lines: [
        'Опять ты! И с икринкой?! Не гони — сирена и так гудит!',
        'Открой переборку слева и всплывай к солнцу!',
      ],
      panicLines: [
        'СЛИШКОМ БЫСТРО! РАЗДУВАЮСЬ В ТРЭВОГЕ!',
        'Держи икринку крепче!',
      ],
      behavior: 'static',
      position: { x: -2.6, y: pafY, z: -46 },
      anchorPosition: { x: -2.6, y: pafY, z: -46 },
      patrolRadius: 0.7,
      triggerRadius: 6.8,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Опять ты! И с икринкой?! Не гони — сирена и так гудит!',
        'Открой переборку слева и всплывай к солнцу!',
      ],
    },
  ];
}

export function createChapter10NPCs(): NPCData[] {
  const mildredY = getChapter10FloorHeight(-4.2, -18) + 2.8;
  const shrimpY = getChapter10FloorHeight(4.4, -74) + 2.0;
  return [
    {
      id: 'mildred',
      name: 'Медуза Милдред',
      chapter: 10,
      sprite: 'mildred',
      lines: [
        'Видишь солнечные столбы?! Ты вернулась с самой бездны!',
        'Лови восходящий поток и плыви в родной коралловый сад!',
      ],
      behavior: 'patrol',
      position: { x: -4.2, y: mildredY, z: -18 },
      anchorPosition: { x: -4.2, y: mildredY, z: -18 },
      patrolRadius: 2.0,
      triggerRadius: 7.4,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'Видишь солнечные столбы?! Ты вернулась с самой бездны!',
        'Лови восходящий поток и плыви в родной коралловый сад!',
      ],
    },
    {
      id: 'panic_shrimps',
      name: 'Креветки-паникёры',
      chapter: 10,
      sprite: 'shrimp_flock',
      lines: [
        'ТРЕВОГА СЧАСТЬЯ! Она вернула икринку! Колыбель готова!',
        'Заплывай в бирюзовый коралл — малыш вот-вот вылупится!',
      ],
      behavior: 'flock',
      position: { x: 4.4, y: shrimpY, z: -74 },
      anchorPosition: { x: 4.4, y: shrimpY, z: -74 },
      patrolRadius: 2.4,
      triggerRadius: 8.5,
      revealed: false,
      talkTimer: 0,
      panicCount: 0,
      hiddenUntilSec: 0,
      activeText: [
        'ТРЕВОГА СЧАСТЬЯ! Она вернула икринку! Колыбель готова!',
        'Заплывай в бирюзовый коралл — малыш вот-вот вылупится!',
      ],
    },
  ];
}

export function createNPCsForChapter(chapter: ChapterId): NPCData[] {
  switch (chapter) {
    case 10:
      return createChapter10NPCs();
    case 9:
      return createChapter9NPCs();
    case 8:
      return createChapter8NPCs();
    case 7:
      return createChapter7NPCs();
    case 6:
      return createChapter6NPCs();
    case 5:
      return createChapter5NPCs();
    case 4:
      return createChapter4NPCs();
    case 3:
      return createChapter3NPCs();
    case 2:
      return createChapter2NPCs();
    default:
      return createChapter1NPCs();
  }
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
