import pino from 'pino';
import { inspect } from 'node:util';

const isDev = process.env.NODE_ENV !== 'production';

const levelColors: Record<number, string> = {
  10: '\x1b[90m',   // trace - gray
  20: '\x1b[36m',   // debug - cyan
  30: '\x1b[32m',   // info  - green
  40: '\x1b[33m',   // warn  - yellow
  50: '\x1b[31m',   // error - red
  60: '\x1b[41m',   // fatal - red bg
};
const reset = '\x1b[0m';

const prettyDestination = {
  write(chunk: string) {
    const { level, time, msg, ...rest } = JSON.parse(chunk);
    const label = (pino.levels.labels[level] ?? 'INFO').toUpperCase().padEnd(5);
    const color = levelColors[level] ?? '';
    const ts = new Date(time).toLocaleTimeString('en-GB', { hour12: false });
    const props = Object.keys(rest).length
      ? `\n${inspect(rest, { colors: true, depth: 6 })}`
      : '';
    process.stdout.write(`${color}[${ts}] ${label}${reset} ${msg}${props}\n`);
  },
};

export const logger = isDev
  ? pino({ level: process.env.LOG_LEVEL || 'info' }, prettyDestination)
  : pino({ level: process.env.LOG_LEVEL || 'info' });
