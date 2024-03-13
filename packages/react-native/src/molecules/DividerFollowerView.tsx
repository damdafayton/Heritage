import {View} from 'react-native';

import {styles} from '../ui/styles';

export function DividerFollowerView({
  style,
  children,
  type = 'lg',
  ...props
}: {
  type?: 'sm' | 'lg';
  style?: any;
  children?: any;
}) {
  return (
    <View
      style={[
        {
          marginTop:
            type === 'sm'
              ? styles.text.marginTop
              : styles.global.marginTop - styles.text.marginTop,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}
