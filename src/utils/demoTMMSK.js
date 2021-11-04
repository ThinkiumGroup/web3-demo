import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';





export function checkEnvironment() {
    if (typeof window !== 'undefined' && typeof window.thinkium !== 'undefined') {
        return true;
    } else {
        return false;
    }
}

export async function init(type = 0) {
    if(!checkEnvironment()){
        return;
    }
    //let currentChainId = parseInt(window.window.thinkium.chainId, 16)
    let thinkium = window.thinkium
    thinkium.autoRefreshOnNetworkChange = false
    thinkium.enable().then(function (accounts) {
        if (!type) {
            alert('Link successfully. The current wallet address is: ' + accounts[0].toLowerCase())
        }
        let provider = window['thinkium'] || window.web3.currentProvider
        window.web3 = new Web3(provider)
        window.defaultAccount = accounts[0].toLowerCase()
    }).catch(function (error) {
        console.log('enable-error', error)
        alert('Link error')
    })
}


export async function getAddress() {
    const accounts = await window.web3.eth.getAccounts();
    const myAccount = accounts[0];
    alert('The current wallet address is' + myAccount)
}


export async function sendTransaction() {
    let transactionParameters = {
        from: window.defaultAccount, 
        to: '0x9b813ad4d666210996f4505e052267ed1f5f6300',
        value: '56bc75e2d63100000',
        input: ''
    }

    let txHash = await window.thinkium.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
    })

    alert('The transfer transaction is sent successfully, the hash is' + txHash)
}

export async function getBalance() {
    const accounts = await window.web3.eth.getAccounts();
    const myAccount = accounts[0];
    console.log(myAccount, 1);
    const balance = await window.web3.eth.getBalance(myAccount)
    alert('The current account balance is' + new BigNumber(balance).div("1e+18"))
}

export async function checkTransaction() {
    let txHash = '0x80f90d0775e0949cfff41600a2aa65f3987de8b66195bef53633e6c4461a214a';
    let result = await window.web3.eth.getTransactionReceipt(txHash);
    console.log('--result', result)
}


export function callContract() {
    let contractAddress = '0xcfe6383792866faa0ab2802ad4b457f27cc2bd67';

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
    let myContract = new window.web3.eth.Contract(abi, contractAddress);
    myContract.methods.store(11111).send({ from: window.defaultAccount, gasLimit: 1000000, })
        .on('transactionHash', function (transactionHash) {
            console.log('transactionHash', transactionHash)
            alert('transactionHash:' + JSON.stringify(transactionHash))
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log('confirmation', { confirmationNumber: confirmationNumber, receipt: receipt })
        })
        .on('receipt', function (receipt) {
            console.log('---receipt----', { receipt: receipt })
            alert('receipt: ' + JSON.stringify(receipt))
        })
        .on('error', function (error, receipt) {
            alert('error:' + JSON.stringify(error))
            console.log('error', { error: error, receipt: receipt })
        })

    myContract.methods.retrieve().call({ from: window.defaultAccount, value: '0x0' }).then((res) => {
        console.log('---resultGet', res)
    }).catch((err) => {
        console.log('---resultErr', err)
    })
}

export function getBlock() {
    window.web3.eth.getBlock(3150).then(console.log)
    // window.web3.eth.getCode("0xd5677cf67b5aa051bb40496e68ad359eb97cfbf8").then(console.log)
}

export function deployContract() {
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
    let MyContract = new window.web3.eth.Contract(abi);
    var proof = MyContract.deploy({
        data: bytecode,
        arguments: [
        ]
    }).send({
        from: window.defaultAccount,
        gas: '4700000'
    }, function (e, contract) {
        if (e) {
            console.log('----e', e)
        }
        if (contract) {
            console.log('----contract', contract)
        }
    }).on('error', function (error) {

    }).on('transactionHash', function (transactionHash) {
        console.log('---transactionHash', transactionHash)
    }).on('receipt', function (receipt) {
        console.log('---receipt', receipt.contractAddress) // contains the new contract address
    }).on('confirmation', function (confirmationNumber, receipt) {

    }).then(function (newContractInstance) {
        console.log(newContractInstance.options.address) // instance with the new contract address
    });
}


