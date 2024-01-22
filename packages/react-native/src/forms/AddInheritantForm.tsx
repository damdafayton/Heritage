import {Formik} from 'formik';
import {
  FormEvent,
  Fragment,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {isSubscribed} from '../helpers/isSubscribed';
import {Address, useAccount, usePublicClient} from 'wagmi';
import {useHeritageWalletContract} from '../hooks/useHeritageWalletContract';
import {Abi} from 'viem';

export type AddInheritantVals = {
  address: Address;
  percent: string;
};

export function AddInheritantForm({
  onSubmit,
  isSuccess,
}: {
  onSubmit: (values: AddInheritantVals) => void | Promise<any>;
  isSuccess: boolean;
}) {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  const {subscriptionData} = useContext(HerritageWalletContext);
  const {address, abi} = useHeritageWalletContract();

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
    console.log('addInheritantForm');
    if (!isSubscribed(subscriptionData) || !address || !userAddr) return;

    if (inheritants.length && !isSuccess) return;

    getInheritants(address, abi, userAddr).then(
      inheritants =>
        //@ts-ignore
        console.log({inheritants}) || setInheritants(inheritants),
    );
  }, [subscriptionData, address, isSuccess]);

  return (
    <View>
      {inheritants?.map((inheritant, idx) => (
        <Fragment key={inheritant[0]}>
          <Text>Inheritant {idx + 1}: </Text>
          <Text>{inheritant[0]}: </Text>
          <Text>{parseInt(inheritant[1])} %</Text>
        </Fragment>
      ))}
      <Formik
        initialValues={{
          address: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
          percent: '',
        }}
        onSubmit={onSubmit}>
        {({handleChange, handleBlur, handleSubmit, values}) => (
          <View>
            <Text>Add new inheritants</Text>
            <TextInput
              placeholder="Address"
              value={values.address}
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
            />
            <TextInput
              placeholder="Amount to deposit"
              value={values.percent}
              onChangeText={handleChange('percent')}
              onBlur={handleBlur('percent')}
            />
            <Button
              onPress={e =>
                handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
              }
              title="Submit"
            />
          </View>
        )}
      </Formik>
    </View>
  );
}
