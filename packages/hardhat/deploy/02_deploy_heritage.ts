import { Artifact, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction, DeploymentSubmission } from "hardhat-deploy/types";
import { DeploymentsManager } from "hardhat-deploy/dist/src/DeploymentsManager";
import { Contract } from "ethers";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

import { localConfig } from "../local-config";
const { RainbowAccountAddress } = localConfig;

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { getNamedAccounts, ethers, upgrades } = hre;

  const { deployer } = await getNamedAccounts();
  const owner = RainbowAccountAddress;
  const contractName = "Heritage";

  const Heritage = await ethers.getContractFactory(contractName);

  const minFeeUsd = 5;
  const feeThousandage = 1;

  const proxy = await upgrades.deployProxy(Heritage, [owner, minFeeUsd, feeThousandage], {
    initializer: "initialize",
    kind: "uups",
  });

  await proxy.waitForDeployment();

  const currentImplAddress = await getImplementationAddress(hre.network.provider, proxy.target as string);

  console.info({ currentImplAddress });

  console.info("Heritage proxy deployed to:", proxy.target, "by:", deployer);

  await saveDeployment(hre, contractName, proxy, currentImplAddress);
};

async function saveDeployment(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  proxy: Contract,
  implementationAddress: string,
) {
  // const oldDeployment = await hre.deployments.getOrNull(contractName);

  const deploymentsManager = new DeploymentsManager(hre, hre.network);

  const proxyArtifact: Artifact = await hre.deployments.getArtifact(contractName);

  const proxiedDeployment: DeploymentSubmission = {
    ...proxyArtifact,
    address: proxy.target as string,
    implementation: implementationAddress,
    receipt: proxy.deploymentTransaction() as unknown as undefined,
    // execute: updateMethod
    //   ? {
    //       methodName: updateMethod,
    //       args: updateArgs,
    //     }
    //   : undefined,
  };

  await deploymentsManager.saveDeployment(contractName, proxiedDeployment);
}

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["Heritage"];
