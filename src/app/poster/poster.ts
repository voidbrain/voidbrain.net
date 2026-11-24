import { Component, computed, input } from '@angular/core';
import { POSTERS, Paragraph } from '../core/content';
import { StateId } from '../core/states';
import { FakeQr } from '../hud/fake-qr';
import { GameOfLife } from '../hud/game-of-life';
import { GlyphMatrix } from '../hud/glyph-matrix';
import { HeightMap } from '../hud/height-map';
import { Radar } from '../hud/radar';
import { SignalChart } from '../hud/signal-chart';
import { TerminalLog } from '../hud/terminal-log';
import { WireCube } from '../hud/wire-cube';
import { WireSphere } from '../hud/wire-sphere';

/** One state's poster: headlines, text and the HUD pieces around the figure (layout in src/styles.scss). */
@Component({
  selector: 'vb-poster',
  imports: [
    FakeQr,
    GameOfLife,
    GlyphMatrix,
    HeightMap,
    Radar,
    SignalChart,
    TerminalLog,
    WireCube,
    WireSphere,
  ],
  host: { class: 'poster', '[attr.data-poster]': 'state()' },
  templateUrl: './poster.html',
})
export class Poster {
  readonly state = input.required<StateId>();
  protected readonly p = computed(() => POSTERS[this.state()]);
  protected readonly isText = (para: Paragraph): para is string => typeof para === 'string';
}
