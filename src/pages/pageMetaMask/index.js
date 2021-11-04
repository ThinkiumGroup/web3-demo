
import React, { useEffect } from 'react';
import { Form, Button, Radio, Input, Select , Space, Modal  } from 'antd';
import { BigNumber } from 'bignumber.js';

import * as demoMETAMASK from '../../utils/demoMETAMASK';
const contractCode = `
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Storage {

    uint256 number;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }
}
`
const abi = [
    {
        "inputs": [],
        "name": "retrieve",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "num",
                "type": "uint256"
            }
        ],
        "name": "store",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const bytecode = '608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea2646970667358221220404e37f487a89a932dca5e77faaf6ca2de3b991f93d230604b1b8daaef64766264736f6c63430008070033'

function PageMetaMask() {


    const [address, setAddress] = React.useState('');
    const [balance, setBalance] = React.useState('');
    const [nonce, setNonce] = React.useState('');
    const [blockNumber, setBlockNumber] = React.useState('');
    const [transferHash, setTransferHash] = React.useState('');
    const [block, setBlock] = React.useState('');
    const [transferToAddress, setTransTransferToAddress] = React.useState('');
    const [transferValue, setTransTransferValue] = React.useState('');
    const [contractAddress, setTransContractAddress] = React.useState('');
    const [storeValue, setTransStoreValue] = React.useState('');
    const [retrieveValue, setTransRetrieveValue] = React.useState('');
    const [stringToBeSigned, setStringToBeSigned] = React.useState('');


    useEffect(() => {
        initMetaMask()
    })





    async function initMetaMask(type) {
        let result = await demoMETAMASK.init();
        if (result && result.address) {
            setAddress(result.address)
            type == 2 && alert(`Successfully connected to metaMask, the current wallet address is:${result.address}`)
        } else {
            type == 2 && alert(`Connection failed, please open MetaMask to agree`)
        }
    }

    function checkEnvironment() {
        if (demoMETAMASK.checkEnvironment()) {
            alert('MetaMask is installed')
        } else {
            alert('MetaMask is not installed')
        }
    }

    async function getAddress() {
        const address = await demoMETAMASK.getAddress();
        alert(`The current wallet address is:${address}`);
    }

    async function getBalance() {
        let address = window.defaultAccount;
        const balance = await demoMETAMASK.getBalance(address);
        setBalance(balance.toString())
    }

    async function getNonce() {
        const nonce = await demoMETAMASK.getNonce(address);
        setNonce(nonce);
    }

    async function getBlockNumber() {
        const blockNumber = await demoMETAMASK.getBlockNumber();
        setBlockNumber(blockNumber);
    }

    async function checkTransaction() {
        const hash = transferHash
        const result = await demoMETAMASK.checkTransaction(hash);
        console.log(`hash:${hash}\n`, result)
        alert(`hash:${hash}\n result: ${JSON.stringify(result)}`);
    }

    async function getBlock() {
        const result = await demoMETAMASK.getBlock(block);
        alert(`block:${block}\n result: ${JSON.stringify(result)}`);
    }


    async function sendTransaction() {
        if (!transferValue || transferValue == '0') {
            return;
        }
        const params = {
            to: transferToAddress,
            value: new BigNumber(transferValue).multipliedBy("1e+18").toString()
        }
        const result = await demoMETAMASK.sendTransaction(params);
        alert(`Same chain transfer transaction results: ${JSON.stringify(result)}`);
    }

    async function deployContract() {
        try {
            const result = await demoMETAMASK.deployContract({ bytecode, abi });
            setTransContractAddress(result);
            alert(`The contract is deployed successfully, the contract address: ${result}`);
        } catch (err) {
            alert(`Contract deployment failed, failure message: ${err}`);
        }
    }

    async function callContractGet() {
        let params = {
            abi,
            contractAddress
        }
        const myContract = demoMETAMASK.getMyContract(params);
        myContract.methods.retrieve().call({ from: window.defaultAccount, value: '0x0' }).then((res) => {
            setTransRetrieveValue(res.toString());
        }).catch((err) => {
            alert(`Error when calling contract method:${err}`)
        })
    }

    async function callContractSet() {
        let params = {
            abi,
            contractAddress
        }
        const myContract = demoMETAMASK.getMyContract(params);
        myContract.methods.store(storeValue).send({ from: window.defaultAccount, gasLimit: 1000000, })
            .on('transactionHash', function (transactionHash) {
                console.log('transactionHash', transactionHash)
                alert('Call the contract method hash:' + JSON.stringify(transactionHash))
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log('confirmation', { confirmationNumber: confirmationNumber, receipt: receipt })
            })
            .on('receipt', function (receipt) {
                console.log('receipt', { receipt: receipt })
                alert('receipt: ' + JSON.stringify(receipt))
            })
            .on('error', function (error, receipt) {
                alert('error:' + JSON.stringify(error))
                console.log('error', { error: error, receipt: receipt })
            })
    }

    async function signMessage() {
        const result = await demoMETAMASK.signMessage(stringToBeSigned);
        alert('signMessage signature result is：' + result);
    }

    async function signPersonalMessage() {
        const result = await demoMETAMASK.signPersonalMessage(stringToBeSigned);
        alert('signPersonalMessage signature result is：' + result);
    }

    function checkContractCode() {
        Modal.info({
            title: 'Contract Code',
            icon: '',
            width: '600px',
            content: (
                <pre>
                   {contractCode}
                </pre>
            ),
            onOk() {
              console.log('OK');
            },
          })
    }


    return (
        <div className="container">
            <div className="_block">
                <div style={{ margin: 30 }}>METAMASK</div>

                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                >
                    <Form.Item label="Browser environment" name="_privateKey">
                        <Button onClick={checkEnvironment} style={{width: '300px'}}>Check the browser environment</Button>
                    </Form.Item>
                    <Form.Item label="Connect" name="_privateKey">
                        <Button onClick={() => { initMetaMask(2) }}>Connect to MetaMask</Button>
                    </Form.Item>
                    <Form.Item label="Address" name="_address">
                        <span>{address}</span>
                    </Form.Item>
                    <Form.Item label="Balance" name="_balance">
                        <Button onClick={getBalance} style={{ marginRight: 20 }} >Get Balance</Button>
                        <span >{balance && new BigNumber(balance || '0').div("1e+18").toString()}</span>
                    </Form.Item>
                    <Form.Item label="Nonce" name="_nonce">
                        <Button onClick={getNonce} style={{ marginRight: 20 }} >Get nonce</Button>
                        <span >{nonce}</span>
                    </Form.Item>
                    <Form.Item label="Block" name="_blockNumber">
                        <Button onClick={getBlockNumber} style={{ marginRight: 20 }} >View block</Button>
                        <span >{blockNumber}</span>
                    </Form.Item>
                    <Form.Item label="Trade" name="_transfer">
                        <Input placeholder="Enter transaction hash" style={{ width: 600 }} onChange={(e) => { setTransferHash(e.target.value.trim()) }} />
                        <Button onClick={checkTransaction} style={{ marginRight: 20 }} >View transaction</Button>
                    </Form.Item>
                    <Form.Item label="Block" name="_nonce">
                        <Input placeholder="Enter block" style={{ width: 200, marginRight: 20 }} onChange={(e) => { setBlock(e.target.value.trim()); }} />
                        <Button onClick={getBlock} >Check block</Button>
                    </Form.Item>
                    <Form.Item label="Transfer on the same chain" name="_nonce">
                        <Input placeholder="Transfer address" style={{ width: 600, marginBottom: 20 }} onChange={(e) => { setTransTransferToAddress(e.target.value.trim()) }} />
                        <Input placeholder="Transfer amount" style={{ width: 200, marginRight: 20 }} onChange={(e) => { setTransTransferValue(e.target.value.trim()) }} />
                        <Button onClick={sendTransaction} >Transfer</Button>
                    </Form.Item>
                    <Form.Item label="Hello World contract" name="_nonce">
                        <Button onClick={deployContract} style={{  marginRight: 20 }}>Deployment contract</Button>
                        <Space wrap>
                            <Button onClick={checkContractCode}>Contract code</Button>
                        </Space>
                        <Input placeholder="Contract address" style={{ width: 600, marginBottom: 20 }} onChange={(e) => { setTransContractAddress(e.target.value.trim()) }} value={contractAddress}/>
                        <Input placeholder="Amount" style={{ width: 200, marginRight: 20 }} onChange={(e) => { setTransStoreValue(e.target.value.trim() - 0) }} />
                        <Button onClick={callContractSet}>Call contract set</Button>
                        <Button onClick={callContractGet} style={{ marginRight: 20 }}>Call contract get</Button>
                        <span>{retrieveValue}</span>
                    </Form.Item>
                    <Form.Item label="Sign" name="_nonce">
                        <Input placeholder="Sign string" style={{ width: 600, marginRight: 20 }} onChange={(e) => { setStringToBeSigned(e.target.value.trim()) }} />
                        <Button onClick={signMessage} >SignMessage</Button>
                        <Button onClick={signPersonalMessage} >SignPersonalMessage</Button>
                    </Form.Item>

                </Form>
            </div>
        </div>
    );
}

export default PageMetaMask;
