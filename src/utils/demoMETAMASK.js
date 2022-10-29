import Web3 from 'web3';




export function checkEnvironment() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function init() {
    if (!checkEnvironment()) {
        return;
    }
    try {
        //let currentChainId = parseInt(window.window.ethereum.chainId, 16)
        let ethereum = window.ethereum
        ethereum.autoRefreshOnNetworkChange = false;
        const accounts = await ethereum.enable();
        let provider = window['ethereum'] || window.web3.currentProvider
        window.web3 = new Web3(provider)
        window.defaultAccount = accounts[0];
        return { address: window.defaultAccount };
    } catch (err) {
        console.log('---err', err);
        return '';
    }
}

export async function getAddress() { // 可以直接用 window.defaultAccount
    if (!checkEnvironment()) {
        throw new Error('MetaMask is not installed in the current browser')
    }
    const accounts = await window.web3.eth.getAccounts();
    const myAccount = accounts[0] || '';
    return myAccount;
}

export async function getChainId(){
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId
}


export async function getBalance(address = window.defaultAccount) {
    const balance = await window.web3.eth.getBalance(address);
    return balance.toString();

}

export async function getNonce(address) {
    const nonce = await window.web3.eth.getTransactionCount(address);
    return nonce.toString();
}

export async function getBlockNumber() {
    const blockNumber = await window.web3.eth.getBlockNumber();
    return blockNumber.toString();
}

export async function checkTransaction(hash) {
    let result = await window.web3.eth.getTransactionReceipt(hash);
    return result;
}

export async function getBlock(blockHeight) {
    return window.web3.eth.getBlock(blockHeight)
}

export async function sendTransaction({ from = window.defaultAccount, to, value }) {
    if (!to) {
        throw new Error('Please input toAddress for transaction');
    }
    if (!value) {
        throw new Error('Please input the amount of the transaction');
    }
    let result = await window.web3.eth.sendTransaction({ from, to, value })
    return result;
}


export function deployContract({ bytecode, abi, from = window.defaultAccount, gas = '4700000' }) {
    return new Promise((resolve, reject) => {
        let MyContract = new window.web3.eth.Contract(abi);
        var proof = MyContract.deploy({
            data: bytecode,
            arguments: [
            ]
        }).send({ from, gas }, function (e, contract) {
            if (e) {
                console.log('----e', e)
            }
            if (contract) {
                console.log('----contract', contract)
            }
        }).on('error', function (error) {
            reject(error)
        }).on('transactionHash', function (transactionHash) {
            console.log('---transactionHash', transactionHash)
        }).on('receipt', function (receipt) {
            let contractAddress = receipt.contractAddress.toLowerCase();
            console.log('---receipt', contractAddress) // contains the new contract address
            resolve(contractAddress)
        }).on('confirmation', function (confirmationNumber, receipt) {

        }).then(function (newContractInstance) {
            console.log(newContractInstance.options.address) // instance with the new contract address
        });
    })

}


export function getMyContract({ abi, contractAddress, override }) {
    return new window.web3.eth.Contract(abi, contractAddress, override);
}


export function getPendingTransactions() {
    window.web3.eth.getPendingTransactions().then((res) => {
        console.log('-----getPendingTransactions', res)
    })
}


export async function signMessage(message) {
    return window.web3.eth.sign(message, window.defaultAccount,)
}


export async function signPersonalMessage(message) {
    return window.web3.eth.personal.sign(message, window.defaultAccount,)
}



export async function verifySignatureRPL(message, sig) {
    return window.web3.eth.accounts.recover(message, sig);
}

export async function verifySignatureVRS(message, sig) {
    let r = sig.slice(0, 66)
    let s = '0x' + sig.slice(66, 130)
    let v = '0x' + sig.slice(130, 132)

    return window.web3.eth.accounts.recover(message, v, r, s);
}

export function recoverTransaction(sig){
    return window.web3.eth.accounts.recoverTransaction(sig);
}



