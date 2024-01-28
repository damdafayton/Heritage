declare module 'react-native-config' {
  export interface NativeConfig {
    HOSTNAME: string;
    FIRESTORE_HOST: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
