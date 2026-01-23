/**
 * Simple colorful logger utility
 * Provides structured logging with colors for better readability
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

interface LogContext {
    [key: string]: any;
}

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',

    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
};

const levelConfig = {
    info: { color: colors.blue, prefix: 'ℹ', label: 'INFO' },
    warn: { color: colors.yellow, prefix: '⚠', label: 'WARN' },
    error: { color: colors.red, prefix: '✖', label: 'ERROR' },
    success: { color: colors.green, prefix: '✓', label: 'SUCCESS' },
    debug: { color: colors.gray, prefix: '◆', label: 'DEBUG' },
};

function formatTimestamp(): string {
    const now = new Date();
    return `${colors.gray}${now.toISOString()}${colors.reset}`;
}

function formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
        return '';
    }

    const formatted = Object.entries(context)
        .map(([key, value]) => {
            const valueStr = typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value);
            return `${colors.cyan}${key}${colors.reset}=${colors.white}${valueStr}${colors.reset}`;
        })
        .join(' ');

    return ` ${colors.dim}|${colors.reset} ${formatted}`;
}

function log(level: LogLevel, message: string, context?: LogContext) {
    const config = levelConfig[level];
    const timestamp = formatTimestamp();
    const label = `${config.color}${config.prefix} ${config.label}${colors.reset}`;
    const msg = `${colors.bright}${message}${colors.reset}`;
    const ctx = formatContext(context);

    console.log(`${timestamp} ${label} ${msg}${ctx}`);
}

export const logger = {
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
    success: (message: string, context?: LogContext) => log('success', message, context),
    debug: (message: string, context?: LogContext) => log('debug', message, context),
};

// SSE-specific logger
export const sseLogger = {
    connected: (clientCount: number) => {
        logger.success('SSE client connected', { clients: clientCount });
    },

    disconnected: (clientCount: number, reason?: string) => {
        logger.info('SSE client disconnected', {
            clients: clientCount,
            ...(reason && { reason })
        });
    },

    broadcast: (eventType: string, clientCount: number, eventId: string) => {
        logger.info('SSE broadcast', {
            event: eventType,
            clients: clientCount,
            id: eventId
        });
    },

    ping: (clientCount: number) => {
        logger.debug('SSE ping sent', { clients: clientCount });
    },

    info: (message: string, context?: LogContext) => {
        logger.info(`SSE: ${message}`, context);
    },

    error: (message: string, error?: any) => {
        logger.error(`SSE error: ${message}`, error instanceof Error ? {
            message: error.message,
            stack: error.stack
        } : { error });
    },
};
