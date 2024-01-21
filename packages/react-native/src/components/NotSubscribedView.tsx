import {Button, Text, TextInput, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {FormEvent} from 'react';
import {Formik} from 'formik';
import {DepositForm} from '../forms/DepositForm';

type PropTypes = {
  handleFormSubmit: (x: any) => void;
};

export function NotSubscribedView({handleFormSubmit}: PropTypes) {
  return (
    <View>
      <Text>Subscribe</Text>
      <DepositForm onSubmit={handleFormSubmit} />
    </View>
  );
}
