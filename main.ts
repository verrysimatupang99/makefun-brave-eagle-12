#!/usr/bin/env node
'use strict';

const ENTRY_LINE = 'Deprecated';
const VERSION = '1.0.0';
const PROGRAM = 'sunset';

/**
 * @typedef {'plain' | 'fancy' | 'json'} OutputFormat
 * @typedef {'canonical' | 'migration' | 'epitaph'} ModeName
 *
 * @typedef {object} Mode
 * @property {string} kicker
 * @property {string} note
 * @property {string} jsonLabel
 *
 * @typedef {object} CliOptions
 * @property {OutputFormat} format
 * @property {ModeName} mode
 * @property {boolean} help
 * @property {boolean} version
 */

/** @type {Record<ModeName, Mode>} */
const MODES = {
  canonical: {
    kicker: 'status',
    note: 'the whole message, in one word.',
    jsonLabel: 'canonical',
  },
  migration: {
    kicker: 'migration notice',
    note: 'still callable; no longer promised.',
    jsonLabel: 'migration',
  },
  epitaph: {
    kicker: 'end of support',
    note: 'the API is survived by its callers.',
    jsonLabel: 'epitaph',
  },
};

const ANSI = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  yellow: '\u001b[33m',
};

/**
 * Return the complete help text. Help is intentionally written to stderr so
 * stdout remains reserved for the product of the command.
 *
 * @returns {string}
 */
function helpText() {
  return `${PROGRAM} ${VERSION}

A tiny ceremonial CLI for one final status word.

Usage:
  node main.ts [options]

Options:
  --plain              Print the entry line in a restrained text layout (default)
  --fancy              Print the entry line in a Unicode box, with color on TTYs
  --json               Print machine-readable JSON
  --mode <name>        Select supporting phrasing: canonical, migration, epitaph
  --mode=<name>        Same as --mode <name>
  --version            Print the version number
  --help               Print this help text on stderr

Exit codes:
  0  success, including --help and --version
  2  invalid command line arguments
`;
}

/**
 * @param {string} text
 * @param {keyof typeof ANSI} color
 * @param {boolean} enabled
 * @returns {string}
 */
function paint(text, color, enabled) {
  if (!enabled) return text;
  return `${ANSI[color]}${text}${ANSI.reset}`;
}

/**
 * Center text using monospace character counts. All content rendered here is
 * deliberately narrow-band Unicode, so JavaScript string length is sufficient.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function center(text, width) {
  if (text.length >= width) return text;
  const remaining = width - text.length;
  const left = Math.floor(remaining / 2);
  return ' '.repeat(left) + text + ' '.repeat(remaining - left);
}

/**
 * @param {number} innerWidth
 * @returns {string}
 */
function emptyBoxLine(innerWidth) {
  return `│${' '.repeat(innerWidth)}│`;
}

/**
 * @param {string} text
 * @param {number} innerWidth
 * @returns {string}
 */
function boxedTextLine(text, innerWidth) {
  return `│${center(text, innerWidth)}│`;
}

/**
 * Render the default text layout.
 *
 * @param {Mode} mode
 * @returns {string}
 */
function renderPlain(mode) {
  return [
    `${mode.kicker} · ${PROGRAM}`,
    '',
    ENTRY_LINE,
    '',
    mode.note,
  ].join('\n');
}

/**
 * Render the boxed layout. ANSI styling is decorative only and is disabled
 * whenever stdout is not a terminal, keeping piped output clean.
 *
 * @param {Mode} mode
 * @param {boolean} color
 * @returns {string}
 */
function renderFancy(mode, color) {
  const terminalWidth = Number.isInteger(process.stdout.columns)
    ? process.stdout.columns
    : 72;
  const longest = Math.max(mode.kicker.length, ENTRY_LINE.length, mode.note.length);
  const preferredWidth = Math.max(longest + 12, 34);
  const availableWidth = Math.max(terminalWidth - 4, longest);
  const innerWidth = Math.min(preferredWidth, availableWidth, 64);

  const top = `╭${'─'.repeat(innerWidth)}╮`;
  const bottom = `╰${'─'.repeat(innerWidth)}╯`;
  const lines = [
    paint(top, 'yellow', color),
    paint(emptyBoxLine(innerWidth), 'yellow', color),
    paint(boxedTextLine(mode.kicker.toUpperCase(), innerWidth), 'dim', color),
    paint(emptyBoxLine(innerWidth), 'yellow', color),
    paint(boxedTextLine(ENTRY_LINE, innerWidth), 'bold', color),
    paint(emptyBoxLine(innerWidth), 'yellow', color),
    paint(boxedTextLine(mode.note, innerWidth), 'dim', color),
    paint(emptyBoxLine(innerWidth), 'yellow', color),
    paint(bottom, 'yellow', color),
  ];

  return lines.join('\n');
}

/**
 * @param {ModeName} modeName
 * @param {Mode} mode
 * @returns {string}
 */
function renderJson(modeName, mode) {
  return `${JSON.stringify({
    entry: ENTRY_LINE,
    mode: modeName,
    label: mode.jsonLabel,
    kicker: mode.kicker,
    note: mode.note,
    version: VERSION,
  }, null, 2)}\n`;
}

/**
 * Parse argv by hand. The parser accepts a compact, explicit surface and
 * rejects everything else rather than guessing.
 *
 * @param {string[]} argv
 * @returns {{ok: true, options: CliOptions} | {ok: false, message: string}}
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    format: 'plain',
    mode: 'canonical',
    help: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg === '--version') {
      options.version = true;
      continue;
    }

    if (arg === '--plain' || arg === '--fancy' || arg === '--json') {
      options.format = arg.slice(2);
      continue;
    }

    if (arg === '--mode') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        return { ok: false, message: '--mode requires a value: canonical, migration, or epitaph' };
      }
      if (!Object.hasOwn(MODES, value)) {
        return { ok: false, message: `unknown mode "${value}"; expected canonical, migration, or epitaph` };
      }
      options.mode = /** @type {ModeName} */ (value);
      index += 1;
      continue;
    }

    if (arg.startsWith('--mode=')) {
      const value = arg.slice('--mode='.length);
      if (!value) {
        return { ok: false, message: '--mode requires a value: canonical, migration, or epitaph' };
      }
      if (!Object.hasOwn(MODES, value)) {
        return { ok: false, message: `unknown mode "${value}"; expected canonical, migration, or epitaph` };
      }
      options.mode = /** @type {ModeName} */ (value);
      continue;
    }

    if (arg.startsWith('-')) {
      return { ok: false, message: `unknown option "${arg}"` };
    }

    return { ok: false, message: `unexpected positional argument "${arg}"` };
  }

  return { ok: true, options };
}

/**
 * @param {string} message
 */
function fail(message) {
  process.stderr.write(`${PROGRAM}: ${message}\n`);
  process.stderr.write(`Try 'node main.ts --help' for usage.\n`);
}

/**
 * @param {string[]} argv
 * @returns {number}
 */
function main(argv) {
  const parsed = parseArgs(argv);

  if (!parsed.ok) {
    fail(parsed.message);
    return 2;
  }

  if (parsed.options.help) {
    process.stderr.write(helpText());
    return 0;
  }

  if (parsed.options.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  const mode = MODES[parsed.options.mode];

  if (parsed.options.format === 'json') {
    process.stdout.write(renderJson(parsed.options.mode, mode));
    return 0;
  }

  if (parsed.options.format === 'fancy') {
    process.stdout.write(`${renderFancy(mode, Boolean(process.stdout.isTTY))}\n`);
    return 0;
  }

  process.stdout.write(`${renderPlain(mode)}\n`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
