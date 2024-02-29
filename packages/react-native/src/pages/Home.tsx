import {useContext} from 'react';
import {HomeNonSubscribed} from './HomeNonSubscribed';
import {HomeStack} from './home-subscribed/HomeStack';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function Home() {
  const {isSubscribed} = useContext(HerritageWalletContext);

  return isSubscribed ? <HomeStack /> : <HomeNonSubscribed />;
}
