import {appConfig} from '../../app.config';
import {logger as loggerOriginal, consoleTransport} from 'react-native-logs';
import * as Sentry from '@sentry/react-native';

const defaultConfig = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: 'debug',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellow',
      error: 'redBright',
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: true,
};

export const logger = (logName: string) => {
  const _logger = loggerOriginal
    .createLogger({...defaultConfig, severity: appConfig.logSeverity})
    .extend(logName);

  const originalError = _logger.error;

  _logger.error = async (message, ...args: any[]) => {
    Sentry.captureMessage(String(message) || JSON.stringify(message));

    originalError(message, ...args);
  };

  return _logger;
};
