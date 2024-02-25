declare module 'react-native-config' {
  export interface NativeConfig {
    HOSTNAME: string;
    FIRESTORE_HOST: string;
    LOG_SEVERITY: string;
    CHAIN: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
