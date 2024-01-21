import {NotSubscribed} from './NotSubscribed';
import {Subscribed} from './Subscribed';

export function Main({isSubscribed}: {isSubscribed: boolean}) {
  return isSubscribed ? <Subscribed /> : <NotSubscribed />;
}
