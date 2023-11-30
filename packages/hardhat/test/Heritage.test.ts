import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Heritage, HeritageWallet, Mock_AggregatorV3Interface } from "../typechain-types";
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

    console.log(`Heritage Proxy contract deployed to: ${heritageContract.target}.`);

    const currentImplAddress = await getImplementationAddress(ethers.provider, heritageContract.target as string);

    console.log(`Heritage Implementation contract deployed to: ${currentImplAddress}.`);

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

    // it("Should allow setting a new message", async function () {
    //   const newGreeting = "Learn Scaffold-ETH 2! :)";

    //   await heritageContract.setGreeting(newGreeting);
    //   expect(await heritageContract.greeting()).to.equal(newGreeting);
    // });
  });
});
