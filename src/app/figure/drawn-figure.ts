import { Component, DOCUMENT, computed, inject, input, signal } from '@angular/core';
import { POSTERS } from '../core/content';
import { StateId } from '../core/states';

let nextId = 0;

/** The drawn figure (F-004 style test, `?figure=drawn`): a manga / cyberpunk ink drawing of a man in SVG, in the
 *  poster's ink and ground colours, hatched on the shadow side, with one prop per state (glasses, FPV goggles,
 *  sleep mask). It breathes, blinks and turns a little towards the pointer; all of that stops with reduced motion.
 *  No three.js: a few kilobytes. */
@Component({
  selector: 'vb-drawn-figure',
  host: {
    class: 'drawn-figure',
    role: 'img',
    '[attr.aria-label]': 'label()',
    '(window:pointermove)': 'onPointer($event)',
  },
  styles: `
    :host {
      position: absolute;
      inset: 0;
      display: block;
      color: var(--ink);
    }
    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .g {
      fill: var(--ground);
    }
    .i {
      fill: currentColor;
    }
    .line {
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .on-ink {
      fill: none;
      stroke: var(--ground);
      stroke-linecap: round;
    }
    .body {
      animation: breathe 4.2s ease-in-out infinite;
    }
    .head {
      /* CSS transform (not the SVG attribute), so the turn animates in every browser; the pivot is the neck */
      transform-origin: 200px 300px;
      transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .eyes {
      transform-box: fill-box;
      transform-origin: center;
      animation: blink 5.4s steps(1, end) infinite;
    }
    @keyframes breathe {
      50% {
        transform: translateY(3px);
      }
    }
    @keyframes blink {
      0%,
      96%,
      100% {
        transform: scaleY(1);
      }
      97%,
      98% {
        transform: scaleY(0.1);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .body,
      .eyes {
        animation: none;
      }
      .head {
        transition: none;
      }
    }
  `,
  template: `
    <svg viewBox="0 0 400 480" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <pattern [attr.id]="ids.hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="2.2" />
        </pattern>
        <pattern [attr.id]="ids.dots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="4.5" cy="4.5" r="2.1" fill="currentColor" />
        </pattern>
      </defs>

      <!-- screentone disc behind the head -->
      <circle cx="214" cy="190" r="150" [attr.fill]="ref(ids.dots)" opacity="0.55" />

      <g class="body">
        <!-- jacket, high collar, seams -->
        <path class="i" d="M24 480 C34 418 88 392 150 382 L172 366 L228 366 L250 382 C312 392 366 418 376 480 Z" />
        <path class="g line" stroke-width="4" d="M148 384 L163 326 L200 342 L237 326 L252 384 L230 370 L200 378 L170 370 Z" />
        <path [attr.fill]="ref(ids.hatch)" d="M200 342 L237 326 L252 384 L230 370 L200 378 Z" />
        <path class="on-ink" stroke-width="2.5" d="M110 440 L150 410 M290 440 L250 410 M200 392 L200 480 M296 456 h40 v16 h-40 Z" />
        <path class="on-ink" stroke-width="1.5" d="M300 461 h30 M300 466 h22" />

        <!-- neck, with the jaw's shadow -->
        <path class="g line" stroke-width="4" d="M176 296 L172 350 L200 362 L228 350 L224 296 Z" />
        <path [attr.fill]="ref(ids.hatch)" d="M177 300 L223 300 L226 330 L200 338 L175 330 Z" />
        <!-- earpiece cable down the neck -->
        <path class="line" stroke-width="2.5" d="M268 236 C272 270 270 320 244 356" />

        <g class="head" [style.transform]="headTransform()">
          <!-- ears -->
          <path class="g line" stroke-width="4" d="M141 204 C125 198 122 234 139 242" />
          <path class="g line" stroke-width="4" d="M259 204 C275 198 278 234 261 242" />
          <rect class="i" x="262" y="214" width="10" height="20" rx="3" />

          <!-- face -->
          <path
            class="g line"
            stroke-width="4.5"
            d="M140 200 C138 160 160 120 200 118 C240 120 262 160 260 200 C262 232 255 262 238 285 L212 312 Q200 320 188 312 L162 285 C145 262 138 232 140 200 Z"
          />
          <!-- the shadow side, hatched: the light comes from the left -->
          <path
            [attr.fill]="ref(ids.hatch)"
            d="M224 150 C250 166 263 200 258 232 C255 262 240 286 212 312 L207 300 C228 272 238 240 236 205 C234 180 229 166 221 152 Z"
          />
          <!-- cheekbone and jaw accents -->
          <path class="line" stroke-width="2.5" d="M150 246 L166 258 M250 246 L234 258 M176 300 L188 308" />
          <!-- barcode tattoo -->
          <path class="line" stroke-width="1.6" d="M152 262 v10 M155 262 v10 M159 262 v10 M161 262 v10 M165 262 v10" />

          <!-- brows, eyes, nose, mouth -->
          @if (state() !== 'sleep') {
            <path class="i" d="M154 190 L191 197 L189 203 L156 198 Z" />
            <path class="i" d="M246 190 L209 197 L211 203 L244 198 Z" />
          }
          @if (state() === 'work') {
            <g class="eyes">
              <path class="line" stroke-width="4" d="M156 215 Q173 205 191 215" />
              <path class="line" stroke-width="4" d="M244 215 Q227 205 209 215" />
              <circle class="i" [attr.cx]="174 + look().x * 3" [attr.cy]="217 + look().y * 2" r="6" />
              <circle class="i" [attr.cx]="226 + look().x * 3" [attr.cy]="217 + look().y * 2" r="6" />
              <path class="line" stroke-width="1.6" d="M161 223 Q174 227 188 221 M239 223 Q226 227 212 221" />
            </g>
          }
          <path class="line" stroke-width="2.6" d="M199 226 L194 256 L205 258" />
          <path class="line" stroke-width="3" d="M183 282 Q200 287 217 281" />
          <path class="line" stroke-width="1.6" d="M192 293 L208 293" />

          <!-- hair: spiky, solid ink -->
          <path
            class="i"
            d="M128 212 C118 170 124 130 150 104 L136 78 L170 94 L174 56 L198 86 L216 50 L228 88 L258 66 L252 104 L284 98 L266 130 C280 160 280 192 272 214 L262 190 C258 162 246 150 232 148 L240 172 L216 150 L206 174 L190 150 L172 174 L170 150 C155 156 145 172 140 196 Z"
          />
          <path class="on-ink" stroke-width="2" d="M160 100 L176 122 M206 76 L210 110 M240 92 L232 120" />

          <!-- props -->
          @if (state() === 'work') {
            <g class="line" stroke-width="4">
              <rect class="line" x="150" y="203" width="44" height="27" rx="5" />
              <rect class="line" x="206" y="203" width="44" height="27" rx="5" />
              <path d="M194 213 L206 213 M150 210 L140 206 M250 210 L260 206" />
            </g>
            <path class="on-ink" stroke-width="2" d="M158 208 L166 208 M214 208 L222 208" />
          }
          @if (state() === 'play') {
            <path class="line" stroke-width="9" d="M136 214 L124 210 M264 214 L276 210" />
            <rect class="i" x="136" y="190" width="128" height="48" rx="10" />
            <rect class="g" x="149" y="200" width="102" height="28" rx="6" />
            <path class="line" stroke-width="2" d="M156 207 L244 207 M156 214 L244 214 M156 221 L244 221" />
            <path class="line" stroke-width="3.5" d="M250 190 L274 136" />
            <circle class="i" cx="276" cy="131" r="7" />
          }
          @if (state() === 'sleep') {
            <rect class="g line" stroke-width="4.5" x="132" y="196" width="136" height="38" rx="16" />
            <path [attr.fill]="ref(ids.hatch)" d="M224 198 L266 198 L266 232 L224 232 Z" />
            <path class="line" stroke-width="3" d="M160 216 Q172 224 186 216 M214 216 Q228 224 240 216" />
          }
        </g>
      </g>
    </svg>
  `,
})
export class DrawnFigure {
  readonly state = input.required<StateId>();

  private readonly doc = inject(DOCUMENT);
  private readonly n = nextId++;
  protected readonly ids = { hatch: `vb-hatch-${this.n}`, dots: `vb-dots-${this.n}` };
  private readonly pointer = signal({ x: 0, y: 0 });
  private readonly motionQuery = this.doc.defaultView?.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  );
  private readonly reduced = signal(this.motionQuery?.matches ?? false);

  protected readonly label = computed(() =>
    POSTERS[this.state()].figure.replace('Placeholder 3D figure', 'Drawn figure'),
  );
  /** Where the eyes look, from the pointer: x and y in [-1, 1]; still with reduced motion or asleep. */
  protected readonly look = computed(() =>
    this.reduced() || this.state() === 'sleep' ? { x: 0, y: 0 } : this.pointer(),
  );
  /** Pose per state (work looks down at a screen, sleep droops), plus a small turn towards the pointer. */
  protected readonly headTransform = computed(() => {
    const pose = { work: [5, 0, 6], play: [0, 0, 0], sleep: [-11, 4, 10] }[this.state()];
    const l = this.look();
    return `translate(${pose[1] + l.x * 5}px, ${pose[2] + l.y * 3}px) rotate(${pose[0] + l.x * 3}deg)`;
  });

  /** A url(#id) that keeps working with <base href="/"> and a query string in the page URL. */
  protected ref(id: string): string {
    const loc = this.doc.location;
    return `url("${loc.pathname}${loc.search}#${id}")`;
  }

  protected onPointer(e: PointerEvent): void {
    const win = this.doc.defaultView;
    // read live: the setting can change during the visit
    this.reduced.set(this.motionQuery?.matches ?? false);
    if (!win || this.reduced()) return;
    this.pointer.set({
      x: Math.max(-1, Math.min(1, (e.clientX / win.innerWidth) * 2 - 1)),
      y: Math.max(-1, Math.min(1, (e.clientY / win.innerHeight) * 2 - 1)),
    });
  }
}
