
import React, { useEffect } from 'react';
import { BigNumber } from 'bignumber.js';
import { Button, Radio } from 'antd';
import PageEthers from './pages/pageEthers';
import PageMetaMask from './pages/pageMetaMask';
import PageThinkiumWeb3 from './pages/pageThinkiumWeb3';
import './App.css';


function App() {
  useEffect(() => {
  })

  return (
    <div className="App">
      <div className="area">
        <PageMetaMask/>
        <PageEthers/>
        <PageThinkiumWeb3/>
      </div>
    </div>
  );
}

export default App;
