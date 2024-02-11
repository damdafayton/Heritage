import {Text as Component, TextProps} from 'react-native-paper';
import {styles} from './styles';

export function Text<T extends never | undefined>(props: TextProps<T>) {
  const {style, ...rest} = props;

  return <Component style={[styles.text, style]} {...rest} />;
}
