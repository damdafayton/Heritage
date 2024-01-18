import {isSubscribed} from '../helpers/isSubscribed';
import {NotSubscribed} from './NotSubscribed';
import {Subscribed} from './Subscribed';

export function Main({subscriptionData, refetchSubscriptionData}) {
  return isSubscribed(subscriptionData) ? (
    <Subscribed subscriptionData={subscriptionData} />
  ) : (
    <NotSubscribed refetchAddressSubscriptionMap={refetchSubscriptionData} />
  );
}
