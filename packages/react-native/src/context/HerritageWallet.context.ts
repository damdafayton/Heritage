import {createContext} from 'react';
import {SubscriptionData} from '../hooks/useGetSubscriptionData';

type ContextType = {
  subscriptionData?: SubscriptionData;
  isSubscribed: boolean;
  isConnected: boolean;
  refetchSubscriptionData: Function;
  hostName: string;
  minFeePerYear?: number;
  feeThousandagePerYear?: number;
};

export const HerritageWalletContext = createContext<ContextType>({
  subscriptionData: {},
  refetchSubscriptionData: () => {},
  hostName: '',
} as unknown as ContextType);
