import {appConfig} from '../../app.config';
import {logger as loggerOriginal} from 'react-native-logs';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTHENTICATION_TOKEN} from './constants';

export const logger = (logName: string) => {
  const _logger = loggerOriginal
    .createLogger({severity: appConfig.logSeverity})
    .extend(logName);

  const originalError = _logger.error;

  _logger.error = async (message, ...args: any[]) => {
    const token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN);

    Sentry.captureMessage(
      (String(message) || JSON.stringify(message)) + ` - ${token}`,
    );

    originalError(message, ...args);
  };

  return _logger;
};
