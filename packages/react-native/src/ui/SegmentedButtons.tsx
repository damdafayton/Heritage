import {
  SegmentedButtons as Component,
  SegmentedButtonsProps,
} from 'react-native-paper';

import {styles} from './styles';

export function SegmentedButtons(
  props: SegmentedButtonsProps & {withLabel?: boolean},
) {
  const {style, withLabel, ...rest} = props;

  return (
    <Component
      style={[styles.global, withLabel && {marginTop: 8}, style]}
      {...rest}
    />
  );
}
