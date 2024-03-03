import {useNavigation} from '@react-navigation/native';
import {BackgroundTask} from '../../molecules/BackgroundTask';
import {ContractData} from '../../molecules/ContractData';
import {HomeSubscribedType} from '../../typings/config';
import {Button, Divider, SegmentedButtons} from '../../ui';
import {DividerFollowerView} from '../../molecules/DividerFollowerView';

export function HomeActions() {
  const navigation = useNavigation();

  return (
    <>
      <ContractData />
      <Divider />
      <DividerFollowerView>
        <BackgroundTask />
      </DividerFollowerView>
      <Button
        mode="contained"
        onPress={() =>
          navigation.navigate(HomeSubscribedType.ENCRYPTED_DATA as never)
        }>
        {HomeSubscribedType.ENCRYPTED_DATA}
      </Button>
    </>
  );
}
