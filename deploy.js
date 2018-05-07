const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const { bytecode } = require('./compile');
const inter = require('./compile').interface;
const { mnemonic, url } = require('./secrets');


const provider = new HDWalletProvider(mnemonic, url);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  const result = await new web3.eth.Contract(JSON.parse(inter))
    .deploy({ data: bytecode }) // deploy contract
    .send({ from: accounts[0], gas: '1000000' });
  // Check where contracted ended
  console.log('interface', inter)
  console.log('Contract deployed to', result.options.address);
};

deploy();
