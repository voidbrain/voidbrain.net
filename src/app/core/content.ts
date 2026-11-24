// The page text, per state. Sources: the 2012 site, the earlier Angular attempt and Daniele's CV; contact and
// personal details beyond the public links are deliberately left out (AGENTS, "Privacy"). Decorative fillers
// (logs, lorem) come from core/hud.ts, never from here.
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

export interface Poster {
  /** Accessible heading and switcher label. */
  readonly title: string;
  /** Big distorted headline at the top (decorative duplicate of the title's mood). */
  readonly headline: string;
  /** Second headline at the bottom. */
  readonly footline: string;
  /** Japanese texture word for the state (aria-hidden; the meaning is in `title`). */
  readonly kanji: string;
  readonly kicker: string;
  readonly paragraphs: readonly string[];
  readonly tags: readonly string[];
  readonly entries: readonly Entry[];
  readonly links: readonly LinkItem[];
  /** Text alternative of the self-model in this state. */
  readonly figure: string;
}

export const OWNER = {
  name: 'Daniele Bordignon',
  role: 'app & web full-stack developer',
  place: 'in north-east Italy',
} as const;

export const POSTERS: Record<StateId, Poster> = {
  work: {
    title: 'Work',
    headline: 'FULL_STACK',
    footline: 'APP & WEB',
    kanji: '仕事',
    kicker: 'app & web // full-stack developer // R&D',
    paragraphs: [
      'I am a software developer who builds reliable, high-performance solutions with a focus on usability and maintainability.',
      'Today I create full-stack, industrial-grade systems: smart dashboards, real-time data and intuitive interfaces to control and monitor automated production lines for Industry 4.0.',
      'Analytical, structured, solution-oriented. I take on complex projects on my own and I like organising a team.',
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
        detail:
          'R&D, web & app developer: web, desktop and mobile apps for smart production systems.',
      },
      {
        when: '~10 yrs',
        what: 'Agency',
        detail:
          'Full-stack developer: e-commerce, corporate and public service websites, iOS and Android apps.',
      },
      { when: 'before', what: 'Studio', detail: 'Web design and development.' },
      {
        when: 'long ago',
        what: 'Odd jobs',
        detail: 'Webmaster, AutoCAD 3D libraries, help desk, beta test.',
      },
      {
        when: 'way back',
        what: 'Back office',
        detail: 'Help desk and back office for business software.',
      },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/voidbrain' },
      { label: 'Stack Overflow', href: 'https://stackoverflow.com/users/1000137/voidbrain' },
    ],
    figure: 'Placeholder 3D figure of Daniele, head tilted down towards a screen, wearing glasses.',
  },
  play: {
    title: 'Play',
    headline: 'FPV_FREESTYLE',
    footline: 'FUTURE IS NOW',
    kanji: '遊び',
    kicker: 'quads // goggles on // maker mode',
    paragraphs: [
      'Out of office I fly FPV freestyle: goggles on, the world seen from a drone a few metres above the grass.',
      'I build things with Raspberry Pi and Arduino, print parts in 3D, and play with machine learning, AR, mesh networks and edge computing.',
      'When the sky is clear I point a camera at it. When it is not, I play Ultimate Frisbee: competition, fun and fair play in one game.',
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
      'Ultimate Frisbee',
      'Hiking',
    ],
    entries: [
      {
        when: 'PRJ_01',
        what: '3D configurator',
        detail: 'Drag catalogue items into a fitted wall, get the quotation and technical sheet.',
      },
      {
        when: 'PRJ_02',
        what: 'Product wizard',
        detail: 'Choose and personalise a bag among 3D elements.',
      },
      {
        when: 'PRJ_03',
        what: 'iOS & Android',
        detail: 'Calendar, push notifications, photos, geolocation, sync.',
      },
    ],
    links: [{ label: 'Instagram', href: 'https://www.instagram.com/il_bire/' }],
    figure: 'Placeholder 3D figure of Daniele wearing FPV goggles with an antenna.',
  },
  sleep: {
    title: 'Sleep',
    headline: 'SLEEP_MODE',
    footline: 'OFFLINE',
    kanji: '睡眠',
    kicker: 'low power // do not disturb // dreaming in lorem ipsum',
    paragraphs: [
      'We will be restoring normality as soon as we are sure what is normal anyway. (Douglas Adams, The Hitchhiker’s Guide to the Galaxy)',
      'I like reading, travelling and music, and I love nature and mountains.',
      'Leave a message after the beep: I will answer when I wake up.',
    ],
    tags: ['Reading', 'Travelling', 'Music', 'Mountains', 'Science'],
    entries: [{ when: '2012', what: 'The old site', detail: 'Still running, under /old/.' }],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/voidbrain/' },
      { label: 'GitHub', href: 'https://github.com/voidbrain' },
      { label: 'E-mail', href: 'mailto:info@voidbrain.net' },
      { label: 'The 2012 site', href: '/old/' },
    ],
    figure: 'Placeholder 3D figure of Daniele asleep, head tilted, wearing a sleep mask.',
  },
};
