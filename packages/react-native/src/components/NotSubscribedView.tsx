import {Button, Text, TextInput, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {FormEvent} from 'react';
import {Formik} from 'formik';

type PropTypes = {
  handleFormSubmit: (x: any) => void;
};

export function NotSubscribedView({handleFormSubmit}: PropTypes) {
  return (
    <View>
      <Text>Subscribe</Text>
      <Formik
        initialValues={{depositType: 'USD', depositAmount: ''}}
        onSubmit={handleFormSubmit}>
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
    </View>
  );
}
