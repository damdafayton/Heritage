import {Snackbar as Component, SnackbarProps} from 'react-native-paper';

export function Snackbar(props: SnackbarProps) {
  const {style, ...rest} = props;

  return (
    <Component duration={5000} style={[{marginBottom: 100}, style]} {...rest} />
  );
}
