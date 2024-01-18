import {SubscriptionData} from '../hooks/useGetSubscriptionData';

export function isSubscribed(subscriptionData?: SubscriptionData) {
  if (!subscriptionData) return false;

  const startTimestamp = subscriptionData.startTimestamp;

  return startTimestamp ? true : false;
}
