import {Formik} from 'formik';
import {FormEvent} from 'react';
import {View} from 'react-native';
import {Address} from 'wagmi';
import {isAddress} from 'ethers';

import {Button, HelperText, Text, TextInput} from '../ui';
import {logger} from '../utils/logger';
const log = logger('AddInheritantForm');

export type AddInheritantVals = {
  address: Address;
  percent: number;
};

export function AddInheritantForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (values: AddInheritantVals) => void;
  isLoading: boolean;
}) {
  return (
    <Formik
      initialValues={{
        address: '',
        percent: '',
      }}
      validateOnChange={false}
      validateOnMount={false}
      validateOnBlur={false}
      validate={values => {
        const errors: any = {};

        const percentInt = parseInt(values.percent);

        if (!percentInt) errors.percent = 'Must be a number';

        if (!isAddress(values.address)) errors.address = 'Invalid address type';

        return errors;
      }}
      onSubmit={(values, {resetForm}) => {
        const valuesTransformed = {
          address: values.address as Address,
          percent: parseInt(values.percent),
        };

        onSubmit(valuesTransformed);
        resetForm();
      }}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View>
          <TextInput
            placeholder="Address"
            value={values.address}
            onChangeText={handleChange('address')}
            onBlur={handleBlur('address')}
          />
          {errors.address && (
            <HelperText type="error">{errors.address}</HelperText>
          )}
          <TextInput
            placeholder="Percentage"
            value={values.percent}
            onChangeText={handleChange('percent')}
            onBlur={handleBlur('percent')}
          />
          {errors.percent && (
            <HelperText type="error">{errors.percent}</HelperText>
          )}
          <Button
            mode="contained"
            loading={isLoading}
            onPress={e =>
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }>
            Submit
          </Button>
        </View>
      )}
    </Formik>
  );
}
