import {
  default as Component,
  Props,
} from 'react-native-paper/src/components/HelperText/HelperText';

export function HelperText({children, style, ...rest}: Props) {
  return (
    <Component style={[{marginBottom: 0, paddingBottom: 0}, style]} {...rest}>
      {children}
    </Component>
  );
}
