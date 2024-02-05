import {
  ActivityIndicator as ActivityIndicatorUI,
  MD2Colors,
  ActivityIndicatorProps,
} from 'react-native-paper';

export function ActivityIndicator(props: ActivityIndicatorProps) {
  return (
    <ActivityIndicatorUI animating={true} color={MD2Colors.red800} {...props} />
  );
}
