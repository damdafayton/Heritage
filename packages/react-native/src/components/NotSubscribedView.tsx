import {Text, TextInput, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useState} from 'react';

export function NotSubscribedView() {
  const [currency, setCurrency] = useState('US Dollar');

  return (
    <View>
      <Text> Demo Form </Text>
      <View>
        <TextInput placeholder="Email" />
        <TextInput secureTextEntry={true} placeholder="Password" />
        <Picker
          selectedValue={currency}
          onValueChange={currentCurrency => setCurrency(currentCurrency)}>
          <Picker.Item label="USD" value="US Dollars" />
          <Picker.Item label="EUR" value="Euro" />
          <Picker.Item label="NGN" value="Naira" />
        </Picker>
        <Text>Selected: {currency}</Text>
      </View>
    </View>
  );
}
