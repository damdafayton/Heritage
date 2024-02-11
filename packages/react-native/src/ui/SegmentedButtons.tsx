import {
  SegmentedButtons as Component,
  SegmentedButtonsProps,
} from 'react-native-paper';

import {styles} from './styles';

export function SegmentedButtons(props: SegmentedButtonsProps) {
  const {style, ...rest} = props;

  return <Component style={[styles.global, style]} {...rest} />;
}
