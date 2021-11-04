import { BigNumber } from 'bignumber.js';

import walletApi from './demoThinkiumWeb3'



export function toBigNumber16(nums) {
    return new BigNumber(`${nums}`).multipliedBy('1e+18').toString(16)
}


export async function getTransactionResultByHashCircularly(chainId, hash, delay){
    let cycTimes = 0;
    let interval;
    return new Promise((resolve, reject) => {
      interval = setInterval(async () => {
        let result = await walletApi.getTransactionByHash(chainId, hash) || {};
        console.log('status', result.status);
        if(result.status == 1 || cycTimes >= 8){
          clearInterval(interval);
          interval = null;
          if(result.status != 1){
            console.log('transaction failed，hash：', hash);
          }
          resolve(result.status == 1);
        }else{
          cycTimes++
        }
      }, delay || 1000);
    })
  }
