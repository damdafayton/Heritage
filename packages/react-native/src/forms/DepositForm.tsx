import {Formik, FormikHelpers} from 'formik';
import {FormEvent} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';

import {TextInput} from '../ui/TextInput';
import {Text} from '../ui/Text';
import {HelperText} from '../ui/HelperText';
import {SegmentedButtons} from '../ui/SegmentedButtons';

export type DepositFormVals = {
  depositType: string;
  depositAmount: string;
};

type DepositFormProps = {
  onSubmit: DepositFormSubmit;
};

export type DepositFormSubmit = (
  values: DepositFormVals,
  actions: FormikHelpers<DepositFormVals>,
) => void | Promise<any>;

export function DepositForm({onSubmit}: DepositFormProps) {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const validate = values => {
    return sleep(1000).then(() => {
      const errors: any = {};

      const {depositAmount: _, depositType} = values;
      const depositAmount = Number(_);

      if (!depositAmount) {
        errors.depositAmount = 'Please type the amount';
      }

      if (!depositAmount) {
        errors.depositAmount = 'Value must be a number';
      }

      // @ts-ignore
      if (depositType === 'USD' && depositAmount > parseInt(depositAmount)) {
        errors.depositAmount = 'USD value must be a rational number';
      }

      return errors;
    });
  };

  return (
    <Formik
      validate={validate}
      validateOnMount={false}
      validateOnChange={false}
      initialValues={{depositType: 'USD', depositAmount: ''}}
      onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View style={styles.view}>
          <TextInput
            placeholder="Amount to deposit"
            value={values.depositAmount}
            onChangeText={handleChange('depositAmount')}
            onBlur={handleBlur('depositAmount')}
            error={!!errors.depositAmount}
          />
          {errors.depositAmount && (
            <HelperText type="error">{errors.depositAmount}</HelperText>
          )}
          <Text>Please choose deposit type</Text>
          <SegmentedButtons
            value={values.depositType}
            onValueChange={handleChange('depositType')}
            buttons={[
              {
                label: 'USD',
                value: 'USD',
              },
              {
                label: 'ETH',
                value: 'ETH',
              },
            ]}
          />
          <Button
            mode={'contained'}
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

const styles = StyleSheet.create({
  view: {
    flexDirection: 'column',
    rowGap: 15,
  },
});
