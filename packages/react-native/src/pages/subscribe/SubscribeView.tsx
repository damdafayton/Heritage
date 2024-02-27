import {ScrollView, StyleSheet, View} from 'react-native';
import {DepositForm, DepositFormSubmit} from '../../forms/DepositForm';
import {ContractData} from '../../molecules/ContractData';

type PropTypes = {
  handleFormSubmit: DepositFormSubmit;
  isLoading: boolean;
};

export function SubscribeView({handleFormSubmit, isLoading}: PropTypes) {
  return (
    <ScrollView>
      <ContractData />
      <DepositForm onSubmit={handleFormSubmit} isLoading={isLoading} />
    </ScrollView>
  );
}
