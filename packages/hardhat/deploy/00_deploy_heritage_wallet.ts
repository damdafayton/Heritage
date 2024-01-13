import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployHeritageWalletContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deployer } = await getNamedAccounts();
  const [owner] = await ethers.getSigners();

  console.info("Owner:", owner.address);
  console.info("Deployer:", deployer);

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
  const usdMinFee = 5;
  const feeThousandage = 1;

  await deployments.deploy("HeritageWallet", {
    from: deployer,
    args: [deployer, ethUsdFeedAddress, usdMinFee, feeThousandage],
    log: true,
    autoMine: true,
  });
};

export default deployHeritageWalletContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployHeritageWalletContract.tags = ["HeritageWallet"];
