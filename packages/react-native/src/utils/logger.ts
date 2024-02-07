import {appConfig} from '../../app.config';
import {logger as loggerOriginal} from 'react-native-logs';

export const logger = (logName: string) =>
  loggerOriginal
    .createLogger({severity: appConfig.logSeverity})
    .extend(logName);
