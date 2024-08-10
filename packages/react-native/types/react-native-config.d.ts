declare module 'react-native-config' {
  export interface NativeConfig {
    HOSTNAME: string;
    LOG_SEVERITY: string;
    CHAIN: string;
    ALCHEMY_API_KEY: string;
    BURNER_PRIVATE_KEY: `0x${string}`;
    NODE_ENV?: 'production' | 'development';
    HARDHAT_RPC?: string;
    APP_CHECK_DEBUG_TOKEN?: string;
    MINIMUM_FETCH_INTERVAL: number;
    FIREBASE_API_KEY?: string; // used for web debug
  }

  export const Config: NativeConfig;
  export default Config;
}
