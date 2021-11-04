
import React, { useEffect } from 'react';
import { BigNumber } from 'bignumber.js';
import { Form, Button, Radio, Input, Select } from 'antd';
import { getChainIdEnum, getRpcUrl, chainBasicInfoPro, chainBasicInfoDev } from '../../utils/enums';
import * as demoEthers from '../../utils/demoEthers';
import AboutCrossChain from '../../utils/AboutCrossChain';
import walletApi from '../../utils/demoThinkiumWeb3';


const { Option } = Select

function getRpcList() {

  let list1 = Object.keys(chainBasicInfoDev)
    .filter(key => key == 'thk')
    .map(key => {
      const { rpc } = chainBasicInfoDev[key]
      return { key: `${key}Dev`, rpc }
    })

  let list2 = Object.keys(chainBasicInfoPro)
    .filter(key => key == 'thk')
    .map(key => {
      const { rpc } = chainBasicInfoPro[key]
      return { key: `${key}Pro`, rpc }
    })

  return list1.concat(list2)
}
function getChainList(env) {
  let chainBasicInfo = chainBasicInfoPro;
  if (env === 'dev') {
    chainBasicInfo = chainBasicInfoDev;
  }

  let list = Object.keys(chainBasicInfo)
    .filter(key => key !== 'main' && key !== 'thk')
    .map(key => {
      const { name, chainId, chainIdOriginal, rpc } = chainBasicInfo[key]
      return { label: name, chainId, chainIdOriginal, rpc }
    })
  return list || [];
}


const rpcList = getRpcList();
const deFaultRpcKey = rpcList[0] && rpcList[0].key;
const rpcData = rpcList.find(item => item.key === deFaultRpcKey);


const aboutCrossChain = new AboutCrossChain();
walletApi.setRpc(rpcData.rpc);

const defaultPrivateKey = '0xadb8bbdb1ea56ced2acfd98c76af1fb1ab65d32b5864b6373f0ccfc653193448'  //zla-2

function PageThinkiumWeb3() {
  const [privateKey, setPrivateKey] = React.useState(defaultPrivateKey);
  const [chainList, setChainList] = React.useState(getChainList('dev'));
  const [fromChainId, setFromChainId] = React.useState();
  const [toChainId, setToChainId] = React.useState();
  const [fromAddress, setFromAddress] = React.useState(demoEthers.getAddress(defaultPrivateKey));
  const [toAddress, setToAddress] = React.useState();
  const [transferAmount, setTransferAmount] = React.useState();

  useEffect(() => {

  })


  const onRpcChange = (value) => {
    const rpcData = rpcList.find(item => item.key === value);
    if (rpcData.rpc) {
      walletApi.setRpc(rpcData.rpc)
      let chainList = getChainList(value.includes('Dev') ? 'dev' : 'pro')
      setChainList(chainList);
    }
  }

  const onPrivateKeyChange = (e) => {
    const data = e.target.value.trim();
    try {
      setPrivateKey(data);
      const address = demoEthers.getAddress(data);
      setFromAddress(address);
    } catch (err) {
      setPrivateKey(defaultPrivateKey);
      alert(err);
    }
  }

  const onToAddressChange = (e) => {
    const data = e.target.value.trim();
    setToAddress(data);
  }
  const onTransferAmount = (e) => {
    const data = e.target.value.trim();
    if (data - 0) {
      setTransferAmount(data - 0)
    } else {
      setTransferAmount(0)
    }

  }

  async function toCrossChainTransfer() {
    const params = {
      value: transferAmount,
      fromChainId,
      toChainId,
      fromAddress,
      toAddress,
      privateKey
    }
    // let list = aboutCrossChain.getAllCrossChainFailedData();
    // console.log('--list', list)
    const result = await aboutCrossChain.transfer(params);
    if (result.status == aboutCrossChain.StatusEnums.FAILED) {
      alert('Cross-chain transfer failed')
    } else if (result.status == aboutCrossChain.StatusEnums.SUCCESSFULLY) {
      alert('Cross-chain transfer successfully')
    } else if (result.status == aboutCrossChain.StatusEnums.REFUNDED_SUCCESSFULLY) {
      alert('Cross-chain failure, refunded amount')
    } else {
      alert('Cross-chain failure, refund of amount failed')
    }
  }

  async function toContinueToTransfer(timeStamp) {
    const result = await aboutCrossChain.continueToTransfer({ timeStamp, privateKey });
    if (result.status == aboutCrossChain.StatusEnums.SUCCESSFULLY) {
      alert('Successful cross-chain transfer')
    } else if (result.status == aboutCrossChain.StatusEnums.REFUNDED_SUCCESSFULLY) {
      alert('Amount refunded successfully')
    } else {
      alert('Failed to continue transfer')
    }
  }



  return (
    <div className="container">
      <div className="_block">
        <div style={{ margin: 30 }}>thinkium-web3.js</div>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
        >
          <Form.Item label="rpc" name="chain">
            <Select style={{ width: 600 }} onChange={onRpcChange} defaultValue={deFaultRpcKey}>
              {
                rpcList.map((item, index) => (
                  // <Option value={item} key={index}>{`${item.rpc}-${item.chainId}`}</Option>
                  <Option value={item.key} key={index}>{item.rpc}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item label="Private key" name="_privateKey">
            <Input style={{ width: 600, marginRight: 20 }} onChange={onPrivateKeyChange} defaultValue={privateKey} />
          </Form.Item>
          <Form.Item label="Outgoing address" name="_address">
            <span>{fromAddress}</span>
          </Form.Item>
          <Form.Item label="Transfer-in address" name="_toAddress">
            <Input style={{ width: 600, marginRight: 20 }} onChange={onToAddressChange} value={toAddress} />
          </Form.Item>
          <Form.Item label="To chain" name="_fromChainId">
            {/* {fromChainId} */}
            <Radio.Group onChange={(e) => { setFromChainId(e.target.value) }} value={fromChainId}>
              {
                chainList.map((item, index) => (
                  <Radio value={item.chainIdOriginal} key={index} disabled={toChainId == item.chainIdOriginal}>{item.chainId}</Radio>
                ))
              }
            </Radio.Group>
          </Form.Item>
          <Form.Item label="From chain" name="_toChainId">
            {/* {toChainId} */}
            <Radio.Group onChange={(e) => { setToChainId(e.target.value) }} value={toChainId}>
              {
                chainList.map((item, index) => (
                  <Radio value={item.chainIdOriginal} key={index} disabled={fromChainId == item.chainIdOriginal}>{item.chainId}</Radio>
                ))
              }
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Transfer amount">
            <Input style={{ width: 600, marginRight: 20 }} onChange={onTransferAmount} />
          </Form.Item>
          <Form.Item label="Transfer" >
            <Button onClick={toCrossChainTransfer} >Transfer</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default PageThinkiumWeb3;
