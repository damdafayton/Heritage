import {Address, useAccount, usePublicClient, useContractWrite} from 'wagmi';
import {Abi} from 'viem';

import {
  AddInheritantForm,
  AddInheritantVals,
} from '../../forms/AddInheritantForm';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {Fragment, useContext, useEffect, useState} from 'react';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {isSubscribed} from '../../helpers/isSubscribed';
import {Text} from '../../ui';
import {AppStateContext} from '../../context/AppState.context';
import {SuccessSnackbar} from '../../molecules/SuccessSnackbar';

export function AddInheritant() {
  const {setError, setSuccess} = useContext(AppStateContext);

  const {abi, address} = useHeritageWalletContract();

  const {
    write: writeAddInheritant,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi,
    address,
    functionName: 'addInheritant',
  });

  const onSubmitAddInheritant = async (vals: AddInheritantVals) => {
    try {
      await writeAddInheritant({args: [vals.address, BigInt(vals.percent)]});

      setSuccess({message: 'Inheritant added successfully.'});
    } catch (e) {
      setError({message: 'Something went wrong. Please try again'});
    }
  };

  const {subscriptionData} = useContext(HerritageWalletContext);

  const client = usePublicClient();

  const {address: userAddr} = useAccount();

  const getInheritants = async (
    address: Address,
    abi: Abi,
    userAddr: Address,
  ) => {
    const inheritants = [];

    for (const num of Array.from(Array(100).keys())) {
      try {
        const inheritant = await client.readContract({
          address,
          abi,
          functionName: 'addrInheritantListMap',
          args: [userAddr, BigInt(num)],
        });
        if (!inheritant) break;

        inheritants.push(inheritant as never);
      } catch {
        // array ended
        break;
      }
    }

    return inheritants;
  };

  const [inheritants, setInheritants] = useState([]);

  useEffect(() => {
    if (!isSubscribed(subscriptionData) || !address || !userAddr) return;

    if (inheritants.length && !isSuccess) return;

    getInheritants(address, abi, userAddr).then(
      inheritants =>
        //@ts-ignore
        console.log({inheritants}) || setInheritants(inheritants),
    );
  }, [subscriptionData, address, isSuccess]);

  const Inheritants = () =>
    inheritants?.map((inheritant, idx) => (
      <Fragment key={inheritant[0]}>
        <Text>Inheritant {idx + 1}: </Text>
        <Text>{inheritant[0]}: </Text>
        <Text>{parseInt(inheritant[1])}%</Text>
      </Fragment>
    ));

  return (
    <>
      <Inheritants />
      <AddInheritantForm
        onSubmit={onSubmitAddInheritant}
        isLoading={isLoading}
      />
    </>
  );
}
