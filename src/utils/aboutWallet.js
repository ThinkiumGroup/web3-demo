import bip39 from 'react-native-bip39'

const hdkey = require('hdkey');
const util = require('ethereumjs-util');

const bip32 = require('bip32');
const baddress = require('bitcoinjs-lib/src/address');
const bcrypto = require('bitcoinjs-lib/src/crypto');
const NETWORKS = require('bitcoinjs-lib/src/networks');
 




export default {
  getWalletAddressFormMnemonic(mnemonic){
    let seed = bip39.mnemonicToSeed(mnemonic);
    // //  使用 seed 产生 HD Wallet。如果要说更明确，就是产生 Master Key 并记录起来。
    let hdWallet = hdkey.fromMasterSeed(seed);
    let key1 = hdWallet.derive("m/44'/60'/0'/0/0");
    // //  使用 keypair 中的公钥产生 address。
    let address = util.pubToAddress(key1._publicKey, true);
    // //  基于BIP55协议对地址进行再次编码，获取最终ETH地址 
    address = util.toChecksumAddress(address.toString('hex'));
    return address;
  },

  btcGetWalletAddressFormMnemonic(mnemonic){
    let seed = bip39.mnemonicToSeed(mnemonic);
    let rootMasterKey = bip32.fromSeed(seed);
    let key = rootMasterKey.derivePath("m/44'/60'/0'/0/0");
    let address = baddress.toBase58Check(bcrypto.hash160(key.publicKey), NETWORKS.bitcoin.pubKeyHash);
    return address;
  }
}