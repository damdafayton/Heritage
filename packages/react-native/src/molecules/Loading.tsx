import {ActivityIndicator, Text} from '../ui';
import {styles} from '../ui/styles';

export function Loading({text = '', style = {}}) {
  return (
    <>
      {text && <Text style={{textAlign: 'center'}}>{text}</Text>}
      <ActivityIndicator
        style={[{marginTop: styles.global.marginTop}, style]}
      />
    </>
  );
}
