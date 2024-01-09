import { Artifact, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployResult, DeploymentSubmission } from "hardhat-deploy/types";
import { DeploymentsManager } from "hardhat-deploy/dist/src/DeploymentsManager";
import { Contract } from "ethers";

export async function saveDeployment(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  contract: Contract | DeployResult,
  implementationAddress?: string,
) {
  // const oldDeployment = await hre.deployments.getOrNull(contractName);

  const deploymentsManager = new DeploymentsManager(hre, hre.network);

  const artifact: Artifact = await hre.deployments.getArtifact(contractName);

  // Its a proxy contract
  if (implementationAddress) {
    const proxyContract = contract as Contract;

    const proxiedDeployment: DeploymentSubmission = {
      ...artifact,
      address: proxyContract.target as string,
      implementation: implementationAddress,
      receipt: proxyContract.deploymentTransaction() as unknown as undefined,
      // execute: updateMethod
      //   ? {
      //       methodName: updateMethod,
      //       args: updateArgs,
      //     }
      //   : undefined,
    };

    await deploymentsManager.saveDeployment(contractName, proxiedDeployment);
  } else {
    const deployedContract = contract as DeployResult;

    const deployment: DeploymentSubmission = {
      ...artifact,
      address: deployedContract.address,
      receipt: deployedContract.receipt,
    };

    await deploymentsManager.saveDeployment(contractName, deployment);
  }
}
