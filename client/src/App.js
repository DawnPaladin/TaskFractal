import React, { Component } from 'react';
import Client from "./Client";
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chunks: [],
      testChunk: null,
      testChunkName: "",
    };
    Client.index(chunks => this.setState({ chunks: chunks }))
    Client.testChunk(testChunk => this.setState({ testChunk: testChunk, testChunkName: testChunk.name }));
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <div>Test chunk name: <strong>{this.state.testChunkName}</strong></div>
      </div>
    );
  }
}

export default App;
