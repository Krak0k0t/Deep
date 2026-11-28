import { ChapterId } from './campaign';

export interface LoreRelicConfig {
  id: string;
  chapter: ChapterId;
  x: number;
  yOffset: number;
  z: number;
  tintHex: string;
  titleEn: string;
  titleRu: string;
  bodyEn: string;
  bodyRu: string;
}

export interface CodexEntryConfig {
  id: string;
  npcId?: string;
  unlockChapter?: ChapterId;
  iconKind: 'jelly' | 'squid' | 'octopus' | 'puffer' | 'crab' | 'turtle' | 'angler' | 'whale' | 'parrot' | 'egg';
  titleEn: string;
  titleRu: string;
  subtitleEn: string;
  subtitleRu: string;
  bodyEn: string;
  bodyRu: string;
}

export const CHAPTER_LORE_RELICS: Record<ChapterId, LoreRelicConfig> = {
  1: {
    id: 'relic_ch1_compass',
    chapter: 1,
    x: -7.8,
    yOffset: 0.75,
    z: -42,
    tintHex: '#f5cf6e',
    titleEn: "Trawler's Brass Compass",
    titleRu: 'Латунный компас траулера',
    bodyEn:
      'Dropped decades before the singing currents shifted. Its needle still trembles toward the turquoise Heart below.',
    bodyRu:
      'Уронен с палубы задолго до сдвига течений. Его стрелка до сих пор дрожит, указывая вглубь, к Бирюзовому сердцу.',
  },
  2: {
    id: 'relic_ch2_bell',
    chapter: 2,
    x: 8.4,
    yOffset: 0.85,
    z: -48,
    tintHex: '#5ee8d8',
    titleEn: 'Gramophone Copper Horn',
    titleRu: 'Медный раструб граммофона',
    bodyEn:
      'Once played waltzes in the Singing Whale lounge. Whales still answer its hollow brass hum across the dark hull.',
    bodyRu:
      'Когда-то играл вальсы в салоне «Поющего кита». Киты до сих пор отвечают его гулкому медному эху в темноте трюмов.',
  },
  3: {
    id: 'relic_ch3_amber',
    chapter: 3,
    x: -8.8,
    yOffset: 0.9,
    z: -36,
    tintHex: '#63f2a8',
    titleEn: 'Whisper-Amber Conch',
    titleRu: 'Раковина шёпотного янтаря',
    bodyEn:
      'Giant kelp roots wrapped this spiral shell in golden resin. Hold it close and you hear ancient tides breathing.',
    bodyRu:
      'Корни гигантских водорослей заключили спиральную раковину в золотую смолу. В ней до сих пор слышно дыхание древних приливов.',
  },
  4: {
    id: 'relic_ch4_flute',
    chapter: 4,
    x: 8.6,
    yOffset: 0.9,
    z: -52,
    tintHex: '#89d4ff',
    titleEn: 'Carved Bone Whistle',
    titleRu: 'Резной костяной свисток',
    bodyEn:
      'Crafted by Critic Crabs from a splinter of leviathan rib. A single soft breath calms passing bone-currents.',
    bodyRu:
      'Вырезан крабами-критиками из осколка ребра левиафана. Один тихий выдох усмиряет встречные течения кладбища.',
  },
  5: {
    id: 'relic_ch5_geode',
    chapter: 5,
    x: -8.2,
    yOffset: 0.95,
    z: -38,
    tintHex: '#ff9c5e',
    titleEn: 'Magma-Crowned Geode',
    titleRu: 'Магмовая жеода бездны',
    bodyEn:
      'Born beside Black Smokers where boiling mineral water meets freezing dark. Inside glitters pure turquoise quartz.',
    bodyRu:
      'Рождена у Чёрных курильщиков на границе кипятка и ледяной тьмы. Внутри неё искрится чистый бирюзовый кварц.',
  },
  6: {
    id: 'relic_ch6_shell',
    chapter: 6,
    x: 7.4,
    yOffset: 0.95,
    z: -36,
    tintHex: '#52fff0',
    titleEn: 'First Mother Crown',
    titleRu: 'Венец Первой матери',
    bodyEn:
      'A nacreous cradle laid long ago around the Abyssal Heart. Generations of luminous fry hatched beneath its light.',
    bodyRu:
      'Перламутровая колыбель, сложенная у Бирюзового сердца века назад. Под её светом выросли поколения светлящихся мальков.',
  },
  7: {
    id: 'relic_ch7_shackle',
    chapter: 7,
    x: -7.5,
    yOffset: 0.9,
    z: -34,
    tintHex: '#7ad8ff',
    titleEn: 'Snapped Anchor Link',
    titleRu: 'Разорванное якорное звено',
    bodyEn:
      'Broken by a migrating pod defending their young. Proof that even abyssal iron yields to a whale song.',
    bodyRu:
      'Переломлено стаей китов, защищавшей детёнышей. Напоминание о том, что даже сталь бездны уступает песне свободы.',
  },
  8: {
    id: 'relic_ch8_nautilus',
    chapter: 8,
    x: 7.8,
    yOffset: 0.9,
    z: -48,
    tintHex: '#5effc7',
    titleEn: 'Star-Spore Ammonite',
    titleRu: 'Звёздный аммонит мятежа',
    bodyEn:
      'Swims in memory when touched by egg-resonance. Its chambers glow with spores that guide travelers upward.',
    bodyRu:
      'Отзывается на резонанс икринки мягким изумрудным сиянием. Споры в его камерах указывают путь сквозь чащу водорослей.',
  },
  9: {
    id: 'relic_ch9_locket',
    chapter: 9,
    x: -7.8,
    yOffset: 0.9,
    z: -36,
    tintHex: '#ffd27d',
    titleEn: "Captain's Log Locket",
    titleRu: 'Медальон судового журнала',
    bodyEn:
      'Bears a faded sketch of a turquoise reef fish leaping above silver waves. The liner crew called her the Reef Lantern.',
    bodyRu:
      'Хранит выцветший набросок бирюзовой рыбки над серебристой волной. Моряки лайнера звали её Фонариком рифа.',
  },
  10: {
    id: 'relic_ch10_pearl',
    chapter: 10,
    x: 7.4,
    yOffset: 0.85,
    z: -46,
    tintHex: '#fff0ad',
    titleEn: 'Dawn-Tide Conch',
    titleRu: 'Раковина рассветного прилива',
    bodyEn:
      'Warmed every morning by sunlit shallows of Quiet Reef. Its chime greets every hatchling returning from the deep.',
    bodyRu:
      'Согрета утренним солнцем Тихого рифа. Её тихий звон встречает каждого малька, вернувшегося с мамой из бездны.',
  },
};

export const LORE_RELIC_LIST: LoreRelicConfig[] = Object.values(CHAPTER_LORE_RELICS);

export const CODEX_ENTRIES: CodexEntryConfig[] = [
  {
    id: 'codex_mildred',
    npcId: 'mildred',
    unlockChapter: 1,
    iconKind: 'jelly',
    titleEn: 'Grandma Jellyfish Mildred',
    titleRu: 'Медуза Милдред',
    subtitleEn: 'Quiet Reef · Guide',
    subtitleRu: 'Тихий риф · Наставница',
    bodyEn:
      'An elder moon jelly who remembers every tide since the liner sank. Gentle to reef travelers, though bumping her bell still gives a buoyant bounce.',
    bodyRu:
      'Старейшая лунная медуза рифа, помнящая все течения со дня крушения лайнера. Бережёт путников, хотя при столкновении упруго отталкивает.',
  },
  {
    id: 'codex_squid',
    unlockChapter: 1,
    iconKind: 'squid',
    titleEn: 'Vampire Rocket Squid',
    titleRu: 'Ракетный кальмар бездны',
    subtitleEn: 'Abyssal Stalker',
    subtitleRu: 'Глубинный хищник',
    bodyEn:
      'Hunts by movement and bright lures, telegraphing with a violet siphon flare before lunging. Duck into coral domes or trigger Ascent Stun [E] to slip clear.',
    bodyRu:
      'Охотится на движение и яркий свет, перед рывком вспыхивая фиолетовым сифоном. Прячьтесь в укрытиях или оглушайте Зовом [E] при подъёме.',
  },
  {
    id: 'codex_boris',
    npcId: 'boris',
    unlockChapter: 2,
    iconKind: 'octopus',
    titleEn: 'Octopus Boris',
    titleRu: 'Осьминог Борис',
    subtitleEn: 'Singing Whale Mechanic',
    subtitleRu: 'Мастер затонувшего лайнера',
    bodyEn:
      'Eight-armed engineer tending rusted hull hatches with his glowing tea mug. Rewarding his friendship grants the hydro-jet Dash mutation.',
    bodyRu:
      'Восьминогий механик, чинящий переборки «Поющего кита» с любимой ламповой кружкой в щупальце. За помощь дарует способность Рывка.',
  },
  {
    id: 'codex_pafnutiy',
    npcId: 'pafnutiy',
    unlockChapter: 2,
    iconKind: 'puffer',
    titleEn: 'Pufferfish Pafnutiy',
    titleRu: 'Рыба-шар Пафнутий',
    subtitleEn: 'Sensitive Sleeper',
    subtitleRu: 'Чуткий соня камбуза',
    bodyEn:
      'Startles at loud tail-splashes and swells to triple size with a bouncy shockwave. Swim slowly or wear Silent Fins to glide past undisturbed.',
    bodyRu:
      'Пугается громких всплесков и мгновенно раздувается втрое. Плывите неспешно или наденьте «Бесшумные плавники», чтобы не разбудить его.',
  },
  {
    id: 'codex_crabs',
    npcId: 'hermit_crabs',
    unlockChapter: 3,
    iconKind: 'crab',
    titleEn: 'Hermit & Critic Crabs',
    titleRu: 'Крабы-отшельники и критики',
    subtitleEn: 'Trench Crane Keepers',
    subtitleRu: 'Смотрители кранов впадины',
    bodyEn:
      'From kelp winches to the giant Charybdis crane, crab guilds keep heavy wreckage balanced with glowing nautilus counterweights and acoustic etiquette.',
    bodyRu:
      'От лебёдок в водорослях до крана «Харибда» — кланы крабов удерживают обломки лайнера и оценивают каждый проплыв по всей строгости.',
  },
  {
    id: 'codex_glafira',
    npcId: 'glafira',
    unlockChapter: 3,
    iconKind: 'turtle',
    titleEn: 'Turtle Glafira',
    titleRu: 'Черепаха Глафира',
    subtitleEn: 'Kelp Canyon Scout',
    subtitleRu: 'Разведчица ламинарии',
    bodyEn:
      'Reads subtle whispers in towering kelp blades before predators strike. Always rests near living root shelters where light safely dims.',
    bodyRu:
      'Слышит малейший шёпот водорослей задолго до броска хищника и всегда держится поблизости от живых корней-укрытий.',
  },
  {
    id: 'codex_queen',
    npcId: 'queen_angler',
    unlockChapter: 5,
    iconKind: 'angler',
    titleEn: 'Queen Anglerfish',
    titleRu: 'Королева-удильщица',
    subtitleEn: 'Guardian of the Heart',
    subtitleRu: 'Хранительница Бирюзового сердца',
    bodyEn:
      'Sovereign of the hadal Black Smokers. Though fierce in silhouette, she honors mothers braving the dark to guard their eggs.',
    bodyRu:
      'Повелительница хадальных курильщиков. Сурова с виду, но уважает отважных матерей и защищает путь к Бирюзовому сердцу.',
  },
  {
    id: 'codex_whale',
    npcId: 'young_whale',
    unlockChapter: 7,
    iconKind: 'whale',
    titleEn: 'Young Singing Whale',
    titleRu: 'Китёнок Поющий',
    subtitleEn: 'Abyssal Breakout Ally',
    subtitleRu: 'Союзник на пути наверх',
    bodyEn:
      'Freed from a sunken trawler cable during the Ascent, his resonant low song scatters stalking squids and feeds warm upward currents.',
    bodyRu:
      'Освобождённый от стального троса при подъёме, он своей песней отгоняет кальмаров и усиливает тёплые восходящие потоки.',
  },
  {
    id: 'codex_kesha',
    npcId: 'kesha',
    unlockChapter: 9,
    iconKind: 'parrot',
    titleEn: 'Parrotfish Kesha',
    titleRu: 'Рыба-попугай Кеша',
    subtitleEn: 'Liner Atrium Herald',
    subtitleRu: 'Глашатай верхнего трюма',
    bodyEn:
      'Answers a turquoise Call with a thunderous acoustic blast strong enough to unlatch rusted liner bulkheads — and briefly stun nearby hunters.',
    bodyRu:
      'Отвечает на Зов [E] громогласным эхом, которое способно сорвать засов переборки лайнера и оглушить преследователей.',
  },
  {
    id: 'codex_egg',
    unlockChapter: 6,
    iconKind: 'egg',
    titleEn: 'The Turquoise Egg',
    titleRu: 'Бирюзовая икринка',
    subtitleEn: 'Heartbeat of the Reef',
    subtitleRu: 'Сердцебиение рифа',
    bodyEn:
      'Carries the bioluminescent cadence of Quiet Reef. Once reclaimed at the Abyssal Heart, sounding Call [E] awakens an Egg Resonance shield.',
    bodyRu:
      'Хранит живой бирюзовый ритм Тихого рифа. После возвращения в Главе 6 каждый Зов [E] пробуждает целебный резонанс икринки.',
  },
];

export function isCodexEntryUnlocked(
  entry: CodexEntryConfig,
  highestChapter: number,
  npcsMet: string[],
): boolean {
  if (entry.npcId && npcsMet.includes(entry.npcId)) return true;
  if (entry.unlockChapter && highestChapter >= entry.unlockChapter) return true;
  return false;
}

export function getLoreRelicText(
  relic: LoreRelicConfig,
  lang: string,
): { title: string; body: string } {
  const useRu = lang === 'ru' || lang === 'uk';
  return {
    title: useRu ? relic.titleRu : relic.titleEn,
    body: useRu ? relic.bodyRu : relic.bodyEn,
  };
}

export function getCodexEntryText(
  entry: CodexEntryConfig,
  lang: string,
): { title: string; subtitle: string; body: string } {
  const useRu = lang === 'ru' || lang === 'uk';
  return {
    title: useRu ? entry.titleRu : entry.titleEn,
    subtitle: useRu ? entry.subtitleRu : entry.subtitleEn,
    body: useRu ? entry.bodyRu : entry.bodyEn,
  };
}
