import {Picker} from '@react-native-picker/picker';
import {Formik} from 'formik';
import {FormEvent} from 'react';
import {Button, TextInput, View} from 'react-native';
import {Address} from 'viem';
import {DepositFormVals} from './DepositForm';

export type SendFundsFormVals = DepositFormVals & {receiverAddress: Address};

export function SendFundsForm({
  onSubmit,
}: {
  onSubmit: (values: SendFundsFormVals) => void | Promise<any>;
}) {
  return (
    <Formik
      initialValues={{
        receiverAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', //'0x',
        depositType: 'USD',
        depositAmount: '',
      }}
      onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
          <TextInput
            placeholder="Address"
            value={values.receiverAddress}
            onChangeText={handleChange('receiverAddress')}
            onBlur={handleBlur('receiverAddress')}
          />
          <TextInput
            placeholder="Amount to deposit"
            value={values.depositAmount}
            onChangeText={handleChange('depositAmount')}
            onBlur={handleBlur('depositAmount')}
          />
          <Picker
            selectedValue={values.depositType}
            onValueChange={handleChange('depositType')}>
            <Picker.Item label="USD" value="USD" />
            <Picker.Item label="ETH" value="ETH" />
          </Picker>
          <Button
            onPress={e =>
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }
            title="Submit"
          />
        </View>
      )}
    </Formik>
  );
}
