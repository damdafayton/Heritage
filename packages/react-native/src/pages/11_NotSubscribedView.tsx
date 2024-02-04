import {Text, View} from 'react-native';
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
