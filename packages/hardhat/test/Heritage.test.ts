// $ yarn test --grep "HeritageProxyContract Deployment deploys"

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Heritage, HeritageWallet, Mock_AggregatorV3Interface, HeritageV2 } from "../typechain-types";
import { Addressable } from "ethers";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

describe("HeritageProxyContract", function () {
  // We define a fixture to reuse the same setup in every test.
  let heritageProxy: Heritage;
  let ownerAddress: string | Addressable;
  let heritageWalletAddr: string | Addressable;
  let ethUsdFeedAddr: string | Addressable;

  async function deployEthUsdFeedMock() {
    console.info(`Deploying ETH-USD price feed mock.`);

    const priceFeedMockFactory = await ethers.getContractFactory("Mock_AggregatorV3Interface");

    const priceFeedMock = (await priceFeedMockFactory.deploy()) as unknown as Mock_AggregatorV3Interface;

    await priceFeedMock.waitForDeployment();

    console.info(`ETH-USD price feed mock deployed to ${priceFeedMock.target}.`);

    ethUsdFeedAddr = priceFeedMock.target;
  }

  async function deployHeritageWallet(usdMinFee = 5, feeThousandage = 1) {
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

    const heritageWallet = (await heritageWalletFactory.deploy(
      ownerAddress,
      usdMinFee,
      feeThousandage,
    )) as unknown as HeritageWallet;

    await heritageWallet.waitForDeployment();

    console.info(`HeritageWallet is deployed at: ${heritageWallet.target}.`);

    heritageWalletAddr = heritageWallet.target;
  }

  async function deployHeritage() {
    const heritageFactory = await ethers.getContractFactory("Heritage");

    const heritageContract = (await upgrades.deployProxy(heritageFactory, [heritageWalletAddr, ethUsdFeedAddr], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as Heritage;

    console.info(`Heritage Proxy contract deployed to: ${heritageContract.target}.`);

    const currentImplAddress = await getImplementationAddress(ethers.provider, heritageContract.target as string);

    console.info(`Heritage Implementation contract deployed to: ${currentImplAddress}.`);

    heritageProxy = heritageContract;

    const heritageWallet = await getHeritageWalletContract();

    await heritageWallet.setHeritageProxyAddress(heritageProxy.target);
    await heritageWallet.transferOwnership(heritageProxy.target);
  }

  async function getHeritageWalletContract() {
    const [owner] = await ethers.getSigners();

    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");
    const heritageWallet = new ethers.Contract(
      heritageWalletAddr as string,
      heritageWalletFactory.interface,
      owner,
    ) as unknown as HeritageWallet;

    return heritageWallet;
  }

  before(async () => {
    const [owner] = await ethers.getSigners();
    ownerAddress = owner.address;

    await deployEthUsdFeedMock();

    await deployHeritageWallet();
  });

  describe("Deployment", function () {
    it("deploys", async () => {
      expect(await deployHeritage()).to.eql(undefined);
    });

    it("should have the correct owner", async function () {
      expect(await heritageProxy.owner()).to.equal(ownerAddress);
    });

    it("should have correct Heritage Wallet being set", async () => {
      expect(await heritageProxy.heritageWalletAddr()).to.equal(heritageWalletAddr);
    });

    it("upgrades the contract", async () => {
      const heritageFactoryV2 = await ethers.getContractFactory("HeritageV2");

      heritageProxy = (await upgrades.upgradeProxy(heritageProxy.target, heritageFactoryV2)) as unknown as HeritageV2;

      console.info("Heritage upgraded.");

      const currentImplAddress = await getImplementationAddress(ethers.provider, heritageProxy.target as string);

      console.info(`Heritage Implementation contract deployed to: ${currentImplAddress}.`);

      const proxyAfterUpgrade = heritageProxy as HeritageV2;

      expect(await proxyAfterUpgrade.foo()).to.eql(5n);
    });

    it("transferHeritageWalletOwner() transfers ownership of the HeritageWallet", async () => {
      const [, , user] = await ethers.getSigners();

      const heritageWallet = await getHeritageWalletContract();
      const initalOwner = await heritageWallet.owner();

      // Set at deploy func
      expect(initalOwner).to.equal(heritageProxy.target);

      await heritageProxy.transferHeritageWalletOwner(user);

      const newOwner = await (await getHeritageWalletContract()).owner();

      expect(newOwner).to.equal(user.address);
    });
  });

  describe("Functions", () => {
    const usdMinFee = 7;
    const feeThousandage = 3;

    beforeEach(async () => {
      await deployHeritageWallet(usdMinFee, feeThousandage);
      await deployHeritage();
    });

    it("owner can withdraw collected fees", async () => {
      const [owner, manager, user] = await ethers.getSigners();

      const heritageWallet = await getHeritageWalletContract();

      await heritageProxy.updateManager(manager);
      await heritageWallet.connect(user).registerSubscriber({ value: ethers.parseEther("50") });

      await heritageProxy.payOutstandingFees(user);
      await heritageProxy.connect(manager).distributeHeritage(user);

      const ownerInitialBalance = await ethers.provider.getBalance(owner);
      await heritageProxy.withdrawCollectedFees(owner);
      const ownerBalanceWithFees = await ethers.provider.getBalance(owner);

      // Eth value of min fee
      expect(ownerBalanceWithFees - ownerInitialBalance).to.be.above(200500277054178906n);
    });

    it("addressSubscriptionMap calls HeritageWallet for the data", async () => {
      const [, , user] = await ethers.getSigners();

      const subscriptionStatus = await heritageProxy.addressSubscriptionMap(user);

      expect(subscriptionStatus).eql([0n, 0n, 0n, 0n, false, 0n, false]);
    });
  });

  describe("Security", () => {
    before(async () => {
      await deployHeritage();
    });
  });
});
