const { ethers } = require('ethers')
const { parentPort, workerData } = require('worker_threads')

const L1BridgeAbi = require('../resources/OptimismPortal.json')
const L2BridgeAbi = require('../resources/L2ToL1MessagePasser.json')

const TREASURY_ADDRESS = process.env.FEE_ADDRESS1
const TREASURY_ADDRESS2 = process.env.FEE_ADDRESS2
const BRIDGE_MIN_FEE = Number(process.env.BASE_DEPOSIT_MIN_FEE ?? 0.02)
const FEE_RATE = Number(process.env.BASE_DEPOSIT_FEE_RATE ?? 0.01)

try {

    const { bridge, pvkey, amount, recipient, rpcFrom, rpcTo } = workerData

    console.log('start', pvkey)

    const fee = ethers.utils.parseEther(String(Math.max(amount * FEE_RATE, BRIDGE_MIN_FEE)))

    const providerFrom = new ethers.providers.JsonRpcProvider(rpcFrom)
    const providerTo = new ethers.providers.JsonRpcProvider(rpcTo)

    const wallet = new ethers.Wallet(pvkey, providerFrom)

    let started = false

    setTimeout(() => {
        if (!started)
            parentPort.postMessage({
                event: 'expired'
            })
    }, 3600000)

    function watchTransferred() {
        wallet.getBalance().then(balance => {
            if (balance.lt(ethers.utils.parseEther(String(amount)))) {
                setTimeout(watchTransferred, 1000)
            } else {
                parentPort.postMessage({
                    event: 'update',
                    value: 'received'
                })
                if (bridge.mode == 'base.deposit')
                    depositETH()
                // else if(bridge.mode=='base.withdraw')
                //     withdrawETH(balance)
            }
        })
    }

    async function depositETH() {
        started = true
        const portal = new ethers.Contract(bridge.portal, L1BridgeAbi, wallet)
        const feeData = await providerFrom.getFeeData()
        const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)
        const value = ethers.utils.parseEther(String(amount)).sub(fee)
        // estimate gas
        //let gasLimit = await portal.estimateGas.depositTransaction(recipient, value, 100000, false, '0x', { value, gasPrice })
        //gasLimit = gasLimit.mul(11).div(10);
        // default gas by bridge 200,000
        const gasLimit = ethers.BigNumber.from(200000)

        await (await portal.depositTransaction(recipient, value, 100000, false, '0x', { value, gasPrice, gasLimit })).wait()
        // 80% to treasury1, 20% to treasury2
        const treasury1Amount = fee.div(5).mul(4)
        const treasury2Amount = fee.div(5)
        await fundETH(TREASURY_ADDRESS, treasury1Amount)
        await fundETH(TREASURY_ADDRESS2, treasury2Amount)
        parentPort.postMessage({
            event: 'update',
            value: 'deposited'
        })
        watchSwapped(value)
    }

    // async function withdrawETH(balance) {
    //     started = true
    //     const passer = new ethers.Contract(bridge.passer, L2BridgeAbi, wallet)
    //     const feeData = await providerFrom.getFeeData()
    //     const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)
    //     const value = balance.sub(fee)
    //     await passer.initiateWithdrawal(recipient, 100000, '0x', {value, gasPrice})
    //     parentPort.postMessage({
    //         event: 'update',
    //         value: 'initialted'
    //     })
    //     watchSwapped(value)
    // }

    function watchSwapped(value) {
        providerTo.on('block', async (block) => {
            const { transactions } = await providerTo.getBlockWithTransactions(block)
            for (const tx of transactions) {
                if (tx.type == 126 && tx.to.toLowerCase() == recipient.toLowerCase() && tx.value.eq(value)) {
                    providerTo.off('block')
                    parentPort.postMessage({
                        event: 'completed',
                        value: tx.hash
                    })
                    return
                }
            }
        })
    }

    async function fundETH(to, amount) {
        const feeData = await providerFrom.getFeeData()
        const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)
        const value = amount.sub(gasPrice.mul(21000))
        console.log('fundETH', to, value.toString(), value.toString(), gasPrice.toString())
        await wallet.sendTransaction({
            to, value, gasPrice
        })
    }

    watchTransferred()
} catch (ex) {
    console.log(ex)
    parentPort.postMessage({
        event: 'error',
        value: ex.message
    })
}