import {HomeNonSubscribed} from './HomeNonSubscribed';
import {HomeStack} from './home-subscribed/HomeStack';

export function Home({
  isSubscribed,
  isConnected,
}: {
  isConnected: boolean;
  isSubscribed: boolean;
}) {
  return isSubscribed ? (
    <HomeStack />
  ) : (
    <HomeNonSubscribed isConnected={isConnected} />
  );
}
