import {Text, ScrollView, StyleSheet, View} from 'react-native';
import {DepositForm} from '../../forms/DepositForm';
import {ContractData} from '../../molecules/ContractData';

type PropTypes = {
  handleFormSubmit: (x: any) => void;
};

export function NotSubscribedView({handleFormSubmit}: PropTypes) {
  return (
    <ScrollView>
      <View style={styles.contract}>
        <ContractData />
      </View>
      <DepositForm onSubmit={handleFormSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contract: {
    marginBottom: 10,
  },
});
