import {createContext} from 'react';

export const AppStateContext = createContext({
  errors: [],
  clearErrors: () => {},
});
