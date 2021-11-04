import Web3 from 'thinkium-web3js';


// const rpc = 'http://rpctest.thinkium.org'
// const rpc = 'http://rpcproxy.thinkium.org'

let rpc;
let defaultBaseChainId = '100007';

export default {
    setRpc(data) {
        rpc = data;
        console.log('---rpc', rpc);
    },
    getCurrentHeight: async (chainId) => {
        const provider = new Web3.providers.HttpProvider(rpc);
        const web3 = new Web3(provider);
        const { currentheight } = await web3.thk.GetStats(chainId)
        return currentheight
    },
    cashCheque(data) {
        const web3 = new Web3();
        return web3.CashCheque.encode(data)
    },
    decodeInput(input) {
        var web3 = new Web3();
        return web3.CashCheque.decode(input)
    },
    rpcMakeVccProof(data) {
        const provider = new Web3.providers.HttpProvider(rpc);
        const web3 = new Web3(provider);
        return web3.thk.RpcMakeVccProof(data)
    },
    makeCCCExistenceProof(data) {
        const provider = new Web3.providers.HttpProvider(rpc);
        const web3 = new Web3(provider);
        return web3.thk.MakeCCCExistenceProof(data)
    },

    async getNonce(chainId, walletAddress) {
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        const { nonce } = await web3.thk.GetAccount(chainId, walletAddress);
        return nonce && nonce.toString();
    },
    signTransaction(obj, privateKey, baseChainId = defaultBaseChainId) {
        const web3 = new Web3();
        // web3.thk.defaultPrivateKey = new Buffer.from(privateKey.substring(2, 67), 'hex');
        // web3.thk.defaultAddress = address.toLowerCase();
        // web3.thk.defaultChainId = chainId.toString();
        // web3.thk.setVal(obj.value || '0');
        web3.thk.setBaseChainId(baseChainId)
        const signTransaction = web3.thk.signTransaction(obj, new Buffer.from(privateKey.substring(2, 67), 'hex'));
        return signTransaction;
    },
    sendTx(obj) {
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        return web3.thk.SendTx(obj)
    },
    getTransactionByHash(chainId, txHash) {
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        return web3.thk.GetTransactionByHash(chainId, txHash)
    },

    async callContract({ chainId = '103', value = '0', gasLimit }) {
        let contractAddress = '0xa9518d9b89fccf4a7f10bb452a1fbe436886409f'; 
        const abi = require('../abis/ERC20.json');
        const privateKey = '0xbe316c91fb4926300018038295f872443adde461ca28184f8ba598583ba3e769';
        const address = '0x7ee1cc7c95c6e741737b1340439e15f244f159dd';
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        if (privateKey) {
            web3.thk.defaultPrivateKey = new Buffer.from(privateKey.substring(2, 67), 'hex');
        }
        web3.thk.setGasLimit(gasLimit - 0);
        web3.thk.defaultChainId = chainId.toString();
        web3.thk.defaultAddress = address.toLowerCase();
        web3.thk.setVal(value + '');
        const myContract = web3.thk.contract(abi).at(contractAddress, null);
        const result = await myContract.transfer('0x7746943934c724621d01bCF3621b84576B460e4c', '1000000000000000000');
    }

}





