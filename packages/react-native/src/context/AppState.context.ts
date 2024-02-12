import {createContext} from 'react';

export const AppStateContext = createContext({
  errors: [] as string[],
  successes: [] as string[],
  clearErrors: () => {},
  clearSuccesses: () => {},
  setError: ({
    message,
    isModalVisible,
  }: {
    message: string;
    isModalVisible?: boolean;
  }) => {},
  setSuccess: ({
    message,
    isModalVisible,
  }: {
    message: string;
    isModalVisible?: boolean;
  }) => {},
  isModalVisible: false,
});
