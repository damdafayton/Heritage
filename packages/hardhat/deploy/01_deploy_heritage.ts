// import fs from "fs";
// import path from "path";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  ABI,
  // ArtifactData,
  DeployFunction,
  // DeployOptions,
  // Deployment,
  DeploymentSubmission,
  // DeploymentsExtension,
  // ExtendedArtifact,
} from "hardhat-deploy/types";
import { DeploymentsManager } from "hardhat-deploy/dist/src/DeploymentsManager";
import { mergeABIs } from "hardhat-deploy/dist/src/utils";
import { Contract } from "ethers";
import eip173Proxy from "hardhat-deploy/extendedArtifacts/EIP173Proxy.json";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

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

  // const { deploy } = hre.deployments;

  // await deploy("Heritage", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  //   proxy: { owner: deployer, methodName: "initialize", proxyArgs: [deployer] },
  // });

  const contractName = "Heritage";

  const Heritage = await ethers.getContractFactory(contractName);

  const proxy = await upgrades.deployProxy(Heritage, [deployer], {
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

  // const proxyArtifactPath = path.join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);

  // let proxyContract: ExtendedArtifact = JSON.parse(fs.readFileSync(proxyArtifactPath, "utf-8"));

  const proxyArtifact = await hre.deployments.getArtifact(contractName);
  const mergedABI: ABI = mergeABIs([proxyArtifact.abi, eip173Proxy.abi], {
    check: true, // TODO options for custom proxy ?
    skipSupportsInterface: true, // TODO options for custom proxy ?
  }).filter(v => v.type !== "constructor");

  const proxiedDeployment: DeploymentSubmission = {
    ...eip173Proxy,
    address: proxy.target as string,
    implementation: implementationAddress,
    receipt: proxy.deploymentTransaction() as unknown as undefined,
    abi: mergedABI,
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
