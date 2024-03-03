import {createContext} from 'react';

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
});
