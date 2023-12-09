import { Artifact, HardhatRuntimeEnvironment } from "hardhat/types";
import { DeploymentSubmission } from "hardhat-deploy/types";
import { DeploymentsManager } from "hardhat-deploy/dist/src/DeploymentsManager";
import { Contract } from "ethers";

export async function saveDeployment(
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
