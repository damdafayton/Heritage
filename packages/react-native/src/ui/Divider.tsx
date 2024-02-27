import {Divider as DividerUI} from 'react-native-paper';
import {styles} from './styles';

export function Divider() {
  return (
    <DividerUI
      style={{marginBottom: 14, marginTop: styles.global.marginTop + 2}}
    />
  );
}
