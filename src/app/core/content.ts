// The page text, per state. Sources: the 2012 site, the earlier Angular attempt and Daniele's CV, made fuzzy on
// purpose (owner, 2026-11-24): no employer or client names, no exact dates or places. Contact and personal details
// beyond the public links stay out (AGENTS, "Privacy"). Decorative fillers (logs, lorem) come from core/hud.ts.
import type { StateId } from './states';

export interface Entry {
  readonly when: string;
  readonly what: string;
  readonly detail: string;
}

export interface LinkItem {
  readonly label: string;
  readonly href: string;
}

/** A paragraph: plain text, or a link followed by text. */
export type Paragraph = string | { readonly link: LinkItem; readonly after: string };

export interface Poster {
  /** Accessible heading and switcher label. */
  readonly title: string;
  /** Big distorted headline at the top (decorative duplicate of the title's mood). */
  readonly headline: string;
  /** Second headline at the bottom, word by word: each word gets its own colour (owner, 2026-11-24). */
  readonly footline: readonly string[];
  /** Japanese texture word for the state (aria-hidden; the meaning is in `title`). */
  readonly kanji: string;
  readonly kicker: string;
  readonly paragraphs: readonly Paragraph[];
  readonly tags: readonly string[];
  readonly entries: readonly Entry[];
  readonly links: readonly LinkItem[];
  /** Text alternative of the self-model in this state. */
  readonly figure: string;
  /** What the side strip shows when this poster is a neighbour: the name, or for sleep its symbols (owner). */
  readonly side: string;
  /** Giant word behind the figure (decorative). */
  readonly back: string;
  /** A line set vertically along the poster edge (decorative). */
  readonly vertical: string;
  /** The top layer of small marks and symbols over everything (decorative), placed in % of the poster. */
  readonly marks: readonly Mark[];
}

export interface Mark {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  /** Bigger symbol instead of small caption type. */
  readonly big?: boolean;
}

export const OWNER = {
  name: 'Daniele Bordignon',
  role: 'app & web full-stack developer',
  place: 'somewhere in north-east Italy',
} as const;

export const POSTERS: Record<StateId, Poster> = {
  work: {
    title: 'Work',
    headline: 'WORK',
    footline: ['WEB', 'APP', 'AI', 'IOT'],
    kanji: '仕事',
    kicker: 'full-stack developer // R&D // web, app, AI, IoT',
    paragraphs: [
      'I build reliable, fast software with a focus on usability and maintainability.',
      'Full-stack, industrial-grade systems. Smart dashboards, real-time data and interfaces that control and monitor automated production lines.',
      'Analytical, structured, solution-oriented. I take on complex projects, and I like challenges: the harder, the better.',
    ],
    tags: [
      'Angular',
      'Ionic',
      'TypeScript',
      'Node.js',
      '.NET',
      'SQL',
      'μServices',
      'Git',
      'Docker',
      'DevOps',
    ],
    entries: [
      {
        when: 'now →',
        what: 'R&D lab',
        detail: 'Web, desktop and mobile apps for smart factories.',
      },
      {
        when: '~10 yrs',
        what: 'Agency',
        detail: 'E-commerce, corporate and public-service sites; iOS and Android apps.',
      },
      { when: 'before', what: 'Studio', detail: 'Web design and development.' },
      {
        when: 'long ago',
        what: 'Odd jobs',
        detail: 'Webmaster, 3D libraries, help desk, beta tests.',
      },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/voidbrain' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/voidbrain/' },
    ],
    figure: 'Placeholder 3D figure of Daniele, head tilted down towards a screen, wearing glasses.',
    side: 'Work',
    back: 'FULL STACK',
    vertical: 'BUILD // TEST // SHIP // REPEAT // BUILD // TEST // SHIP',
    marks: [
      { text: '⊕', x: 3, y: 2, big: true },
      { text: '⊕', x: 94, y: 2, big: true },
      { text: 'VB-01 // 0x2A', x: 62, y: 4 },
      { text: '▲▲▲', x: 44, y: 18, big: true },
      { text: 'SYS.OK', x: 70, y: 30 },
      { text: '+', x: 30, y: 44, big: true },
      { text: '→→→ DEPLOY', x: 58, y: 52 },
      { text: '[■■■■□□]', x: 8, y: 66 },
      { text: '★', x: 88, y: 70, big: true },
      { text: 'NO_REAL_DATA', x: 40, y: 86 },
      { text: '⊕', x: 3, y: 95, big: true },
      { text: '⊕', x: 94, y: 95, big: true },
    ],
  },
  play: {
    title: 'Play',
    headline: 'FPV_FREESTYLE',
    footline: ['FLY', 'CRASH', 'REPEAT'],
    kanji: '遊び',
    kicker: 'quads // goggles on // maker mode',
    paragraphs: [
      'Out of office I fly FPV freestyle: goggles on, the world seen from a drone a few metres above the grass.',
      'I build things with Raspberry Pi and Arduino, print parts in 3D, and play with machine learning, AR, mesh networks and edge computing.',
      'Clear sky: a camera pointed at it, staring at the stars.',
    ],
    tags: [
      'FPV freestyle',
      '3D printing',
      'Raspberry Pi',
      'Arduino',
      'IoT',
      'ML / AI / AR',
      'Mesh / edge',
      'Astrophotography',
      'Hiking',
    ],
    entries: [
      {
        when: 'NN_01',
        what: 'Latent drift',
        detail: 'Weights wander at night. The loss curve hums back.',
      },
      {
        when: 'NN_02',
        what: 'Synth eye',
        detail: 'A vision model that only sees drones, and pretends not to.',
      },
      {
        when: 'NN_03',
        what: 'Ghost mesh',
        detail: 'An agent swarm on a mesh of tiny boards. Mostly harmless.',
      },
    ],
    links: [{ label: 'Instagram', href: 'https://www.instagram.com/il_bire/' }],
    figure: 'Placeholder 3D figure of Daniele wearing FPV goggles with an antenna.',
    side: 'Play',
    back: 'FPV',
    vertical: 'ARM // THROTTLE UP // DIVE // POWER LOOP // DISARM',
    marks: [
      { text: '◢◤', x: 4, y: 3, big: true },
      { text: 'CH5 5.8GHz', x: 70, y: 3 },
      { text: '⟲ 360°', x: 86, y: 16 },
      { text: '[ REC ●]', x: 30, y: 24 },
      { text: '+', x: 52, y: 38, big: true },
      { text: 'BAT 16.4V', x: 30, y: 8 },
      { text: '▶▶', x: 78, y: 50, big: true },
      { text: 'ALT 012m', x: 60, y: 64 },
      { text: '✕', x: 20, y: 78, big: true },
      { text: 'LQ 100 // RSSI -48', x: 52, y: 90 },
      { text: '◢◤', x: 93, y: 95, big: true },
    ],
  },
  sleep: {
    title: 'Sleep',
    headline: 'sleep_mode',
    footline: ['offline'],
    kanji: '睡眠',
    kicker: 'low power // do not disturb // dreaming in lorem ipsum',
    paragraphs: [
      'We will be restoring normality as soon as we are sure what is normal anyway. (Douglas Adams, The Hitchhiker’s Guide to the Galaxy)',
      'Reading, travelling, music, mountains and nature. Ultimate Frisbee when I am awake.',
      {
        link: { label: 'Leave a message after the beep', href: 'mailto:info@voidbrain.net' },
        after: ': I will answer when I wake up.',
      },
    ],
    tags: ['Reading', 'Travelling', 'Music', 'Mountains', 'Science', 'Ultimate Frisbee'],
    entries: [
      { when: '03:12', what: 'REM log', detail: 'Dreaming in TypeScript, waking up in YAML.' },
    ],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/voidbrain/' },
      { label: 'GitHub', href: 'https://github.com/voidbrain' },
      { label: 'E-mail', href: 'mailto:info@voidbrain.net' },
      { label: 'The 2012 site', href: '/old/' },
    ],
    figure: 'Placeholder 3D figure of Daniele asleep, head tilted, wearing a sleep mask.',
    side: 'zzz',
    back: 'zzz',
    vertical: 'do not disturb // do not disturb // do not disturb',
    marks: [
      { text: '☾', x: 5, y: 3, big: true },
      { text: 'REM 04 // 03:12', x: 60, y: 4 },
      { text: '✦', x: 36, y: 14, big: true },
      { text: 'Z', x: 72, y: 24, big: true },
      { text: 'z', x: 78, y: 18 },
      { text: 'ALARM: OFF', x: 8, y: 40 },
      { text: '·  ·  ·', x: 56, y: 48 },
      { text: '✦', x: 88, y: 60, big: true },
      { text: '{ 404_dream }', x: 30, y: 74 },
      { text: '☾', x: 92, y: 94, big: true },
    ],
  },
};
