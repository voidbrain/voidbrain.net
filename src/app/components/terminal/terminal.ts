import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-terminal',
  standalone: true,
  template: ` <div class="cli-host" #container></div>`,
  styles: [
    `
      .cli-host {
        width: 100%;
        height: 100%;
        background: #000;
      }
    `,
  ],
})
export class TerminalComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  private isBrowser = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private Terminal!: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private term: any;
  private disposers: (() => void)[] = [];

  // command state
  private prompt = '$ ';
  private buffer = '';
  private history: string[] = [];
  private historyIndex = -1;

  // Your commands + new conversational command "explain"
  private commands = ['help', 'clear', 'echo', 'date', 'version', 'explain'];

  // -------- Conversation (multi-step) state --------
  private pendingCommand: string | null = null;
  private pendingPrompt: string | null = null;
  private conversationMode = false;

  private fakeFS = {
    '/': {
      projects: {
        'fpv.txt': null,
        'frisbee.txt': null,
      },
      docs: {
        'readme.md': null,
        'changelog.md': null,
      },
      'data.csv': null,
    },
  };

  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return; // SSR: do nothing

    const mod = await import('xterm');
    this.Terminal = mod.Terminal;

    this.term = new this.Terminal({
      cursorBlink: true,
      cols: 38,
      rows: 12,
      convertEol: true,
      theme: {
        background: '#16162a',
        foreground: '#6699ff',
        cursor: '#6699ff',
        selectionBackground: '#ff33b870',
      },
    });

    this.term.open(this.container.nativeElement);

    // Focus terminal after a short delay to ensure it's ready
    setTimeout(() => {
      this.term.focus();
    }, 1000);

    // Listen to clicks on elements with class "terminal-trigger"
    document.querySelectorAll('.terminal-trigger').forEach((el) => {
      el.addEventListener('click', () => {
        const command = el.getAttribute('data-command') || '';
        const termArg = el.getAttribute('data-term') || '';

        const fullCommand = termArg ? `${command} ${termArg}` : command;

        this.runCommandFromClick(fullCommand);
      });
    });

    this.printPrompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyListener = this.term.onKey((ev: any) => {
      const key = ev.key;
      const domEvent: KeyboardEvent = ev.domEvent;
      this.handleKey(key, domEvent);
    });
    this.disposers.push(() => keyListener.dispose());
  }

  private runCommandFromClick(cmdText: string) {
    // Print the command in terminal
    this.term.writeln(`${cmdText}`);

    // Parse command + args
    const parts = cmdText.trim().split(' ').filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Run the command (normal or multi-step)
    this.runCommand(cmd, args);
  }

  ngOnDestroy() {
    this.disposers.forEach((d) => d());
    if (this.term) {
      try {
        this.term.dispose();
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }

  // ---------- Helpers ----------
  private write(text: string) {
    this.term.write(text);
  }

  private writeln(text = '') {
    this.term.writeln(text);
  }

  private printPrompt() {
    if (this.pendingPrompt) {
      this.write(`\r\n${this.pendingPrompt} `);
    } else {
      this.write(`\r\n${this.prompt}`);
    }
    this.buffer = '';
  }

  // ---------- Key handling ----------
  private handleKey(key: string, ev: KeyboardEvent) {
    const code = ev.key;

    if (code === 'Enter') {
      this.executeBuffer();
      return;
    }

    if (code === 'Backspace') {
      if (this.buffer.length > 0) {
        this.term.write('\b \b');
        this.buffer = this.buffer.slice(0, -1);
      }
      return;
    }

    if (code === 'ArrowUp') {
      this.navigateHistory(-1);
      return;
    }

    if (code === 'ArrowDown') {
      this.navigateHistory(1);
      return;
    }

    if (code === 'Tab') {
      ev.preventDefault();
      this.handleTabComplete();
      return;
    }

    if (key && !ev.ctrlKey && !ev.altKey && key.length === 1) {
      this.buffer += key;
      this.term.write(key);
    }
  }

  private executeBuffer() {
    const raw = this.buffer.trim();
    this.writeln('');

    // Save to history
    if (raw.length > 0) {
      this.history.unshift(raw);
      this.historyIndex = -1;
    }

    if (!raw) {
      this.printPrompt();
      return;
    }

    // CONVERSATION active → forward text to subcommand handler
    if (this.conversationMode && this.pendingCommand) {
      const response = this.runSubCommand(this.pendingCommand, raw);
      if (response) this.writeln(response);

      // exit conversation mode
      this.conversationMode = false;
      this.pendingCommand = null;
      this.pendingPrompt = null;

      this.printPrompt();
      return;
    }

    // Normal command
    const parts = raw.split(' ').filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    this.runCommand(cmd, args);
  }

  // ---------- Main commands ----------
  private runCommand(cmd: string, args: string[]) {
    switch (cmd) {
      case 'help':
        this.writeln('Available commands: ' + this.commands.join(', '));
        this.printPrompt();
        break;

      case 'clear':
        this.term.clear();
        this.write(this.prompt);
        this.buffer = '';
        break;

      case 'echo':
        this.writeln(args.join(' '));
        this.printPrompt();
        break;

      case 'date':
        this.writeln(new Date().toString());
        this.printPrompt();
        break;

      case 'version':
        this.writeln('web-cli v1.0');
        this.printPrompt();
        break;

      // -------- MULTI-STEP “EXPLAIN” COMMAND --------
      case 'explain':
        this.conversationMode = true;
        this.pendingCommand = 'explain';
        this.pendingPrompt = 'explain what?';
        this.writeln('Available Catalogue: FPV, Ultimate Frisbee, ML');
        this.printPrompt();
        if (args.length) {
          const response = this.runSubCommand(cmd, args[0]);
          if (response) this.writeln(response);

          // exit conversation mode
          this.conversationMode = false;
          this.pendingCommand = null;
          this.pendingPrompt = null;

          this.printPrompt();
        }
        break;
      case 'ls':
        // eslint-disable-next-line no-case-declarations
        const path = args[0] || '/';
        // eslint-disable-next-line no-case-declarations
        const treeOutput = this.listTreeAscii(path, this.fakeFS);
        this.writeln(treeOutput);
        this.printPrompt();
        break;

      default:
        this.writeln(`Command not found: ${cmd}`);
        this.printPrompt();
        break;
    }
  }

  // ---------- Subcommand handler (step 2) ----------
  private runSubCommand(parent: string, input: string): string {
    if (parent === 'explain') {
      switch (input.toLowerCase()) {
        case 'fpv':
          return '🚁 FPV = First Person View drone piloting with goggles.';
        case 'ultimate frisbee':
          return '🥏 Ultimate Frisbee = a fast-paced team disc sport.';
        case 'ml':
          return '🤖 ML = Machine Learning — algorithms that learn from data.';
        default:
          return `Invalid option: ${input}`;
      }
    }
    return '';
  }

  // ---------- History navigation ----------
  private navigateHistory(delta: number) {
    if (!this.history.length) return;

    if (this.historyIndex === -1) {
      this.historyIndex = 0;
    } else {
      this.historyIndex = Math.max(0, Math.min(this.history.length - 1, this.historyIndex + delta));
    }

    const entry = this.history[this.historyIndex] || '';

    // erase current
    for (let i = 0; i < this.buffer.length; i++) {
      this.term.write('\b \b');
    }

    this.buffer = entry;
    this.term.write(entry);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listTreeAscii(path: string, fs: any, prefix = ''): string {
    const node = this.resolvePath(path, fs);
    if (!node) return `Path not found: ${path}`;

    const keys = Object.keys(node);
    let output = '';

    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const connector = isLast ? '└─ ' : '├─ ';
      output +=
        prefix + connector + key + (node[key] && typeof node[key] === 'object' ? '/' : '') + '\r\n';

      if (node[key] && typeof node[key] === 'object') {
        const newPrefix = prefix + (isLast ? '   ' : '│  ');
        output += this.listTreeAscii(path + key + '/', fs, newPrefix);
      }
    });

    return output;
  }

  // Helper to resolve path
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private resolvePath(path: string, fs: any): any {
    const parts = path.split('/').filter(Boolean);
    let node = fs['/'];
    for (const part of parts) {
      if (!node[part]) return null;
      node = node[part];
    }
    return node;
  }

  // ---------- Tab completion ----------
  private handleTabComplete() {
    const prefix = this.buffer;
    const matches = this.commands.filter((c) => c.startsWith(prefix));

    if (matches.length === 1) {
      const completion = matches[0].slice(prefix.length);
      this.buffer += completion;
      this.term.write(completion);
    } else if (matches.length > 1) {
      this.writeln('');
      this.writeln(matches.join('    '));
      this.printPrompt();
      this.term.write(this.buffer);
    }
  }
}
