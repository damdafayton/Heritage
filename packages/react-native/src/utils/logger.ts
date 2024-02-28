import {appConfig} from '../../app.config';
import {logger as loggerOriginal} from 'react-native-logs';
import * as Sentry from '@sentry/react-native';

export const logger = (logName: string) => {
  const _logger = loggerOriginal
    .createLogger({severity: appConfig.logSeverity})
    .extend(logName);

  const originalError = _logger.error;

  _logger.error = (message, ...args: any[]) => {
    Sentry.captureMessage(String(message));
    originalError(message, ...args);
  };

  return _logger;
};
