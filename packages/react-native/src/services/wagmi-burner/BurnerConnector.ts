import {StaticJsonRpcProvider} from '@ethersproject/providers';
import {
  Chain,
  HttpTransport,
  PrivateKeyAccount,
  WalletClient,
  createWalletClient,
  http,
} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {Connector} from 'wagmi';

import {loadBurnerSK} from '../../helpers/burnerWallet';
import {
  BurnerConnectorError,
  BurnerConnectorErrorList,
} from './BurnerConnectorErrors';
import {
  BurnerConnectorData,
  BurnerConnectorOptions,
} from './BurnerConnectorTypes';
import {appConfig} from '../../../app.config';
import {logger} from '../../utils/logger';
const log = logger('BurnerConnector');

export const burnerWalletId = 'burner-wallet';
export const burnerWalletName = 'Demo Wallet';
export const defaultBurnerChainId = appConfig.targetNetwork?.id;

/**
 * This class is a wagmi connector for BurnerWallet.  Its used by {@link burnerWalletConfig}
 */
export class BurnerConnector extends Connector<
  StaticJsonRpcProvider,
  BurnerConnectorOptions
> {
  readonly id = burnerWalletId;
  readonly name = burnerWalletName;
  readonly ready = true;

  private provider?: StaticJsonRpcProvider;
  /**
   * this is the store for getWallet()
   */
  private burnerWallet:
    | WalletClient<HttpTransport, Chain, PrivateKeyAccount>
    | undefined;

  constructor(config: {chains?: Chain[]; options: BurnerConnectorOptions}) {
    super(config);
    this.burnerWallet = undefined;
  }

  async getProvider() {
    if (!this.provider) {
      const chain = this.getChainFromId();
      this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default.http[0]);
    }
    return this.provider;
  }

  async getWalletClient(config?: {chainId?: number | undefined} | undefined) {
    const chain = this.getChainFromId(config?.chainId);
    if (!this.burnerWallet) {
      const burnerAccount = privateKeyToAccount(loadBurnerSK());

      const client = createWalletClient({
        chain: chain,
        account: burnerAccount,
        transport: http(),
      });
      this.burnerWallet = client;
    }
    return Promise.resolve(this.burnerWallet);
  }

  async connect(
    config?: {chainId?: number | undefined} | undefined,
  ): Promise<Required<BurnerConnectorData>> {
    const chain = this.getChainFromId(config?.chainId);

    this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default.http[0]);
    const account = await this.getAccount();

    if (this.provider == null || account == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.couldNotConnect);
    }

    if (!account) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.accountNotFound);
    }

    const data: Required<BurnerConnectorData> = {
      account,
      chain: {
        id: chain.id,
        unsupported: false,
      },
      provider: this.provider,
    };

    return Promise.resolve(data);
  }
  private getChainFromId(chainId?: number) {
    const resolveChainId = chainId ?? this.options.defaultChainId;
    const chain = this.chains.find(f => f.id === resolveChainId);
    if (chain == null) {
      throw new BurnerConnectorError(
        BurnerConnectorErrorList.chainNotSupported,
      );
    }
    return chain;
  }

  disconnect(): Promise<void> {
    log.info('disconnect from burnerwallet');
    return Promise.resolve();
  }

  async getAccount(): Promise<`0x${string}`> {
    const burnerAccount = privateKeyToAccount(loadBurnerSK());
    return burnerAccount.address as `0x${string}`;
  }

  async getChainId(): Promise<number> {
    const network = await this.provider?.getNetwork();
    const chainId = network?.chainId ?? this.options.defaultChainId;
    if (chainId == null) {
      throw new BurnerConnectorError(
        BurnerConnectorErrorList.chainIdNotResolved,
      );
    }

    return Promise.resolve(chainId);
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  protected async onAccountsChanged() {
    const chainId = await this.getChainId();
    const chain = this.getChainFromId(chainId);
    const burnerAccount = privateKeyToAccount(loadBurnerSK());

    const client = createWalletClient({
      chain: chain,
      account: burnerAccount,
      transport: http(),
    });
    this.burnerWallet = client;
  }
  protected async onChainChanged() {
    const chainId = await this.getChainId();
    const chain = this.getChainFromId(chainId);
    const burnerAccount = privateKeyToAccount(loadBurnerSK());

    const client = createWalletClient({
      chain: chain,
      account: burnerAccount,
      transport: http(),
    });
    this.burnerWallet = client;
  }
  protected onDisconnect(error: Error): void {
    if (error) log.warn(error);
  }
}
