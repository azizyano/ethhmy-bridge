require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const { toUtf8Bytes } = require("@harmony-js/contract");
const { hexlify } = require("@harmony-js/crypto");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: Number(process.env.HMY_CHAIN_ID),
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);
hmy.wallet.addByPrivateKey(process.env.HMY_OWNER_PRIVATE_KEY);
let options = { gasPrice: 1000000000, gasLimit: 6721900 };

async function initBUSDHmy(contractAddr) {
  const busdJson = require("../../out/BUSDImplementation.json");
  let busdContract = hmy.contracts.createContract(
    busdJson.abi,
    contractAddr
  );
  busdContract.wallet.setSigner(process.env.ADMIN);
  await busdContract.methods.unpause().send(options);
}

async function setSupplyControllerBUSDHmy(contractAddr, managerAddr) {
  const busdJson = require("../../out/BUSDImplementation.json");
  let busdContract = hmy.contracts.createContract(
    busdJson.abi,
    contractAddr
  );
  busdContract.wallet.setSigner(process.env.ADMIN);
  await busdContract.methods.setSupplyController(managerAddr).send(options);
}

async function checkHmyBalance(contract, addr) {
  const hmyBUSDJson = require("../../out/BUSDImplementation.json");
  let hmyBUSDContract = hmy.contracts.createContract(
    hmyBUSDJson.abi,
    contract
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await hmyBUSDContract.methods.balanceOf(addr).call(options);
  return res;
}

async function mintBUSDHmy(contractAddr, accountAddr, amount) {
  const busdJson = require("../../out/BUSDImplementation.json");
  let busdContract = hmy.contracts.createContract(
    busdJson.abi,
    contractAddr
  );
  busdContract.wallet.setSigner(process.env.ADMIN);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await busdContract.methods.increaseSupply(accountAddr, amount).send(options);
  await busdContract.methods.transfer(accountAddr, amount).send(options);
}

async function approveHmyManger(contractAddr, managerAddr, amount) {
  const hmyBUSDJson = require("../../out/BUSDImplementation.json");
  let hmyBUSDContract = hmy.contracts.createContract(
    hmyBUSDJson.abi,
    contractAddr
  );
  hmyBUSDContract.wallet.setSigner(process.env.USER);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await hmyBUSDContract.methods.approve(managerAddr, amount).send(options);
}

async function registerToken(managerAddr, tokenManager, eBUSD) {
  const hmyManagerJson = require("../../build/contracts/BUSDHmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.HMY_OWNER);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  await hmyManagerContract.methods
    .register(tokenManager, eBUSD)
    .send(options);
}

async function mintToken(managerAddr, userAddr, amount, receiptId) {
  const hmyManagerJson = require("../../build/contracts/BUSDHmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.ADMIN);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  await hmyManagerContract.methods
    .mintToken(amount, userAddr, receiptId)
    .send(options);
}

async function burnToken(managerAddr, userAddr, amount) {
  const hmyManagerJson = require("../../build/contracts/BUSDHmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.USER);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await hmyManagerContract.methods
    .burnToken(amount, userAddr)
    .send(options);
  return response.transaction.id;
}

module.exports = {
  initBUSDHmy,
  setSupplyControllerBUSDHmy,
  checkHmyBalance,
  mintBUSDHmy,
  approveHmyManger,
  registerToken,
  mintToken,
  burnToken,
};
