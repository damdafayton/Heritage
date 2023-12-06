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
    ownerAddress = owner.address;
  });

  async function deployEthUsdFeedMock(): Promise<string | Addressable> {
    console.info(`Deploying eth-Usd price feed mock.`);

    const priceFeedMockFactory = await ethers.getContractFactory("Mock_AggregatorV3Interface");

    const priceFeedMock = (await priceFeedMockFactory.deploy()) as unknown as Mock_AggregatorV3Interface;

    await priceFeedMock.waitForDeployment();

    console.info(`Eth-Usd price feed mock deployed to ${priceFeedMock.target}.`);

    return priceFeedMock.target;
  }

  async function deployContractWithExposed(): Promise<[HeritageWallet, ExposedHeritageWallet]> {
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

    heritageWallet = (await heritageWalletFactory.deploy(ownerAddress, ethUsdFeedAddress)) as unknown as HeritageWallet;

    await heritageWallet.waitForDeployment();

    console.info(`HeritageWallet is deployed at: ${heritageWallet.target}`);

    const exposedHeritageWalletFactory = await ethers.getContractFactory("ExposedHeritageWallet");

    exposedHeritageWallet = (await exposedHeritageWalletFactory.deploy(
      ownerAddress,
      ethUsdFeedAddress,
    )) as unknown as ExposedHeritageWallet;

    await exposedHeritageWallet.waitForDeployment();

    return [heritageWallet, exposedHeritageWallet];
  }

  describe("Subscription", function () {
    beforeEach(async () => {
      const [_heritageWallet, _exposedHeritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
      exposedHeritageWallet = _exposedHeritageWallet;
    });

    it("registerSubscriber() registers a new inheritance record", async () => {
      const [, subscriber] = await ethers.getSigners();
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      // eslint-disable-next-line
      const [timestamp, ...subscriptonDataOfUser] = await heritageWallet.addressSubscriptionMap(subscriber.address);

      expect(subscriptonDataOfUser).to.eql([7n, 1n, 0n, false, 0n, true]);
    });

    it("calculateFeeToPay() calculates a fee to pay in WEI", async () => {
      const [, subscriber] = await ethers.getSigners();
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      const fee = await heritageWallet.calculateFeeToPay(subscriber.address);

      expect(fee).to.eql(354534952299n);
    });

    it("payOutstandingFees() pays default transfer commission if subscriber is not yet registered", async () => {
      const [, subscriber] = await ethers.getSigners();
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      let subscriptionData = await heritageWallet.addressSubscriptionMap(subscriber.address);

      expect(subscriptionData.lastYearPaid).to.eql(false);
      expect(subscriptionData.deposited).to.eql(0n);

      await heritageWallet.deposit(subscriber.address, {
        gasLimit: 3000000,
        value: ethers.parseEther("0.0045"),
      });

      await heritageWallet.payOutstandingFees(subscriber.address);

      subscriptionData = await heritageWallet.addressSubscriptionMap(subscriber.address);

      expect(subscriptionData.lastYearPaid).to.eql(true);
      expect(subscriptionData.deposited).to.eql(4491004500000000n);
    });

    it("addInheritant()", async () => {
      const [, subscriber, inheritant] = await ethers.getSigners();

      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 15);

      const inheritant0 = await heritageWallet.addrInheritantListMap(subscriber.address, 0);

      expect(inheritant0).to.eql(["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 15n]);
    });

    it("addInheritant() overwrites existing inheritant", async () => {
      const [, subscriber, inheritant] = await ethers.getSigners();

      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 60);
      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 90);

      const inheritant0 = await heritageWallet.addrInheritantListMap(subscriber.address, 0);

      expect(inheritant0).to.eql(["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 90n]);
    });

    it("getRemainingInheritancePercentage()", async () => {
      const [, subscriber, inheritant1, inheritant2, inheritant3] = await ethers.getSigners();

      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 15);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 20);

      const [remainingPercent] = await heritageWallet.getRemainingInheritancePercentage(subscriber, inheritant3);

      expect(remainingPercent).to.eql(65n);
    });

    it("getRemainingInheritancePercentage() ignores percent of existing inheritant", async () => {
      const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();

      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 15);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 20);

      const [remainingPercent] = await heritageWallet.getRemainingInheritancePercentage(subscriber, inheritant1);

      expect(remainingPercent).to.eql(80n);
    });

    it("distributeHeritage()", async () => {
      const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);
      await heritageWallet.deposit(subscriber, { value: ethers.parseEther("1.80") });
      await heritageWallet.payOutstandingFees(subscriber);

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 40);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 60);

      await heritageWallet.distributeHeritage(subscriber.address);

      expect(await ethers.provider.getBalance(inheritant1)).to.eql(10000718560720000000000n);
      expect(await ethers.provider.getBalance(inheritant2)).to.eql(10001077841080000000000n);

      const [, , , , , deposited] = await heritageWallet.addressSubscriptionMap(subscriber);

      expect(deposited).to.eql(0n);
    });
  });

  describe("Wallet functionalities", function () {
    before(async () => {
      const [_heritageWallet, _exposedHeritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
      exposedHeritageWallet = _exposedHeritageWallet;
    });

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

      await expect(eventEmitter()).to.emit(heritageWallet, "Deposit").withArgs(from.address, secondAddr.address, 1n);
    });

    it("sendFunds() sends funds to the address given in the amount given", async () => {
      const [, second, third] = await ethers.getSigners();

      await heritageWallet.payOutstandingFees(second.address);

      await heritageWallet.connect(second).sendFunds(ethers.parseEther("0.00345"), third.address);

      //10000 ether comes from hardhat
      expect(await ethers.provider.getBalance(third.address)).to.eql(10000722010720000000000n);
    });

    it("sendFunds() emits event", async () => {
      const [first, second] = await ethers.getSigners();

      const eventEmitter = () => {
        return heritageWallet.connect(second).sendFunds(ethers.parseEther("0.0012"), first.address);
      };

      await expect(eventEmitter())
        .to.emit(heritageWallet, "SendFunds")
        .withArgs(second.address, first.address, ethers.parseEther("0.0012"));
    });
  });

  describe("Utilities", function () {
    before(async () => {
      const [_heritageWallet, _exposedHeritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
      exposedHeritageWallet = _exposedHeritageWallet;
    });

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
    beforeEach(async () => {
      const [_heritageWallet, _exposedHeritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
      exposedHeritageWallet = _exposedHeritageWallet;
    });

    // testing the inherited Ownable contract but just for once
    it("only owner can withdrawCollectedFees()", async () => {
      const [, notOwner, feeCollector] = await ethers.getSigners();

      await expect(heritageWallet.connect(notOwner).withdrawCollectedFees(feeCollector)).to.revertedWithCustomError(
        heritageWallet,
        "OwnableUnauthorizedAccount",
      );
    });

    it("registerSubscriber() doesnt overwrite the existing deposit of the account if it has deposited before registering", async () => {
      const [, subscriber] = await ethers.getSigners();
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.deposit(subscriber, { value: ethers.parseEther("0.5") });

      await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

      const [, , , , , deposited] = await heritageWallet.addressSubscriptionMap(subscriber);

      expect(deposited).to.eql(500000000000000000n);
    });

    it("addInheritant() reverts if sender address is not registered yet.", async () => {
      const [, , inheritant] = await ethers.getSigners();

      await expect(heritageWallet.addInheritant(inheritant.address, 15)).to.revertedWith("Address is not registered.");
    });

    it("_isFeePaid() throws if account has missing subscription payments", async () => {
      const [, second, third] = await ethers.getSigners();

      await heritageWallet.deposit(second.address, {
        gasLimit: 3000000,
        value: ethers.parseUnits("1.0", "wei"),
      });

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
        heritageWallet.connect(second).sendFunds(secondsDeposit + BigInt(1), third.address),
      ).to.be.revertedWith("Sender doesnt have enough balance.");
    });

    it("payOutstandingFees() reverts if the deposited amount is less than fee", async () => {
      const [, second] = await ethers.getSigners();
      const minFeeUsd = 7;
      const feeThousandage = 1;

      await heritageWallet.registerSubscriber(second.address, minFeeUsd, feeThousandage);

      await expect(heritageWallet.payOutstandingFees(second.address)).to.revertedWith(
        "Not enough deposit to pay fees.",
      );

      const subscriptionData = await heritageWallet.addressSubscriptionMap(second.address);

      expect(subscriptionData.canModify).to.eql(true);
      expect(subscriptionData.lastYearPaid).to.eql(false);
    });

    it("distributeHeritage() reverts if fees are not paid", async () => {
      const [, subscriber] = await ethers.getSigners();

      await expect(heritageWallet.distributeHeritage(subscriber)).to.revertedWith("Sender has outstanding fee to pay.");
    });

    // its important not to distribute more than existing deposits
    // can not test now due to local chain limitations?
    // it("while addInheritant() can not make any other operation for the given account", async () => {
    //   const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();
    //   const minFeeUsd = 7;
    //   const feeThousandage = 1;

    //   await heritageWallet.registerSubscriber(subscriber.address, minFeeUsd, feeThousandage);

    //   const fn = () => {
    //     heritageWallet.connect(subscriber).addInheritant(inheritant1, 50);
    //     heritageWallet.connect(subscriber).addInheritant(inheritant2, 50);
    //   };

    //   await expect(fn()).to.revertedWith("");
    // });
  });
});
