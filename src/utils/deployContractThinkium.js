
const Web3 = require('thinkium-web3js');
const solc = require('solc');
const web3 = new Web3();


const rpxUrl = "http://rpctest.thinkium.org";
// const rpxUrl = "http://rpcproxy.thinkium.org";


const init = () => {
    return new Promise(async (resolve, reject) => {
        Web3.providers.HttpProvider(rpxUrl)
        web3.setProvider(new web3.providers.HttpProvider(rpxUrl));
        var privateKey = '0x3af38f0c6de457fcb20ec28cd8fd45d2dd13425662263c40638e02898c583a0c'
        var privateKeyBuffer =  new Buffer.from(privateKey.substring(2, 67), 'hex')
        web3.thk.defaultPrivateKey = privateKeyBuffer;
        web3.thk.defaultAddress = '0x9b813ad4d666210996f4505e052267ed1f5f6300'
        web3.thk.defaultChainId = '1'
        resolve()
    })
}

function getBufferPrivateKey(privateKey) {
    return new Buffer.from(privateKey.substring(2, 67), 'hex')
}

function sleep(delay) {
    const start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay * 1000) {
    }
}


function _compileContract(contractContent) {    //There may be multiple contracts
    const input = {
        language: 'Solidity',
        sources: {
            'test.sol': {
                content: contractContent
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    // for (var contractName in output.contracts['test.sol']) {
    //     console.log(contractName + ': ' + output.contracts['test.sol'][contractName]);
    // }
    return output.contracts['test.sol']
}

function _deployContract(abi, codes) {
    let contracts = web3.thk.contract(abi).new({ data: codes });
    console.log("contracts: " + JSON.stringify(contracts, null, 1));
    if (contracts.transactionHash) {
        sleep(5);
        const res = web3.thk.GetTransactionByHash(web3.thk.defaultChainId, contracts.transactionHash);
        return res.contractAddress
    }
    return '';
}


function compileContract() {
    let contents = `pragma solidity >= 0.5.0;
                contract HelloWorld {
                    uint256 age = 17;
                    string nickname = "Hello";
                    function getAge() public view returns (uint256 data){
                        return age;
                    }
                    function getNickname() public view returns (string memory data){
                        return nickname;
                    }
                    function setNickname(string memory data) public {
                        nickname = data;
                    }
                }`;

    const deployResult = _compileContract(contents)['HelloWorld'];
    const contractAbi = deployResult.abi;
    const contractByteCode = deployResult.evm.bytecode.object.slice(0, 2) === '0x' ? deployResult.evm.bytecode.object : '0x' + deployResult.evm.bytecode.object;
    return { contractAbi, contractByteCode }
}

function deployContract() {
    const { contractAbi, contractByteCode } = compileContract();
    const contractAddress = _deployContract(contractAbi, contractByteCode);
    console.log('contractAddress: ', contractAddress);
    console.log('contractAbi: ', JSON.stringify(contractAbi));
}

init().then(() => {
    deployContract();
})
