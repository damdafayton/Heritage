import {useNavigation} from '@react-navigation/native';
import {useAccount} from 'wagmi';

import {BackgroundTask} from '../../molecules/BackgroundTask';
import {ContractData} from '../../molecules/ContractData';
import {HomeSubscribedType} from '../../typings/config';
import {Button, Divider, Text} from '../../ui';
import {DividerFollowerView} from '../../molecules/DividerFollowerView';
import {burnerWalletName} from '../../services/wagmi-burner/BurnerConnector';
import {ErrorBanner} from '../../molecules/ErrorBanner';
import {useState} from 'react';

export function HomeActions() {
  const navigation = useNavigation();

  const {connector} = useAccount();

  const isBurnerConnected = connector?.name === burnerWalletName;

  const [showBurnerBanner, setShowBurnerBanner] = useState(isBurnerConnected);

  return (
    <>
      <ErrorBanner
        visible={isBurnerConnected && showBurnerBanner}
        onPressDismiss={() => setShowBurnerBanner(false)}>
        <Text>
          You are running the app with a demo address. Dont forget to disconnect
          the demo address and connect your real address.
        </Text>
      </ErrorBanner>
      <ContractData />
      <Divider />
      <DividerFollowerView>
        <BackgroundTask />
      </DividerFollowerView>
      <Button
        mode="contained"
        onPress={() =>
          navigation.navigate(HomeSubscribedType.ENCRYPTED_DATA as never)
        }>
        {HomeSubscribedType.ENCRYPTED_DATA}
      </Button>
    </>
  );
}
