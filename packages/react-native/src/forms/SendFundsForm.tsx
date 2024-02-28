import {Formik} from 'formik';
import {FormEvent} from 'react';
import {StyleSheet, View} from 'react-native';
import {Address} from 'viem';
import {DepositFormVals} from './DepositForm';
import {SegmentedButtons} from '../ui/SegmentedButtons';
import {Button} from '../ui/Button';
import {TextInput} from '../ui/TextInput';
import {HelperText} from '../ui/HelperText';
import {Text} from '../ui/Text';
import {isAddress} from 'ethers';

export type SendFundsFormVals = DepositFormVals & {receiverAddress: Address};

export function SendFundsForm({
  onSubmit,
}: {
  onSubmit: (values: SendFundsFormVals) => void | Promise<any>;
}) {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const validate = values => {
    return sleep(1000).then(() => {
      const errors: any = {};

      const {depositAmount, depositType, receiverAddress} = values;

      if (!depositAmount) {
        errors.depositAmount = 'Please type the amount';
      } else if (!Number(depositAmount)) {
        errors.depositAmount = 'Value must be a number';
      } else if (
        depositType === 'USD' &&
        // @ts-ignore
        depositAmount > parseInt(Number(depositAmount))
      ) {
        errors.depositAmount = 'USD value must be a rational number';
      }

      if (!receiverAddress) {
        errors.receiverAddress = 'Type an address';
      } else if (!isAddress(values.address)) {
        errors.receiverAddress = 'Address is not correct';
      }

      return errors;
    });
  };

  return (
    <Formik
      validate={validate}
      validateOnMount={false}
      validateOnChange={false}
      initialValues={{
        receiverAddress: '' as Address, //'0x',
        depositType: 'USD',
        depositAmount: '',
      }}
      onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View style={styles.view}>
          <TextInput
            placeholder="Address"
            value={values.receiverAddress}
            onChangeText={handleChange('receiverAddress')}
            onBlur={handleBlur('receiverAddress')}
          />
          {errors.receiverAddress && (
            <HelperText type="error">{errors.receiverAddress}</HelperText>
          )}
          <TextInput
            placeholder="Amount to send"
            value={values.depositAmount}
            onChangeText={handleChange('depositAmount')}
            onBlur={handleBlur('depositAmount')}
          />
          {errors.depositAmount && (
            <HelperText type="error">{errors.depositAmount}</HelperText>
          )}
          <Text style={{marginTop: 14}}>Choose deposit type</Text>
          <SegmentedButtons
            withLabel={true}
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
            loading={false}
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
  },
});
