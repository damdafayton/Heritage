declare module 'react-native-config' {
  export interface NativeConfig {
    HOSTNAME: string;
    LOG_SEVERITY: string;
    CHAIN: string;
    PUBLIC_ALCHEMY_API_KEY: string;
    BURNER_PRIVATE_KEY: `0x${string}`;
    RUN_ENV?: 'production' | 'development';
    HARDHAT_RPC?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
