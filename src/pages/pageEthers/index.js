
import React, { useEffect, useState } from 'react';
import { BigNumber } from 'bignumber.js';
import { Form, Button, Radio, Input, Select, Space, Modal } from 'antd';
import { getChainIdEnum, getRpcUrl, chainBasicInfoPro, chainBasicInfoDev } from '../../utils/enums';
import * as demoEthers from '../../utils/demoEthers';

const { Option } = Select

function getRpcList() {
    let list1 = Object.keys(chainBasicInfoDev)
        .filter(key => key !== 'main' && key !== 'thk')
        .map(key => {
            const { chainId, rpc } = chainBasicInfoDev[key]
            return { key: `${key}Dev`, chainId, rpc }
        })
    let list2 = Object.keys(chainBasicInfoPro)
        .filter(key => key !== 'main' && key !== 'thk')
        .map(key => {
            const { chainId, rpc } = chainBasicInfoPro[key]
            return { key: `${key}Pro`, chainId, rpc }
        })
    return list1.concat(list2)
}


const rpcList = getRpcList();
const deFaultRpcKey = rpcList[0] && rpcList[0].key;
const rpcData = rpcList.find(item => item.key === deFaultRpcKey);
if (rpcData.rpc) {
    demoEthers.setRpc(rpcData.rpc);
}

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
const defaultPrivateKey = '0xadb8bbdb1ea56ced2acfd98c76af1fb1ab65d32b5864b6373f0ccfc653193448'  //zla-2


function PageEthers() {


    const [privateKey, setPrivateKey] = React.useState(defaultPrivateKey);
    const [address, setAddress] = React.useState(demoEthers.getAddress(defaultPrivateKey));
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

    const connectMetaMask = () => {
        demoEthers.connectMetaMask()
        
    }


    const onRpcChange = (value) => {
        const rpcData = rpcList.find(item => item.key === value);
        if (rpcData.rpc) {
            demoEthers.setRpc(rpcData.rpc);
        }
    }

    const onPrivateKeyChange = (e) => {
        const data = e.target.value.trim();
        try {
            setPrivateKey(data);
            const address = demoEthers.getAddress(data);
            setAddress(address);
        } catch (err) {
            setPrivateKey(defaultPrivateKey);
            alert(err);
        }

    }


    function getAddress2() {
        const address = demoEthers.getAddress(privateKey);
        alert(`The current wallet address is: ${address}`);
    }

    async function getBalance2() {
        const balance = await demoEthers.getBalance(address);
        setBalance(balance.toString());
    }

    async function getNonce2() {
        const nonce = await demoEthers.getNonce(address);
        setNonce(nonce.toString())
    }

    async function getBlockNumber2() {
        const result = await demoEthers.getBlockNumber();
        setBlockNumber(result)
    }

    async function checkTransaction2() {
        // let hash = '0xc7dd7dab85c02e2e8b85ad74c858bfeaee19e34c0b275622db8f344b2e79e250'; //100008 chain development
        // let hash = '0x1e65104838d68d9544d08e5bec9406188698210b144beed7a33de0550453a7a4'; //100008 chain production
        // let hash = '0x5b3934d2961859d071947e114133d01d7b337f0c3b8b311a38875a3dc5f83de3'; // rankby
        const result = await demoEthers.checkTransaction(transferHash);
        alert(`hash:${transferHash}\n result: ${JSON.stringify(result)}`);
    }




    async function getBlock2() {
        const result = await demoEthers.getBlock(block);
        alert(`block:${block}\n result: ${JSON.stringify(result)}`);
    }

    async function sendTransaction2() {
        const params = {
            privateKey,
            to: transferToAddress,
            value: transferValue + ''  //without 18 '0'
        }
        const result = await demoEthers.sendTransaction(params);
        alert(`Transfer address: ${transferToAddress} \n amount: ${transferValue} \n Transaction result: ${JSON.stringify(result)}`);
    }


    async function callContractSet2() {
        let params = {
            privateKey,
            abi,
            contractAddress
        }
        const myContract = demoEthers.getMyContract(params);
        const result = await myContract.store(storeValue);  //Does not support wait() temporarily
        console.log('---result', result)
        alert(`store result:${JSON.stringify(result)}`)
    }

    async function callContractGet2() {
        //0xc381e6c1b05c9f5e1b1f1aca1bf488ff85dea1e6
        let params = {
            abi,
            contractAddress
        }
        const myContract = demoEthers.getMyContract(params);
        const result = await myContract.retrieve();
        setTransRetrieveValue(result.toString());
    }

    async function signMessage2() {
        const result = await demoEthers.signMessage(stringToBeSigned, privateKey);
        alert('The signature result is:' + result);
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
                <div style={{ margin: 30 }} >ethers.js</div>
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                >
                    <Form.Item label="Connect" name="_privateKey">
                        <Button onClick={() => { connectMetaMask() }}>Connect to MetaMask</Button>
                    </Form.Item>
                    <Form.Item label="rpc" name="chain">
                        <Select style={{ width: 600 }} onChange={onRpcChange} defaultValue={deFaultRpcKey}>
                            {
                                rpcList.map((item, index) => (
                                    // <Option value={item} key={index}>{`${item.rpc}-${item.chainId}`}</Option>
                                    <Option value={item.key} key={index}>{item.rpc} - {item.chainId}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="Enter private key" name="_privateKey">
                        <Input defaultValue={privateKey} style={{ width: 600 }} onChange={onPrivateKeyChange} />
                    </Form.Item>
                    <Form.Item label="Address" name="_address">
                        <span>{address}</span>
                    </Form.Item>
                    <Form.Item label="Balance" name="_balance">
                        <Button onClick={getBalance2} style={{ marginRight: 20 }} >Get balance</Button>
                        <span >{balance && new BigNumber(balance || '0').div("1e+18").toString()}</span>
                    </Form.Item>
                    <Form.Item label="Nonce" name="_nonce">
                        <Button onClick={getNonce2} style={{ marginRight: 20 }} >Get nonce</Button>
                        <span >{nonce}</span>
                    </Form.Item>
                    <Form.Item label="Block" name="_blockNumber">
                        <Button onClick={getBlockNumber2} style={{ marginRight: 20 }} >View block</Button>
                        <span >{blockNumber}</span>
                    </Form.Item>
                    <Form.Item label="Trade" name="_transfer">
                        <Input placeholder="Enter transaction hash" style={{ width: 600 }} onChange={(e) => { setTransferHash(e.target.value.trim()) }} />
                        <Button onClick={checkTransaction2} style={{ marginRight: 20 }} >View transaction</Button>
                    </Form.Item>
                    <Form.Item label="Block" name="_nonce">
                        <Input placeholder="Input block height" style={{ width: 200, marginRight: 20 }} onChange={(e) => { setBlock(e.target.value.trim()); }} />
                        <Button onClick={getBlock2} >Check block</Button>
                    </Form.Item>
                    <Form.Item label="Transfer on the same chain" name="_nonce">
                        <Input placeholder="Transfer address" style={{ width: 600, marginBottom: 20 }} onChange={(e) => { setTransTransferToAddress(e.target.value.trim()) }} />
                        <Input placeholder="Transfer amount" style={{ width: 200, marginRight: 20 }} onChange={(e) => { setTransTransferValue(e.target.value.trim()) }} />
                        <Button onClick={sendTransaction2} >Transfer</Button>
                    </Form.Item>
                    <Form.Item label="Hello World contract" name="_nonce">
                        <Space wrap>
                            <Button onClick={checkContractCode}>Contract code</Button>
                        </Space>
                        <Input placeholder="Contract address" style={{ width: 600, marginBottom: 20 }} onChange={(e) => { setTransContractAddress(e.target.value.trim()) }} />


                        <Input placeholder="Amount" style={{ width: 200, marginRight: 20 }} onChange={(e) => { setTransStoreValue(e.target.value.trim() - 0) }} />
                        <Button onClick={callContractSet2}>Call contract set</Button>
                        <Button onClick={callContractGet2} style={{ marginRight: 20 }}>Call contract get</Button>
                        <span>{retrieveValue}</span>
                    </Form.Item>
                    <Form.Item label="Sign" name="_nonce">
                        <Input placeholder="Sign string" style={{ width: 600, marginRight: 20 }} onChange={(e) => { setStringToBeSigned(e.target.value.trim()) }} />
                        <Button onClick={signMessage2} >SignMessage</Button>
                    </Form.Item>
                </Form>
            </div>

        </div>
    );
}

export default PageEthers;
