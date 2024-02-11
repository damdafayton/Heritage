import {TextInput as Component, TextInputProps} from 'react-native-paper';

import {styles} from './styles';

export function TextInput(props: TextInputProps) {
  const {style, ...rest} = props;

  return <Component style={[styles.global, style]} {...rest} />;
}
