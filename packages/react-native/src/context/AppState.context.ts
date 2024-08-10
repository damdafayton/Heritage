import {createContext} from 'react';
import {AppMode} from '../types/types';

export const AppStateContext = createContext({
  errors: [] as string[],
  clearErrors: () => {},
  clearSuccesses: () => {},
  setError: ({
    message,
    isModalVisible,
  }: {
    message: string;
    isModalVisible?: boolean;
  }) => {},
  successes: [] as string[],
  setSuccess: ({
    message,
    isModalVisible,
  }: {
    message: string;
    isModalVisible?: boolean;
  }) => {},
  isModalVisible: false,
  appMode: undefined as unknown as `${AppMode}`,
  setAppMode: (() => {}) as any,
});
