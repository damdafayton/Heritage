import {createContext} from 'react';

export const AppStateContext = createContext({
  errors: [] as string[],
  successes: [] as string[],
  clearErrors: () => {},
  clearSuccesses: () => {},
  setErrors: ({
    errors,
    modalError,
  }: {
    errors: string[];
    modalError?: boolean;
  }) => {},
  setSuccesses: ({
    successes,
    modalSuccess,
  }: {
    successes: string[];
    modalSuccess?: boolean;
  }) => {},
  isModalError: false,
  isModalSuccess: false,
});
