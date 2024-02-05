import {Text, ScrollView} from 'react-native';
import {DepositForm} from '../../forms/DepositForm';

type PropTypes = {
  handleFormSubmit: (x: any) => void;
};

export function NotSubscribedView({handleFormSubmit}: PropTypes) {
  return (
    <ScrollView>
      <Text>Subscribe</Text>
      <DepositForm onSubmit={handleFormSubmit} />
    </ScrollView>
  );
}
