import {TextInput as Component, TextInputProps} from 'react-native-paper';

import {styles} from './styles';

function _TextInput(props: TextInputProps) {
  const {style, ...rest} = props;

  return <Component style={[styles.global, style]} {...rest} />;
}

let TextInput = _TextInput as typeof _TextInput & {
  Icon: (TextInputIconProps) => JSX.Element;
};

//@ts-ignore
TextInput.Icon = Component.Icon;

export {TextInput};
