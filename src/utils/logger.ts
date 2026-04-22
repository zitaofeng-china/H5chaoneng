/**
 * 统一日志工具
 * 在生产环境中可以关闭详细日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  prefix?: string
  enabled?: boolean
  level?: LogLevel
}

class Logger {
  private prefix: string
  private enabled: boolean
  private level: LogLevel

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || ''
    this.enabled = options.enabled ?? import.meta.env.DEV
    this.level = options.level || 'debug'
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage(message), ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message), ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message), ...args)
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message), ...args)
    }
  }
}

/**
 * 创建日志实例
 * @param prefix 日志前缀
 * @param options 配置选项
 * @returns Logger 实例
 */
export function createLogger(prefix: string, options: Omit<LoggerOptions, 'prefix'> = {}): Logger {
  return new Logger({ ...options, prefix })
}

// 导出默认日志实例
export const logger = new Logger()
