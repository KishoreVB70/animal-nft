// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const AnimalNFT = await hre.ethers.getContractFactory("AnimalNFT");
  const animalNFT = await AnimalNFT.deploy();

  await animalNFT.deployed();

  console.log("animalNFT deployed to:", animalNFT.address);
  storeContractData(animalNFT)
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/animalNFT-address.json",
    JSON.stringify({ animalNFT: contract.address }, undefined, 2)
  );

  const animalNFTArtifact = artifacts.readArtifactSync("AnimalNFT");

  fs.writeFileSync(
    contractsDir + "/AnimalNFT.json",
    JSON.stringify(animalNFTArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
