import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class Mac extends Component {

  constructor(props) {
    super(props)
    this.state = {mac: null, ip: null}
  }

  componentDidMount() {
    fetch('/mac')
      .then(response => response.json())
      .then(data => this.setState({mac: data.mac, ip: data.ip}))
  }

  render() {
    return (
      <div>
        <div>Your MAC: {this.state.mac}</div>
        <div>Your IP: {this.state.ip}</div>
      </div>
    )
  }

}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <Mac/>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
