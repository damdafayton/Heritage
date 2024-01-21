import {Formik} from 'formik';
import {FormEvent} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';

export function AddInheritantForm() {
  const handleFormSubmit = () => {};

  return (
    <Formik
      initialValues={{depositType: 'USD', depositAmount: ''}}
      onSubmit={handleFormSubmit}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
          <Text>Add new inheritants</Text>
          <TextInput
            placeholder="Amount to deposit"
            value={values.depositAmount}
            onChangeText={handleChange('depositAmount')}
            onBlur={handleBlur('depositAmount')}
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
  );
}
