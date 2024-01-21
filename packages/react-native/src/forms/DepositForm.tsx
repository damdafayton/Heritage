import {Picker} from '@react-native-picker/picker';
import {Formik} from 'formik';
import {FormEvent} from 'react';
import {Button, TextInput, View} from 'react-native';

export type DepositFormVals = {
  depositType: string;
  depositAmount: string;
};

export function DepositForm({
  onSubmit,
}: {
  onSubmit: (values: DepositFormVals) => void | Promise<any>;
}) {
  return (
    <Formik
      initialValues={{depositType: 'USD', depositAmount: ''}}
      onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
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
