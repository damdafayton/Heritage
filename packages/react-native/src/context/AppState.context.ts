import {createContext} from 'react';

export const AppStateContext = createContext({
  errors: [] as string[],
  clearErrors: () => {},
  setErrors: ({
    errors,
    modalError,
  }: {
    errors: string[];
    modalError?: boolean;
  }) => {},
  isModalError: false,
});
