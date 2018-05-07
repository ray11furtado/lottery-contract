import React, { Component } from 'react';
import web3 from '../web3';

export default class App extends Component {
  render() {
    web3.eth.getAccounts().then((res) => {
      console.log(res);
    });
    return <div>Hello Ethereum</div>;
  }

}
