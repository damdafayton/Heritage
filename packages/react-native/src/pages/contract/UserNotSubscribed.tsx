import {Linking, StyleSheet} from 'react-native';
import {useContext, useState} from 'react';

import {Button, Divider, Text} from '../../ui';
import {Subscribe} from './subscribe/Subscribe';
import {ContractData} from '../../molecules/ContractData';
import {DividerFollowerView} from '../../molecules/DividerFollowerView';
import {useAccount} from 'wagmi';
import {AppStateContext} from '../../context/AppState.context';
import {logger} from '../../utils/logger';
const log = logger('UserNotSubscribed');

export function UserNotSubscribed() {
  const [visible, setVisible] = useState(false);
  const {address} = useAccount();

  const {setSuccess} = useContext(AppStateContext);

  const goToFaucet = () => {
    Linking.openURL('https://www.alchemy.com/faucets/ethereum-sepolia');
  };

  return (
    <>
      <ContractData />
      <Divider />
      <DividerFollowerView>
        <Text style={[styles.text]}>
          Your address is not registered in the smart contract yet. Click below
          button to register your address.
          {/* {!appConfig.onlyLocalBurnerWallet && (
            <Text selectable={true}>
              To register your address you need to have some tokens. If you
              don't have any,{' '}
              <Text onPress={goToFaucet}>
                <Text>press here</Text>
              </Text>{' '}
              and request free tokens for the address:{' '}
              <Text
                onPress={() => {
                  Clipboard.setString(address as string);
                  setSuccess({message: 'Address copied to clipboard'});
                }}>
                {address}
              </Text>
            </Text>
          )} */}
        </Text>

        <Button mode="contained" onPress={() => setVisible(true)}>
          Register
        </Button>
        <Subscribe visible={visible} setVisible={setVisible} />
      </DividerFollowerView>
    </>
  );
}

const styles = StyleSheet.create({
  view: {},
  title: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  text: {
    alignSelf: 'center',
    lineHeight: 19,
  },
});
