import {NotSubscribed} from './NotSubscribed';
import {Subscribed} from './Subscribed';

export function Subscribe({isSubscribed}: {isSubscribed: boolean}) {
  return isSubscribed ? <Subscribed /> : <NotSubscribed />;
}
