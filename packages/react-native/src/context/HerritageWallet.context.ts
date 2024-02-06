import {createContext} from 'react';
import {SubscriptionData} from '../hooks/useGetSubscriptionData';

type ContextType = {
  subscriptionData?: SubscriptionData;
  refetchSubscriptionData: Function;
  hostName: string;
  minFeePerYear?: number;
  feeThousandagePerYear?: number;
};

export const HerritageWalletContext = createContext<ContextType>({
  subscriptionData: {},
  refetchSubscriptionData: () => {},
  hostname: '',
} as unknown as ContextType);
