const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);
const { bytecode } = require('../compile');
const inter = require('../compile').interface;

let lottery;
let accounts;


beforeEach( async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(inter))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({ 
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({ 
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('does not allow for the same account to enter twice', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('requires a minimum amount of ether to enter', async  () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (error) {
      assert(error)
    }
  });

  it('only allows manager to call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().call({
        send: accounts[1]
      });
      assert(false);
    } catch(error) {
      assert(error)
    }
  });

  it('sends money to the winner and resets players', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    // .8 to allow for gas cost
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert(difference > web3.utils.toWei('.8', 'ether'));
    assert.equal(0, players.length)
  });
});