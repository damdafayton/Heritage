import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

import { localConfig } from "../local-config";
import { saveDeployment } from "../helpers/saveDeployment";
import { Heritage } from "../typechain-types";
import { Contract } from "ethers";
const { RainbowAccountAddress } = localConfig;

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployHeritageContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { getNamedAccounts, deployments, upgrades, ethers } = hre;
  const { deployer } = await getNamedAccounts();
  const [owner] = await ethers.getSigners();

  console.info("Owner:", owner.address);
  console.info("Deployer:", deployer);

  const manager = RainbowAccountAddress;

  const heritageFactory = await ethers.getContractFactory("Heritage");
  const deployment = await deployments.getOrNull("Heritage");

  // Check if HeritageWallet was updated
  let heritageProxyContract =
    deployment &&
    (new ethers.Contract(deployment?.address as string, heritageFactory?.interface, owner) as unknown as Heritage);

  const heritageWalletAddrOnDeployedContract = await heritageProxyContract?.heritageWalletAddr();

  const heritageWallet = await deployments.getOrNull("HeritageWallet");

  const isHeritageWalletReDeployed = deployment
    ? heritageWallet?.address !== heritageWalletAddrOnDeployedContract
    : false;

  if (isHeritageWalletReDeployed)
    throw new Error(
      `Latest deployed HeritageWallet address of ${heritageWallet?.address} is different than the address of ${heritageWalletAddrOnDeployedContract} on the deployed Proxy.\
 This address can not be updated in real world. Re-start the network and deploy everything from scratch.`,
    );

  let currentImplementationAddress;

  const isDeploymentSame = heritageFactory.bytecode === deployment?.bytecode;

  if (!deployment) {
    heritageProxyContract = (await upgrades.deployProxy(heritageFactory, [heritageWallet?.address], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as Heritage;

    await heritageProxyContract.waitForDeployment();

    console.info("Heritage proxy deployed to:", heritageProxyContract.target, "by: Deployer");

    await heritageProxyContract.updateManager(manager);

    // Set owner on wallet contract
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");
    const heritageWalletContract = new ethers.Contract(
      heritageWallet?.address as string,
      heritageWalletFactory.interface,
      owner,
    );

    await heritageWalletContract.transferOwnership(heritageProxyContract.target);

    currentImplementationAddress = await getImplementationAddress(
      hre.network.provider,
      heritageProxyContract.target as string,
    );

    await saveDeployment(hre, "Heritage", heritageProxyContract as unknown as Contract, currentImplementationAddress);
  } else if (!isDeploymentSame) {
    const upgradedHeritageProxyContract = (await upgrades.upgradeProxy(
      deployment.address,
      heritageFactory,
      {},
    )) as unknown as Heritage;

    heritageProxyContract = await upgradedHeritageProxyContract.waitForDeployment();

    console.info("Heritage proxy upgraded", "by: Deployer");

    currentImplementationAddress = await getImplementationAddress(
      hre.network.provider,
      heritageProxyContract.target as string,
    );

    await saveDeployment(hre, "Heritage", heritageProxyContract as unknown as Contract, currentImplementationAddress);
  } else {
    console.info(`Re-using "Heritage" proxy at ${deployment.address}`);

    currentImplementationAddress = await getImplementationAddress(hre.network.provider, deployment.address);
  }

  if (!heritageProxyContract) return;

  console.info({ currentImplementationAddress });
};

export default deployHeritageContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployHeritageContract.tags = ["HeritageProxy"];
