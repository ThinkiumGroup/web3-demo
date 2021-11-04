
import _storage from './storage';
import walletApi from './demoThinkiumWeb3';
import { toBigNumber16 } from './common'

const withdrawToAddress = '0x0000000000000000000000000000000000020000';
const saveToAddress = '0x0000000000000000000000000000000000030000';
const returnToAddress = '0x0000000000000000000000000000000000040000';


class AboutCrossChain {
    constructor() {
        this.input = null;
        this.StatusEnums = {
            FAILED: -1,  
            WITHDRAWAL_SUCCESSFULLY: 0,  
            SUCCESSFULLY: 1, 
            REFUNDED_SUCCESSFULLY: 2, 
            REFUNDED_FAILED: 3, 
        }
    }

    async transfer({ fromChainId, toChainId, fromAddress, toAddress, value, privateKey }) {
        let params = {
            value: toBigNumber16(value),
            fromChainId,
            toChainId,
            fromAddress,
            toAddress,
            privateKey,
            withdrawToAddress,
        }
        let withdrawMoneyResult = await this.withdrawMoney(params);
        if (!withdrawMoneyResult) {
            return { status: this.StatusEnums.FAILED };
        }

        let saveTransferResult = await this.saveTransfer({ input: this.input, privateKey });
        if (saveTransferResult) {
            return { status: this.StatusEnums.SUCCESSFULLY };
        }

        let returnTransferResult = await this.returnTransfer({ input: this.input, privateKey });
        if (returnTransferResult) {
            return { status: this.StatusEnums.REFUNDED_SUCCESSFULLY };
        }

        return { status: this.StatusEnums.REFUNDED_FAILED };
    }

    async continueToTransfer({ timeStamp, privateKey }) {
        let input = this.getCrossChainInput(timeStamp);
        if (!input) {
            return;
        }
        const { ExpireHeight, ToChain } = walletApi.decodeInput(input)
        const currentHeight = await walletApi.getCurrentHeight(ToChain);

        if (currentHeight > ExpireHeight) {
            let result = await this.returnTransfer({ input, privateKey })
            if (result) return { status: this.StatusEnums.SUCCESSFULLY }
        } else {
            let result = await this.saveTransfer({ input, privateKey })
            if (result) return { status: this.StatusEnums.REFUNDED_SUCCESSFULLY }
        }

        return { status: this.StatusEnums.FAILED }
    }


    async withdrawMoney({ fromChainId, toChainId, fromAddress, toAddress, value, privateKey }) {
        const expireHeight = await walletApi.getCurrentHeight(toChainId) + 200 //Get fast high
        const nonce = await walletApi.getNonce(fromChainId, fromAddress);
        const cashCheque = { //Generate check parameters
            FromChain: fromChainId,
            ToChain: toChainId,
            FromAddress: fromAddress,
            ToAddress: toAddress,
            Nonce: nonce - 0,  //Must be Number
            Amount: value,
            ExpireHeight: expireHeight,
        }
        const input = walletApi.cashCheque(cashCheque)  //generate input

        this.input = input;
        //Withdrawal transaction parameters
        const withdrawlObj = {
            chainId: fromChainId,
            fromChainId: fromChainId,
            toChainId: fromChainId,
            from: fromAddress,
            to: withdrawToAddress,
            value: '0',
            nonce,
            input,
        }

        const signTransaction = await walletApi.signTransaction(withdrawlObj, privateKey);
        //Initiate transactions and query results
        const withdrawlHash = await walletApi.sendTx(signTransaction)

        if (withdrawlHash.TXhash) {
            const withdrawlReturn = await this.asyncTask(() => walletApi.getTransactionByHash(fromChainId, withdrawlHash.TXhash));
            if (withdrawlReturn.status == 1) {
                this.timeStamp = this.saveCrossChainInput(this.input);
                return true;
            }
        }
        return false;
    }


    async saveTransfer({ input, privateKey }) {
        const cheque = walletApi.decodeInput(input);
        const proofParam = {
            chainId: cheque.FromChain,
            fromChainId: cheque.FromChain,
            toChainId: cheque.ToChain,
            from: cheque.FromAddress,
            to: cheque.ToAddress,
            value: cheque.Amount.toString(),
            expireheight: cheque.ExpireHeight.toString(),
            nonce: cheque.Nonce.toString()
        }
        //Generate check proof
        const proofResult = await this.asyncTask(() => walletApi.rpcMakeVccProof(proofParam), 5)
        if (!proofResult || proofResult.errMsg) { //Check proof generation error
            return false
        }

        //Get the nonce of the target chain
        const nonce = await walletApi.getNonce(cheque.ToChain, cheque.FromAddress);
        const saveObj = {  //Deposit transaction parameters
            chainId: cheque.ToChain,
            fromChainId: cheque.ToChain,
            toChainId: cheque.ToChain,
            from: cheque.FromAddress,
            to: saveToAddress,
            input: proofResult.input,
            value: '0',
            nonce,
        }

        const signTransaction = await walletApi.signTransaction(saveObj, privateKey);
        const saveHash = await walletApi.sendTx(signTransaction)
        if (saveHash.TXhash) {
            const saveReturn = await this.asyncTask(() => walletApi.getTransactionByHash(cheque.ToChain, saveHash.TXhash))
            if (saveReturn.status == 1) {
                this.removeCrossChainInput(this.timeStamp)
                return true
            }
        }
        return false
    }

    async returnTransfer({ input, privateKey }) {
        console.log(input, 999239293)
        const cheque = walletApi.decodeInput(input);
        const cancelProofParam = {
            chainId: cheque.ToChain,
            fromChainId: cheque.FromChain,
            toChainId: cheque.ToChain,
            from: cheque.FromAddress,
            to: cheque.ToAddress,
            value: cheque.Amount.toString(),
            expireheight: cheque.ExpireHeight.toString(),
            nonce: cheque.Nonce.toString()
        }
        console.log(cheque, 90000288888)
        const proofCancel = await walletApi.makeCCCExistenceProof(cancelProofParam);
        if (proofCancel && !proofCancel.errMsg) { //The refund is successfully generated, and the refund process is executed
            const nonce = await walletApi.getNonce(cheque.FromChain, cheque.FromAddress);
            const cancelObj = {
                chainId: cheque.FromChain,
                fromChainId: cheque.FromChain,
                toChainId: cheque.FromChain,
                from: cheque.FromAddress,
                to: returnToAddress,
                input: proofCancel.input,
                value: '0',
                nonce,
            }
            const signTransaction = await walletApi.signTransaction(cancelObj, privateKey);
            const cancelHash = await walletApi.sendTx(signTransaction)
            console.log('---cancelHash', cancelHash)
            if (cancelHash.TXhash) {
                const cancelReturn = await this.asyncTask(() => walletApi.getTransactionByHash(cheque.FromChain, cancelHash.TXhash))
                if (cancelReturn.status == 1) {
                    this.removeCrossChainInput(this.timeStamp)
                    return true;
                }
            }
            return false;
        }
    }


    saveCrossChainInput(input) {
        if (!input) {
            return;
        }
        let timeStamp = Date.now()
        let obj = _storage.getItem('_crossChainInput') || {};
        obj[timeStamp] = { input };
        _storage.setItem('_crossChainInput', obj);
        return timeStamp;
    }

    getCrossChainInput(timeStamp) {
        if (!timeStamp) {
            return;
        }
        let obj = _storage.getItem('_crossChainInput') || {};
        return obj[timeStamp] && obj[timeStamp].input || null;
    }

    removeCrossChainInput(timeStamp) {
        if (!timeStamp) {
            return;
        }
        let obj = _storage.getItem('_crossChainInput') || {};
        delete obj[timeStamp];
        _storage.setItem('_crossChainInput', obj);
    }

    getAllCrossChainFailedData() {
        let obj = _storage.getItem('_crossChainInput') || {};
        let list = Object.keys(obj).map((key) => {
            const cheque = walletApi.decodeInput(obj[key].input);
            return {
                timeStamp: key - 0,
                fromChainId: cheque.FromChain,
                toChainId: cheque.ToChain,
                fromAddress: cheque.FromAddress,
                toAddress: cheque.ToAddress,
                nonce: cheque.Nonce.toString(),
                value: cheque.Amount.toString(),
                expireheight: cheque.ExpireHeight.toString()
            }
        })
        return list;
    }

    asyncTask(fn, n = 7) {
        const promise = new Promise((resolve, reject) => {
            let timeOut = null
            let num = 0
            timeOut = setInterval(async () => {
                num++
                const response = await fn()
                if (num > n || response && response.status) {
                    resolve(response)
                    clearInterval(timeOut)
                }
            }, 1000)
        })
        return promise
    }

}






export default AboutCrossChain;