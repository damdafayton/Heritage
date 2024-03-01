import {
  Address,
  useAccount,
  usePublicClient,
  useContractWrite,
  useNetwork,
  useContractRead,
} from 'wagmi';
import {Abi} from 'viem';

import {
  AddInheritantForm,
  AddInheritantVals,
} from '../../forms/AddInheritantForm';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {useContext, useEffect, useState} from 'react';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {isSubscribed} from '../../helpers/isSubscribed';
import {List, Tooltip} from '../../ui';
import {AppStateContext} from '../../context/AppState.context';
import {logger} from '../../utils/logger';
import {Loading} from '../../molecules/Loading';
import {sleep} from '../../utils/utils';
const log = logger('AddInheritant');

export function AddInheritant() {
  const [inheritants, setInheritants] = useState<any[] | undefined>(undefined);
  const {setError, setSuccess} = useContext(AppStateContext);
  const {abi, address} = useHeritageWalletContract();

  const {
    isSuccess,
    isLoading,
    writeAsync: writeAddInheritant,
  } = useContractWrite({
    abi,
    address,
    functionName: 'addInheritant',
  });

  const onSubmitAddInheritant = async (vals: AddInheritantVals) => {
    try {
      // await Promise.all([
      //   sleep(6000),
      //   writeAddInheritant({args: [vals.address, BigInt(vals.percent)]}),
      // ]);

      await writeAddInheritant({args: [vals.address, BigInt(vals.percent)]});

      setSuccess({message: 'Inheritant added successfully.'});
    } catch (e) {
      setError({message: 'Something went wrong. Please try again'});
    }
  };

  const {subscriptionData} = useContext(HerritageWalletContext);

  const client = usePublicClient();

  const {address: userAddr} = useAccount();

  const readInheritants = async (
    address: Address,
    abi: Abi,
    userAddr: Address,
  ) => {
    const inheritants = [];

    for await (const num of Array.from(Array(100).keys())) {
      try {
        const inheritant = await client.readContract({
          address,
          abi,
          functionName: 'addrInheritantListMap',
          args: [userAddr, BigInt(num)],
        });
        if (!inheritant) break;

        inheritants.push(inheritant as never);
      } catch (e) {
        // contract array finished, end the loop
        break;
      }
    }
    return inheritants;
  };

  useEffect(() => {
    if (!isSubscribed(subscriptionData) || !address || !userAddr) return;

    log.debug('readInheritants', {
      subscriptionData,
      address,
      isSuccess,
      setInheritants,
    });
    readInheritants(address, abi, userAddr).then(inheritants => {
      setInheritants(inheritants);
    });
  }, [subscriptionData, address, isSuccess, setInheritants]);

  return (
    <>
      <AddInheritantForm
        onSubmit={onSubmitAddInheritant}
        isLoading={isLoading}
      />
      {inheritants ? <Inheritants inheritants={inheritants} /> : <Loading />}
    </>
  );
}

const Inheritants = ({inheritants}) =>
  inheritants?.length ? (
    <List.Section title="Inheritants" style={{marginTop: 20}}>
      {inheritants?.map((inheritant: string[], idx) => (
        <List.Accordion
          key={idx}
          title={`Inheritant-${idx + 1}: ${parseInt(inheritant[1])}%`}
          left={props => <List.Icon {...props} icon="human" />}>
          <Tooltip title={inheritant[0]}>
            <List.Item
              title={`Address: ${
                inheritant[0]?.slice(0, 10) + '...' + inheritant[0].slice(-5)
              }`}
            />
          </Tooltip>
        </List.Accordion>
      ))}
    </List.Section>
  ) : null;
