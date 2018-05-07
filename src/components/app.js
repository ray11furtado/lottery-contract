import React, { Component } from 'react';
import web3 from '../web3';
import lottery from '../lottery';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { manager: ''}
  }
  
  async componentDidMount() {
      const manager = await lottery.methods.manager().call()

      this.setState({ manager });
  }

  render() {
    return <div>Hello Ethereum, Manager account: {this.state.manager}</div>;
  }

}
