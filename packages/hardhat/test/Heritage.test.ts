import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Heritage, HeritageWallet, Mock_AggregatorV3Interface, HeritageV2 } from "../typechain-types";
import { Addressable } from "ethers";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

describe("HeritageContract", function () {
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

  async function deployHeritageWallet() {
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

    const heritageWallet = (await heritageWalletFactory.deploy(
      ownerAddress,
      ethUsdFeedAddr,
    )) as unknown as HeritageWallet;

    await heritageWallet.waitForDeployment();

    console.info(`HeritageWallet is deployed at: ${heritageWallet.target}.`);

    heritageWalletAddr = heritageWallet.target;
  }

  async function deployHeritage(usdMinFee = 5, feeThousandage = 1) {
    const heritageFactory = await ethers.getContractFactory("Heritage");

    const heritageContract = (await upgrades.deployProxy(
      heritageFactory,
      [heritageWalletAddr, usdMinFee, feeThousandage],
      {
        initializer: "initialize",
        kind: "uups",
      },
    )) as unknown as Heritage;

    console.info(`Heritage Proxy contract deployed to: ${heritageContract.target}.`);

    const currentImplAddress = await getImplementationAddress(ethers.provider, heritageContract.target as string);

    console.info(`Heritage Implementation contract deployed to: ${currentImplAddress}.`);

    heritageProxy = heritageContract;
  }

  before(async () => {
    const [owner] = await ethers.getSigners();
    ownerAddress = owner.address;

    await deployEthUsdFeedMock();
    await deployHeritageWallet();
  });

  describe("Deployment", function () {
    it("deploys", async () => {
      const usdMinFee = 5;
      const feeThousandage = 1;

      expect(await deployHeritage(usdMinFee, feeThousandage)).to.eql(undefined);
    });

    it("should have the correct owner", async function () {
      expect(await heritageProxy.owner()).to.equal(ownerAddress);
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
  });

  describe("Functions", () => {
    const usdMinFee = 7;
    const feeThousandage = 3;

    before(async () => {
      await deployHeritage(usdMinFee, feeThousandage);
    });

    it("registerSubscriber throws if called by not manager", async () => {
      const [, user] = await ethers.getSigners();

      await expect(heritageProxy.registerSubscriber(user)).rejectedWith(
        'OwnableUnauthorizedAccount("0x0165878A594ca255338adfa4d48449f69242Eb8F")',
      );
    });

    it("manager registers new user with default fee values", async () => {
      const [owner, user] = await ethers.getSigners();

      const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");
      const heritageWallet = new ethers.Contract(heritageWalletAddr as string, heritageWalletFactory.interface, owner);

      await heritageWallet.transferOwnership(heritageProxy.target);

      await heritageProxy.registerSubscriber(user);

      const [, ...subscription] = await heritageWallet.addressSubscriptionMap(user);

      expect(subscription).to.eql([7n, 3n, 0n, false, 0n, true]);
    });

    it("only manager can update default fees");

    it("only manager and owner withdraws fees and sends them to owner");
  });
});
