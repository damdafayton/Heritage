// import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Heritage } from "../typechain-types";

describe("Heritage", function () {
  // We define a fixture to reuse the same setup in every test.

  let heritageContract: Heritage;
  let owner;

  before(async () => {
    // const [owner] = await ethers.getSigners();
    // const heritageFactory = await ethers.getContractFactory("Heritage");
    // const proxy = await upgrades.deployProxy(heritageFactory, [owner.address], {
    //   initializer: "initialize",
    //   kind: "uups",
    // });
    // await proxy.waitForDeployment();
  });

  describe("Deployment", function () {
    it("deploys", async () => {
      const [from] = await ethers.getSigners();
      owner = from;
      const heritageFactory = await ethers.getContractFactory("Heritage");

      heritageContract = (await upgrades.deployProxy(heritageFactory, [owner.address], {
        initializer: "initialize",
        kind: "uups",
      })) as unknown as Heritage;

      await heritageContract.waitForDeployment();

      console.log(`Test contract deployed to: ${heritageContract.target} by: ${owner.address}`);
    });

    it("Should have the right owner on deploy", async function () {
      // expect(await heritageContract.owner()).to.equal(owner.address);
    });

    // it("Should allow setting a new message", async function () {
    //   const newGreeting = "Learn Scaffold-ETH 2! :)";

    //   await heritageContract.setGreeting(newGreeting);
    //   expect(await heritageContract.greeting()).to.equal(newGreeting);
    // });
  });
});
