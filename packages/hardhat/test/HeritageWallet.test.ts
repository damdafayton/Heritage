import { expect } from "chai";
import { ethers } from "hardhat";
import { HeritageWallet, ExposedHeritageWallet, Mock_AggregatorV3Interface } from "../typechain-types";
import { Addressable } from "ethers";

describe("HeritageWallet", function () {
  // We define a fixture to reuse the same setup in every test.

  let heritageWallet: HeritageWallet;
  let exposedHeritageWallet: ExposedHeritageWallet;
  let ownerAddress: string;
  let ethUsdFeedAddress: string | Addressable;

  before(async () => {
    ethUsdFeedAddress = await deployEthUsdFeedMock();

    const [owner] = await ethers.getSigners();

    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

    ownerAddress = owner.address;

    heritageWallet = (await heritageWalletFactory.deploy(ownerAddress, ethUsdFeedAddress)) as unknown as HeritageWallet;

    await heritageWallet.waitForDeployment();

    const exposedHeritageWalletFactory = await ethers.getContractFactory("ExposedHeritageWallet");

    exposedHeritageWallet = (await exposedHeritageWalletFactory.deploy(
      ownerAddress,
      ethUsdFeedAddress,
    )) as unknown as ExposedHeritageWallet;

    await exposedHeritageWallet.waitForDeployment();
  });

  describe("Subscription", function () {
    let subscriberAddr: string;

    it("registerSubscriber() registers a new inheritance record", async () => {
      // eslint-disable-next-line
      const [_, secondAddr] = await ethers.getSigners();
      subscriberAddr = secondAddr.address;
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(secondAddr.address, minFeeUsd, feeThousandage, { from: ownerAddress });

      // eslint-disable-next-line
      const [timestamp, ...subscriptonDataOfUser] = await heritageWallet.addressSubscriptionMap(subscriberAddr);

      expect(subscriptonDataOfUser).to.eql([7n, 1n, 0n, false, 0n, true]);
    });

    it("calculateFeeToPay() calculates a fee to pay in WEI", async () => {
      const fee = await heritageWallet.calculateFeeToPay(subscriberAddr);

      expect(fee).to.eql(354534952299n);
    });

    it("payOutstandingFees()");

    it("distributeHeritage()");

    it("addInheritant()");

    it("getRemainingInheritancePercentage()");
  });

  describe("Wallet functionalities", function () {
    it("deposit() deposits to given address", async () => {
      const [, secondAddr] = await ethers.getSigners();

      await heritageWallet.deposit(secondAddr.address, {
        gasLimit: 3000000,
        value: ethers.parseEther("0.235"),
      });

      const data = await heritageWallet.addressSubscriptionMap(secondAddr.address);

      expect(data[5]).to.eql(ethers.parseEther("0.235"));
    });

    it("deposit() emits event when there is a new deposit", async () => {
      const [from, secondAddr] = await ethers.getSigners();

      const eventEmitter = () =>
        heritageWallet.deposit(secondAddr.address, {
          gasLimit: 3000000,
          value: ethers.parseUnits("1.0", "wei"),
        });

      expect(await eventEmitter())
        .to.emit(heritageWallet, "Deposit")
        .withArgs(from.address, secondAddr.address, 1n);
    });

    it("sendFunds() sends funds to the address given in the amount given", async () => {
      const [, second, third] = await ethers.getSigners();

      await heritageWallet.payOutstandingFees(second.address);

      //@ts-expect-error: might be version conflict of ethers
      await heritageWallet.connect(second).sendFunds(ethers.parseEther("0.00345"), third.address);

      //10000 ether comes from hardhat
      expect(await ethers.provider.getBalance(third.address)).to.eql(ethers.parseEther("10000.00345"));
    });

    it("sendFunds() emits event");
  });

  describe("Utilities", function () {
    // Reduce decimals from 13 to 10
    const jsToSolTime = (jsTime: number) => parseInt((jsTime / 1000).toFixed());

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

      const years = await exposedHeritageWallet.findYearsBetweenTimestamps(
        jsToSolTime(startTime),
        jsToSolTime(startTime) + 1,
      );

      expect(years).to.eql(1n);
    });

    it("_findYearsBetweenTimestamps() calculates 2 for count of subscription fees", async () => {
      const date = new Date(Date.now());
      const startTime = date.setFullYear(2022);
      const endTime = date.setFullYear(2023);

      const years = await exposedHeritageWallet.findYearsBetweenTimestamps(
        jsToSolTime(startTime),
        jsToSolTime(endTime),
      );

      expect(years).to.eql(2n);
    });
  });

  describe("Security", () => {
    // re-deploy the contract to reset subscription data
    before(async () => {
      const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

      heritageWallet = (await heritageWalletFactory.deploy(
        ownerAddress,
        ethUsdFeedAddress,
      )) as unknown as HeritageWallet;

      await heritageWallet.waitForDeployment();

      const exposedHeritageWalletFactory = await ethers.getContractFactory("ExposedHeritageWallet");

      exposedHeritageWallet = (await exposedHeritageWalletFactory.deploy(
        ownerAddress,
        ethUsdFeedAddress,
      )) as unknown as ExposedHeritageWallet;

      await exposedHeritageWallet.waitForDeployment();
    });

    // testing the inherited Ownable contract but just for once
    it("only owner can withdrawCollectedFees()");

    it(
      "registerSubscriber() doesnt overwrite the existing deposit of the account if it has deposited before registering",
    );

    // its important not to distribute more than existing deposits
    it("while addInheritant() can not make any other operation for the given account");

    it("_isFeePaid() throws if account has missing subscription payments", async () => {
      const [, second, third] = await ethers.getSigners();

      await heritageWallet.deposit(second.address, {
        gasLimit: 3000000,
        value: ethers.parseUnits("1.0", "wei"),
      });

      //@ts-expect-error: might be version conflict of ethers
      await expect(heritageWallet.connect(second).sendFunds(1, third.address)).to.be.revertedWith(
        "Sender has outstanding fee to pay.",
      );
    });

    it("modifier _isAllowedToSend() throws if deposited amount is lower than the requested transfer", async () => {
      const [, second, third] = await ethers.getSigners();

      await heritageWallet.deposit(second.address, {
        gasLimit: 3000000,
        value: ethers.parseUnits("1.0", "wei"),
      });

      const secondsDeposit = (await heritageWallet.addressSubscriptionMap(second.address)).deposited;

      await expect(
        //@ts-expect-error: might be version conflict of ethers
        heritageWallet.connect(second).sendFunds(secondsDeposit + BigInt(1), third.address),
      ).to.be.revertedWith("Sender doesnt have enough balance.");
    });

    it("payOutstandingFees() throws if deposited amount is less than fee");
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
