import React from 'react';
import logo from './logo.svg';
import './App.css';

import {BridgeNetworkCard} from "./pages/bridge";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BridgeNetworkCard />
      </header>
    </div>
  );
}

export default App;
