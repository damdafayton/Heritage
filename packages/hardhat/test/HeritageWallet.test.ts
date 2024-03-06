// $ yarn test --grep "HeritageWalletContract"

import { expect } from "chai";
import { ethers } from "hardhat";
import { HeritageWallet, ExposedHeritageWallet, Mock_HeritageWalletInterface } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("HeritageWalletContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let ownerAddress: string;
  let heritageProxyAddr: string;
  const usdMinFee = 7;
  const feeThousandage = 3;

  before(async () => {
    const [owner] = await ethers.getSigners();
    ownerAddress = owner.address;

    await deployHeritageProxyMock();
  });

  async function deployHeritageProxyMock() {
    const heritageFactory = await ethers.getContractFactory("Mock_HeritageWalletInterface");

    const heritage = (await heritageFactory.deploy()) as unknown as Mock_HeritageWalletInterface;

    await heritage.waitForDeployment();

    console.info(`Mock_HeritageWalletInterface deployed to ${heritage.target}.`);

    heritageProxyAddr = heritage.target as string;
  }

  async function deployContractWithExposed(): Promise<[HeritageWallet, ExposedHeritageWallet]> {
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");

    const heritageWallet = (await heritageWalletFactory.deploy(
      ownerAddress,
      usdMinFee,
      feeThousandage,
    )) as unknown as HeritageWallet;

    await heritageWallet.waitForDeployment();

    await heritageWallet.setHeritageProxyAddress(heritageProxyAddr);

    console.info(`HeritageWallet is deployed at: ${heritageWallet.target}`);

    const exposedHeritageWalletFactory = await ethers.getContractFactory("ExposedHeritageWallet");

    const exposedHeritageWallet = (await exposedHeritageWalletFactory.deploy(
      ownerAddress,
      usdMinFee,
      feeThousandage,
    )) as unknown as ExposedHeritageWallet;

    await exposedHeritageWallet.waitForDeployment();

    await exposedHeritageWallet.setHeritageProxyAddress(heritageProxyAddr);

    return [heritageWallet, exposedHeritageWallet];
  }

  describe("Subscription", function () {
    let heritageWallet: HeritageWallet;

    beforeEach(async () => {
      const [_heritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
    });

    it("registerSubscriber() throws if msg.value is not enough to cover minimum fee", async () => {
      const [, user] = await ethers.getSigners();

      await expect(heritageWallet.connect(user).registerSubscriber()).rejectedWith(
        "Minimum fee must be deposited to register a new user.",
      );
    });

    it("registerSubscriber() registers a new inheritance record and pays the fee", async () => {
      const [, subscriber] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      const [timestamp, minFee, thousandage, , lastYearPaid, deposited] = await heritageWallet.addressSubscriptionMap(
        subscriber,
      );

      expect(Boolean(timestamp)).to.eql(true);
      expect(BigInt(usdMinFee)).to.eql(minFee);
      expect(BigInt(feeThousandage)).to.eql(thousandage);
      expect(lastYearPaid).to.eql(true);
      expect(deposited).to.eql(996453900709219859n);
    });

    it("calculateFeeToPay() calculates a fee to pay in WEI", async () => {
      const [, subscriber] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      const fee = await heritageWallet.calculateFeeToPay(subscriber.address);

      expect(fee).to.eql(3546099290780141n);
    });

    it("addInheritant()", async () => {
      const [, subscriber, inheritant] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 15);

      const inheritant0 = await heritageWallet.addrInheritantListMap(subscriber.address, 0);

      expect(inheritant0).to.eql(["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 15n]);
    });

    it("addInheritant() overwrites existing inheritant", async () => {
      const [, subscriber, inheritant] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 60);
      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 90);

      const inheritant0 = await heritageWallet.addrInheritantListMap(subscriber.address, 0);

      expect(inheritant0).to.eql(["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 90n]);
    });

    it("addInheritant() percentage value must be above 0 for new record", async () => {
      const [, subscriber, inheritant] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await expect(heritageWallet.connect(subscriber).addInheritant(inheritant.address, 0)).to.rejectedWith(
        "Percentage should be above 0.",
      );
    });

    it("addInheritant() removes inheritant if an existing percentage is set to 0", async () => {
      const [, subscriber, inheritant, inheritant2] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 60);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 30);
      await heritageWallet.connect(subscriber).addInheritant(inheritant.address, 0);

      const inheritant0 = await heritageWallet.addrInheritantListMap(subscriber.address, 0);

      expect(inheritant0).to.eql([inheritant2.address, 30n]);
    });

    it("getRemainingInheritancePercentage()", async () => {
      const [, subscriber, inheritant1, inheritant2, inheritant3] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 15);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 20);

      const [remainingPercent] = await heritageWallet.getRemainingInheritancePercentage(subscriber, inheritant3);

      expect(remainingPercent).to.eql(65n);
    });

    it("getRemainingInheritancePercentage() ignores percent of existing inheritant", async () => {
      const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 15);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 20);

      const [remainingPercent] = await heritageWallet.getRemainingInheritancePercentage(subscriber, inheritant1);

      expect(remainingPercent).to.eql(80n);
    });

    it("distributeHeritage()", async () => {
      const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();

      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("2") });

      const inheritor2InitialBalance = await ethers.provider.getBalance(inheritant2);

      const [, , , , , inheritantDeposited] = await heritageWallet.addressSubscriptionMap(subscriber);

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 90);
      await heritageWallet.connect(subscriber).addInheritant(inheritant2.address, 10);

      await heritageWallet.distributeHeritage(subscriber.address);

      const inheritor2NewBalance = await ethers.provider.getBalance(inheritant2);
      console.log(inheritor2NewBalance, inheritor2InitialBalance, inheritantDeposited);
      expect(inheritor2NewBalance - inheritor2InitialBalance).to.eql(inheritantDeposited / BigInt(10));

      const [, , , , , deposited] = await heritageWallet.addressSubscriptionMap(subscriber);

      expect(deposited).to.eql(0n);

      const [, , , , , , canModify] = await heritageWallet.addressSubscriptionMap(subscriber);

      expect(canModify).to.eql(true);
    });

    it("distributeHeritage() doesnt distribute if fees can not be paid", async () => {
      const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();

      await heritageWallet.updateMinFee(1700);
      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") });

      await heritageWallet.connect(subscriber).addInheritant(inheritant1.address, 90);

      await time.increase(3600 * 24 * 366);

      await expect(heritageWallet.distributeHeritage(subscriber.address)).to.revertedWith(
        "Not enough deposit to pay fees.",
      );
    });

    it("payOutstandingFees() emits PayFee event", async () => {
      const [, user] = await ethers.getSigners();

      const eventEmitter = () => heritageWallet.connect(user).registerSubscriber({ value: ethers.parseEther("1") });

      await expect(eventEmitter()).to.emit(heritageWallet, "PayFee").withArgs(user.address, BigInt(3546099290780141));
    });

    it("forcePaySingleFee() force pays the fee despite fee being more than 1% of the total deposits", async () => {
      const [, user] = await ethers.getSigners();

      await heritageWallet.connect(user).registerSubscriber({ value: ethers.parseEther("0.1") });
      await time.increase(3600 * 24 * 365);

      await heritageWallet.updateUnpaidFees();

      await expect(heritageWallet.payOutstandingFees(user)).to.revertedWith(
        "As a safe-guard, an address can not spend more than 1% of it's balance for a fee payment.",
      );

      expect(await heritageWallet.getCollectedFees()).to.eql(3546099290780141n);

      await heritageWallet.connect(user).forcePaySingleFee();

      expect(await heritageWallet.getCollectedFees()).to.eql(7092198581560282n);
    });
  });

  describe("Wallet functionalities", function () {
    let heritageWallet: HeritageWallet;

    beforeEach(async () => {
      const [_heritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
    });

    it("deposit() deposits and pays the outstanding fees of the a not registered user", async () => {
      const [, secondAddr] = await ethers.getSigners();

      await heritageWallet.deposit(secondAddr.address, {
        gasLimit: 3000000,
        value: ethers.parseEther("0.235"),
      });

      const data = await heritageWallet.addressSubscriptionMap(secondAddr.address);

      expect(data[5]).to.eql(ethers.parseEther("0.231453900709219859"));
    });

    it("deposit() deposits to an existing user's account", async () => {
      const [, newUser] = await ethers.getSigners();

      await heritageWallet.deposit(newUser, {
        value: ethers.parseEther("0.235"),
      });

      await heritageWallet.deposit(newUser, {
        value: ethers.parseEther("0.235"),
      });

      const data = await heritageWallet.addressSubscriptionMap(newUser);
      expect(data[5]).to.eql(ethers.parseEther("0.466453900709219859"));
    });

    it("deposit() automatically registers the user", async () => {
      const [, subscriber] = await ethers.getSigners();

      await heritageWallet.deposit(subscriber, { value: ethers.parseEther("0.5") });

      await expect(
        heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("1") }),
      ).to.revertedWith("Already registered.");
    });

    it("deposit() emits event when there is a new deposit", async () => {
      const [from, secondAddr] = await ethers.getSigners();

      const eventEmitter = () =>
        heritageWallet.deposit(secondAddr.address, {
          gasLimit: 3000000,
          value: ethers.parseEther("0.5"),
        });

      await expect(eventEmitter())
        .to.emit(heritageWallet, "Deposit")
        .withArgs(from.address, secondAddr.address, ethers.parseEther("0.5"));
    });

    it("sendFunds() sends funds to the address given in the amount given", async () => {
      const [, user, receiver] = await ethers.getSigners();

      await heritageWallet.connect(user).registerSubscriber({ value: ethers.parseEther("1") });

      const receiverInitialBalance = await ethers.provider.getBalance(receiver);

      await heritageWallet.connect(user).sendFunds(ethers.parseEther("0.345"), receiver);

      const receiverNewBalance = await ethers.provider.getBalance(receiver);

      expect(receiverNewBalance - receiverInitialBalance).to.eql(345000000000000000n);
    });

    it("sendFunds() emits event", async () => {
      const [sender, receiver] = await ethers.getSigners();

      await heritageWallet.connect(sender).registerSubscriber({ value: ethers.parseEther("1") });

      const eventEmitter = () => {
        return heritageWallet.connect(sender).sendFunds(ethers.parseEther("0.0012"), receiver);
      };

      await expect(eventEmitter())
        .to.emit(heritageWallet, "SendFunds")
        .withArgs(sender.address, receiver.address, ethers.parseEther("0.0012"));
    });
  });

  describe("Utilities", function () {
    let heritageWallet: HeritageWallet;
    let exposedHeritageWallet: ExposedHeritageWallet;

    before(async () => {
      const [_heritageWallet, _exposedHeritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
      exposedHeritageWallet = _exposedHeritageWallet;
    });

    // Reduce decimals from 13 to 10
    const jsToSolTime = (jsTime: number) => parseInt((jsTime / 1000).toFixed());

    it("getEthPrice() should return ETH-USD price and decimals", async function () {
      expect(await heritageWallet.getEthPrice()).to.eql([BigInt(197400000000), BigInt(8)]);
    });

    it("_numDigits() returns given price in WEI", async function () {
      expect(await exposedHeritageWallet.numDigits(2000)).to.eql(4n);
    });

    it("convertUsdToWei converts given USD value into WEI", async () => {
      const weiVal = await heritageWallet.convertUsdToWei(1974);

      expect(weiVal).to.eql(ethers.parseEther("1"));
    });

    it("_findYearsBetweenTimestamps() calculates 1 for count of subscription fees", async () => {
      const startTime = Date.now();

      const years = await exposedHeritageWallet.findYearsBetweenTimestamps(
        jsToSolTime(startTime),
        jsToSolTime(startTime) + 1,
      );

      expect(years).to.eql(0n);
    });

    it("_findYearsBetweenTimestamps() calculates 2 for count of subscription fees", async () => {
      const date = new Date(Date.now());
      const startTime = date.setFullYear(2022);
      const endTime = date.setFullYear(2023);

      const years = await exposedHeritageWallet.findYearsBetweenTimestamps(
        jsToSolTime(startTime),
        jsToSolTime(endTime) + 1,
      );

      expect(years).to.eql(1n);
    });

    it("_registerUser() registers new user and adds it to subscriber list", async () => {
      const [, user] = await ethers.getSigners();

      await exposedHeritageWallet.connect(user).__registerUser(user);

      const subscriberList = await exposedHeritageWallet.getSubscriberList();

      expect(subscriberList).to.eql(["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"]);
    });
  });

  describe("Security", () => {
    let heritageWallet: HeritageWallet;

    // re-deploy the contract to reset subscription data
    beforeEach(async () => {
      const [_heritageWallet] = await deployContractWithExposed();
      heritageWallet = _heritageWallet;
    });

    // testing the inherited Ownable contract but just for once
    it("only owner can withdrawCollectedFees()", async () => {
      const [, notOwner, feeCollector] = await ethers.getSigners();

      await expect(heritageWallet.connect(notOwner).withdrawCollectedFees(feeCollector)).to.revertedWithCustomError(
        heritageWallet,
        "OwnableUnauthorizedAccount",
      );
    });

    it("addInheritant() reverts if sender address is not registered yet.", async () => {
      const [, , inheritant] = await ethers.getSigners();

      await expect(heritageWallet.addInheritant(inheritant.address, 15)).to.revertedWith("Address is not registered.");
    });

    it("modifier _isAllowedToSend() throws if deposited amount is lower than the requested transfer", async () => {
      const [, second, third] = await ethers.getSigners();

      const minFee = await heritageWallet.minFeePerYearInUsd();
      const minFeeInWei = await heritageWallet.convertUsdToWei(minFee);

      await heritageWallet.deposit(second.address, {
        gasLimit: 3000000,
        value: minFeeInWei,
      });

      const secondsDeposit = (await heritageWallet.addressSubscriptionMap(second.address)).deposited;

      await expect(
        heritageWallet.connect(second).sendFunds(secondsDeposit + BigInt(1), third.address),
      ).to.be.revertedWith("Sender doesnt have enough balance.");
    });

    it("payOutstandingFees() reverts if the deposited amount is less than fee", async () => {
      const [, second, random] = await ethers.getSigners();

      await heritageWallet.connect(second).registerSubscriber({ value: ethers.parseEther("1") });

      await time.increase(3600 * 24 * 365);

      await heritageWallet.connect(second).sendFunds(996453900709200000n, random);

      await expect(heritageWallet.payOutstandingFees(second.address)).to.revertedWith(
        "Not enough deposit to pay fees.",
      );

      const subscriptionData = await heritageWallet.addressSubscriptionMap(second.address);

      expect(subscriptionData.canModify).to.eql(true);
    });

    it("distributeHeritage() tries to pay the fees if fees are not paid", async () => {
      const [, subscriber] = await ethers.getSigners();
      await heritageWallet.connect(subscriber).registerSubscriber({ value: ethers.parseEther("0.1") });

      await time.increase(3600 * 24 * 365);

      await heritageWallet.updateUnpaidFees();

      await expect(heritageWallet.distributeHeritage(subscriber)).to.revertedWith(
        "As a safe-guard, an address can not spend more than 1% of it's balance for a fee payment.",
      );
    });

    it("payOutstandingFees() reverts if a fee of more than 1% of the total deposits is being tried to be paid", async () => {
      const [, user] = await ethers.getSigners();

      await heritageWallet.connect(user).registerSubscriber({ value: ethers.parseEther("0.1") });
      await time.increase(3600 * 24 * 365);

      await heritageWallet.updateUnpaidFees();

      await expect(heritageWallet.payOutstandingFees(user)).to.revertedWith(
        "As a safe-guard, an address can not spend more than 1% of it's balance for a fee payment.",
      );
    });

    it("sendFunds() throws if deposit amount is lower than the requested transfer", async () => {
      const [, second, third] = await ethers.getSigners();

      const minFee = await heritageWallet.minFeePerYearInUsd();
      const minFeeInWei = await heritageWallet.convertUsdToWei(minFee);

      await heritageWallet.deposit(second.address, {
        gasLimit: 3000000,
        value: minFeeInWei + BigInt(2),
      });

      await time.increase(3600 * 24 * 365);

      await heritageWallet.updateUnpaidFees();

      const secondsDeposit = (await heritageWallet.addressSubscriptionMap(second.address)).deposited;

      await expect(
        heritageWallet.connect(second).sendFunds(secondsDeposit + BigInt(1), third.address),
      ).to.be.revertedWith("Sender doesnt have enough balance.");
    });

    // its important not to distribute more than existing deposits
    // can not test now due to local chain limitations?
    // it("while addInheritant() can not make any other operation for the given account", async () => {
    //   const [, subscriber, inheritant1, inheritant2] = await ethers.getSigners();
    //   await expect(fn()).to.revertedWith("");
    // });
  });
});
