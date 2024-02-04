import {NotSubscribed} from './11_NotSubscribed';
import {Subscribed} from './12_Subscribed';

export function Main({isSubscribed}: {isSubscribed: boolean}) {
  return isSubscribed ? <Subscribed /> : <NotSubscribed />;
}
