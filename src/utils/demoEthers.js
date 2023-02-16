const { BigNumber } = require('bignumber.js');
const { ethers, utils, } = require('ethers');

const util = require('ethereumjs-util');

// development
// const rpc = 'https://test1.thinkiumrpc.net'  //  100008
// const rpc = 'https://test2.thinkiumrpc.net'  //  100009
// const rpc = 'https://test103.thinkiumrpc.net'  //  100110


//production
// const rpc = 'https://proxy1.thinkiumrpc.net'  // 100008
// const rpc = 'https://proxy2.thinkiumrpc.net'  // 100009
// const rpc = 'https://proxy103.thinkiumrpc.net'  // 100110

let rpc;

const privateKey = '0xadb8bbdb1ea56ced2acfd98c76af1fb1ab65d32b5864b6373f0ccfc653193448'  //zla-2


export  async function connectMetaMask() {
    console.log('--connectMetaMask');
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    // let address = await signer.getAddress();
    // console.log('---address', address);

    // let obj = {
    //     to: '0x97239296AC6f4297F25Adfce6EEfE399448C1B33',
    //     value: utils.parseEther('1'),
    //     // gasPrice: utils.bigNumberify("20000000000"),
    //     // chainId: ethers.util.getNetwork('homestead').chainId
    // }

    // const result = await signer.sendTransaction(obj);
    // console.log('--result', result);

    return signer;
}


export async function createSingerByPrivateKey(){

}



export function setRpc(data) {
    rpc = data;
    console.log('---rpc', rpc);
}


export function getAddress(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address.toLowerCase();
    return address;
}


export async function getBalance(address) {
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    const balance = (await provider.getBalance(address)).toString(10);
    console.log('balance' + balance);
    return balance;
}

export async function getNonce(address) {
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    const transactionCount = await provider.getTransactionCount(address);
    console.log('nonce' + transactionCount);
    return transactionCount;
}


export async function getBlockNumber() {
    let provider = new ethers.providers.JsonRpcProvider(rpc)
    const result = await provider.getBlockNumber();
    console.log('当前块高是', result)
    return result;
}


export async function getBlock(blockHeight = 3150) {
    let provider = new ethers.providers.JsonRpcProvider(rpc)
    const result = await provider.getBlock(blockHeight);
    return result;
}


export async function checkTransaction(hash) {
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    let result = await provider.getTransactionReceipt(hash);
    return result;
}



export async function sendTransaction({ privateKey, to, value, gasLimit = 21000 }) {
    let obj = {
        gasLimit,
        to,
        value: utils.parseEther(value),
        // gasPrice: utils.bigNumberify("20000000000"),
        // chainId: ethers.util.getNetwork('homestead').chainId
    }
    console.log('---obj', obj)
    let provider = new ethers.providers.JsonRpcProvider(rpc)
    const wallet = new ethers.Wallet(privateKey, provider)
    const result = await wallet.sendTransaction(obj);
    console.log('----result', result);
    return result;
}



export async function deployContract({bytecode, abi, from = window.defaultAccount, gas = '4700000'}) {
    let provider = new ethers.providers.JsonRpcProvider(rpc)
    const wallet = new ethers.Wallet(privateKey, provider)
    let factory = new ethers.ContractFactory(abi, bytecode, wallet);
    let contract = await factory.deploy();
    let res = await contract.deployed();
    console.log('----contract', res)
    return res;
}

export function getMyContract({ abi, contractAddress, privateKey }) {
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    let wallet;
    if (privateKey) {
        wallet = new ethers.Wallet(privateKey, provider)
    }
    return new ethers.Contract(contractAddress, abi, wallet || provider);

}

export async function signMessage(message, privateKey) {
    const wallet = new ethers.Wallet(privateKey)
    const result = await wallet.signMessage(message)
    return result;
}





