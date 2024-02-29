import {ActivityIndicator} from '../ui';

export function Loading({style = {}}) {
  return <ActivityIndicator style={[{marginTop: 20}, style]} />;
}
