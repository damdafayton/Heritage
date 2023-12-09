import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

import { localConfig } from "../local-config";
import { saveDeployment } from "../helpers/saveDeployment";
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

  const deployEthUsdFeedMock = async (): Promise<DeployResult> => {
    return await deployments.deploy("Mock_AggregatorV3Interface", {
      from: deployer,
      // Contract constructor arguments
      args: [],
      log: true,
      // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
      // automatically mining the contract deployment transaction. There is no effect on live networks.
      autoMine: true,
    });
  };
  const ethUsdFeedAddress = (await deployEthUsdFeedMock()).address;

  const heritageWallet = await deployments.deploy("HeritageWallet", {
    from: deployer,
    args: [deployer, ethUsdFeedAddress],
    log: true,
    autoMine: true,
  });

  const heritageFactory = await ethers.getContractFactory("Heritage");
  const usdMinFee = 5;
  const feeThousandage = 1;

  const deployment = await deployments.getOrNull("Heritage");
  const isDeploymentSame = heritageFactory.bytecode === deployment?.bytecode;

  let heritageProxyContract;

  if (!deployment) {
    heritageProxyContract = await upgrades.deployProxy(
      heritageFactory,
      [heritageWallet.address, usdMinFee, feeThousandage],
      {
        initializer: "initialize",
        kind: "uups",
      },
    );

    await heritageProxyContract.waitForDeployment();

    console.info("Heritage proxy deployed to:", heritageProxyContract.target, "by: Deployer");

    await heritageProxyContract.updateManager(manager);

    // Set owner on wallet contract
    const heritageWalletFactory = await ethers.getContractFactory("HeritageWallet");
    const heritageWalletContract = new ethers.Contract(
      heritageWallet.address as string,
      heritageWalletFactory.interface,
      owner,
    );

    await heritageWalletContract.transferOwnership(heritageProxyContract.target);
  } else if (!isDeploymentSame) {
    const upgradedHeritageProxyContract = await upgrades.upgradeProxy(deployment.address, heritageFactory, {});

    heritageProxyContract = await upgradedHeritageProxyContract.waitForDeployment();

    console.info("Heritage proxy upgraded", "by: Deployer");
  } else {
    console.info(`Re-using "Heritage" proxy at ${deployment.address}`);

    const currentImplAddress = await getImplementationAddress(hre.network.provider, deployment.address);

    console.info({ currentImplAddress });
  }

  if (!heritageProxyContract) return;

  const currentImplAddress = await getImplementationAddress(
    hre.network.provider,
    heritageProxyContract.target as string,
  );

  console.info({ currentImplAddress });

  await saveDeployment(hre, "Heritage", heritageProxyContract, currentImplAddress);
};

export default deployHeritageContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployHeritageContract.tags = ["HeritageProxy"];
