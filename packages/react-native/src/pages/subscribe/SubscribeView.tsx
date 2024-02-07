import {ScrollView, StyleSheet, View} from 'react-native';
import {DepositForm, DepositFormSubmit} from '../../forms/DepositForm';
import {ContractData} from '../../molecules/ContractData';

type PropTypes = {
  handleFormSubmit: DepositFormSubmit;
};

export function SubscribeView({handleFormSubmit}: PropTypes) {
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
