import {createContext} from 'react';
import {SubscriptionData} from '../hooks/useGetSubscriptionData';

type ContextType = {
  subscriptionData?: SubscriptionData;
  refetchSubscriptionData: Function;
  hostName: string;
};

export const HerritageWalletContext = createContext<ContextType>({
  subscriptionData: {},
  refetchSubscriptionData: () => {},
  hostname: '',
} as unknown as ContextType);
