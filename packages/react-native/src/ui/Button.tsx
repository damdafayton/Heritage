import {Button as ButtonUI, ButtonProps} from 'react-native-paper';

import {styles} from './styles';

export function Button({style, children, ...props}: ButtonProps) {
  return (
    <ButtonUI style={[styles.global, style]} {...props}>
      {children}
    </ButtonUI>
  );
}
