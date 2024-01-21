import {createContext} from 'react';
import {SubscriptionData} from '../hooks/useGetSubscriptionData';

type ContextType = {
  subscriptionData: SubscriptionData;
  refetchSubscriptionData: Function;
};

export const HerritageWalletContext = createContext<ContextType>({
  subscriptionData: {},
  refetchSubscriptionData: {},
} as ContextType);
