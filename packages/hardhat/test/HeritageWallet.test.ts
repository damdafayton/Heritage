// yarn test --grep "HeritageWallet"

import { expect } from "chai";
import { ethers } from "hardhat";
import { HeritageWallet, ExposedHeritageWallet, Mock_AggregatorV3Interface } from "../typechain-types";
import { Addressable } from "ethers";

describe("HeritageWallet", function () {
  // We define a fixture to reuse the same setup in every test.

  let heritageWallet: HeritageWallet;
  let exposedHeritageWallet: ExposedHeritageWallet;

  before(async () => {
    const ethUsdFeedAddress = await deployEthUsdFeedMock();

    const [owner] = await ethers.getSigners();
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

    heritageWallet = (await heritageWalletFactory.deploy(
      owner.address,
      ethUsdFeedAddress,
    )) as unknown as HeritageWallet;

    await heritageWallet.waitForDeployment();

    const exposedHeritageWalletFactory = await ethers.getContractFactory("ExposedHeritageWallet");

    exposedHeritageWallet = (await exposedHeritageWalletFactory.deploy(
      owner.address,
      ethUsdFeedAddress,
    )) as unknown as ExposedHeritageWallet;

    await exposedHeritageWallet.waitForDeployment();
  });

  describe("Functions", function () {
    it("getEthPrice() should return ETH-USD price and decimals", async function () {
      expect(await heritageWallet.getEthPrice()).to.eql([BigInt(197441746000), BigInt(8)]);
    });

    it("_numDigits() returns given price in WEI", async function () {
      expect(await exposedHeritageWallet.numDigits(2000)).to.eql(4n);
    });

    it("_convertPriceToWei() returns given price in WEI", async function () {
      const priceInWei = await exposedHeritageWallet.convertPriceToWei(5, 20000, 5);

      expect(priceInWei).to.eql(250000000000000n);
    });

    it("_findYearsBetweenTimestamps() calculates 1 for count of subscription fees", async () => {
      const startTime = Date.now();
      const endTime = startTime + 1;

      const years = await exposedHeritageWallet.findYearsBetweenTimestamps(startTime, endTime);

      expect(years).to.eql(1n);
    });

    it("_findYearsBetweenTimestamps() calculates 2 for count of subscription fees", async () => {
      const date = new Date(Date.now());
      const startTime = date.setFullYear(2022);
      const endTime = date.setFullYear(2023);

      const years = await exposedHeritageWallet.findYearsBetweenTimestamps(startTime, endTime);

      expect(years).to.eql(2n);
    });

    it("calculateFeeToPay() calculates the last year's fee to pay for a given address", async function () {
      expect(1).to.eql(1);
    });
  });
});

async function deployEthUsdFeedMock(): Promise<string | Addressable> {
  console.info(`Deploying eth-Usd price feed mock.`);

  const priceFeedMockFactory = await ethers.getContractFactory("Mock_AggregatorV3Interface");

  const priceFeedMock = (await priceFeedMockFactory.deploy()) as unknown as Mock_AggregatorV3Interface;

  await priceFeedMock.waitForDeployment();

  console.info(`Eth-Usd price feed mock deployed to ${priceFeedMock.target}.`);

  return priceFeedMock.target;
}
