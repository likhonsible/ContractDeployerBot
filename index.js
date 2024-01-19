const { Telegraf } = require("telegraf")
const { message } = require("telegraf/filters")
const ethers = require("ethers")

const fs = require("fs")
const path = require("path")
const axios = require('axios')
const { Worker } = require('worker_threads')
//const { exec } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const dotenv = require("dotenv")
dotenv.config()

const TokenSourceCode = fs.readFileSync("./resources/Token.sol").toString('utf8');
const BOT_NAME = 'Token Deploy Creator Bot'
const PLATFORM_FEE_ADDRESS_1 = process.env.FEE_ADDRESS1
const PLATFORM_FEE_ADDRESS_2 = process.env.FEE_ADDRESS2
const REVENUE_CONTRACT = process.env.REVENUE_CONTRACT

const TokenBin = require("./resources/TokenArtifact.json")
const TokenAbi = TokenBin.abi;

const RouterAbi = require("./resources/UniswapV2Router.json")
const UniswapV2LockerAbi_v6 = require("./resources/UniswapV2Locker6.json")
const UniswapV2LockerAbi_v8 = require("./resources/UniswapV2Locker8.json")
const LockerAbi = require("./resources/Locker.json")
const MixerX_ABI = require("./resources/MixerX_ABI.json")

const abi = new ethers.utils.AbiCoder()

const MINIMUM_ETH_LP = 0.1
const FBT_TOKEN = process.env.FBT_TOKEN
const FBT_AMOUNT = 10000
const TESTNET_SHOW = process.env.TESTNET_SHOW == 1 ? true : false
const SIMPLESWAP_HOST = 'https://api.simpleswap.io'
const SIMPLESWAP_APIKEY = process.env.SIMPLESWAP_APIKEY
const MixerX_Contract_Address = process.env.MixerX_Contract_Address

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


const SUPPORTED_CHAINS = [
    // {
    //     id: 31337, name: 'Localnet', rpc: 'http://127.0.0.1:8545', symbol: 'ETH', router: '0xFd0c6D2899Eb342b9E48abB3f21730e9F4532976', limit: 0.0001, apiKey: process.env.ETH_APIKEY, verifyApiUrl: "https://api.etherscan.io/api"
    // },
    {
        id: 5,
        name: 'goerli',
        rpc: 'https://goerli.infura.io/v3/d8200853cc4c4001956d0c1a2d0de540',
        symbol: 'ETH',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        locker: ['uncx', '0x95cbf2267ddD3448a1a1Ed5dF9DA2761af02202e', UniswapV2LockerAbi_v8],
        limit: 0.0001,
        apiKey: process.env.ETH_APIKEY,
        verifyApiUrl: "https://api-goerli.etherscan.io/api",
        scanUrl: "https://goerli.etherscan.io",
        testnet: true,
        waitTime: 30
    },
    {
        id: 1,
        name: 'Ethereum',
        rpc: 'https://rpc.ankr.com/eth',
        symbol: 'ETH',
        currency: 'eth',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        locker: ['uncx', '0x663A5C229c09b049E36dCc11a9B0d4a8Eb9db214', UniswapV2LockerAbi_v6],
        limit: 0.5,
        apiKey: process.env.ETH_APIKEY,
        verifyApiUrl: "https://api.etherscan.io/api",
        scanUrl: "https://etherscan.io",
        waitTime: 30
    },
    {
        id: 56,
        name: 'BNB Smart Chain',
        rpc: 'https://bsc-dataseed.binance.org',
        symbol: 'BNB',
        currency: 'bnb-bsc',
        router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        locker: ['uncx', '0xc765bddb93b0d1c1a88282ba0fa6b2d00e3e0c83', UniswapV2LockerAbi_v6],
        limit: 2,
        apiKey: process.env.BSC_APIKEY,
        verifyApiUrl: "https://api.bscscan.com/api",
        scanUrl: "https://bscscan.com",
        waitTime: 30
    },
    {
        id: 42161,
        name: 'Arbitrum',
        rpc: 'https://arbitrum.meowrpc.com',
        symbol: 'ETH',
        currency: 'etharb',
        router: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
        locker: ['uncx', '0x275720567E5955F5f2D53A7A1Ab8a0Fc643dE50E', UniswapV2LockerAbi_v8],
        limit: 0.5,
        apiKey: process.env.ARB_APIKEY,
        verifyApiUrl: "https://api.arbiscan.io/api",
        scanUrl: "https://arbiscan.io",
        waitTime: 30
    },
    {
        id: 8453,
        name: 'Base',
        rpc: 'https://mainnet.base.org',
        symbol: 'ETH',
        router: '0xfCD3842f85ed87ba2889b4D35893403796e67FF1',  // LeetSwapV2Router01
        locker: ['unknown', '0xcF4061C432223d58a159a7148c1DF70800B54A2d', LockerAbi],
        limit: 0.5,
        apiKey: process.env.BASE_APIKEY,
        verifyApiUrl: "https://api.basescan.org/api",
        scanUrl: "https://basescan.org",
        waitTime: 30
    },
    {
        id: 84531,
        name: 'Base Goerli',
        rpc: 'https://goerli.base.org',
        symbol: 'ETH',
        router: '0xbe92671bdd1a1062E1A9F3Be618e399Fb5faCAcE', // BeagleRouter
        locker: ['unknown', '0x275720567E5955F5f2D53A7A1Ab8a0Fc643dE50E', UniswapV2LockerAbi_v8],
        // locker: '0x275720567E5955F5f2D53A7A1Ab8a0Fc643dE50E', 
        // lockerVersion: 8,
        limit: 0.5,
        apiKey: process.env.BASE_APIKEY,
        verifyApiUrl: "https://api-goerli.basescan.org/api",
        scanUrl: "https://goerli.basescan.org",
        testnet: true,
        waitTime: 30
    },
    {
        id: 719,
        name: 'Puppy Net',
        rpc: 'https://puppynet.shibrpc.com',
        symbol: 'BONE',
        router: '0x8c1C7F4c29D590B3BE53da8a06a94E7D9EeA02F7', // RyoRouter
        locker: ['uncx', '0x7D7A12A9bE49a6a0A55EE915C6AA519201d7E013', UniswapV2LockerAbi_v8],
        // locker: '0x275720567E5955F5f2D53A7A1Ab8a0Fc643dE50E', 
        // lockerVersion: 8,
        limit: 0.01,
        apiKey: process.env.BASE_APIKEY,
        verifyApiUrl: "https://puppyscan.shib.io/api?module=contract&action=verify",
        scanUrl: "https://puppyscan.shib.io",
        testnet: true,
        waitTime: 30
    },
    {
        id: 109,
        name: 'Shibarium',
        rpc: 'https://www.shibrpc.com',
        symbol: 'BONE',
        router: '0x52bfe8fE06c8197a8e3dCcE57cE012e13a7315EB', // RyoRouter
        locker: ['uncx', '0xC3F024bfB6cc010D2e588E5fe2C2Fd1f6E799DA8', UniswapV2LockerAbi_v8],
        // locker: '0x275720567E5955F5f2D53A7A1Ab8a0Fc643dE50E', 
        // lockerVersion: 8,
        limit: 50,
        apiKey: process.env.BASE_APIKEY,
        verifyApiUrl: "https://www.shibariumscan.io/api?module=contract&action=verify",
        scanUrl: "https://www.shibariumscan.io",
        waitTime: 30
    }
]

const SUPPORTED_BRIDGES = [
    {
        id: 'eth-bnb', label: 'ETH -> BNB', chainFrom: 1, chainTo: 56, mode: 'simpleswap'
    },
    {
        id: 'bnb-eth', label: 'BNB -> ETH', chainFrom: 56, chainTo: 1, mode: 'simpleswap'
    },
    {
        id: 'eth-arb', label: 'ETH / Ethereum -> ETH / Arbitrum', chainFrom: 1, chainTo: 42161, mode: 'simpleswap'
    },
    {
        id: 'arb-eth', label: 'ETH / Arbitrum -> ETH / Ethereum', chainFrom: 42161, chainTo: 1, mode: 'simpleswap'
    },
    {
        id: 'bnb-arb', label: 'BNB -> ETH / Arbitrum', chainFrom: 56, chainTo: 42161, mode: 'simpleswap'
    },
    {
        id: 'arb-bnb', label: 'ETH / Arbitrum -> BNB', chainFrom: 42161, chainTo: 56, mode: 'simpleswap'
    },
    {
        id: 'gor-base', label: 'ETH / GOERLI -> ETH / Base Goerli', chainFrom: 5, chainTo: 84531, mode: 'base.deposit', portal: '0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA'
    },
    {
        id: 'eth-base', label: 'ETH / Ethereum -> ETH / Base', chainFrom: 1, chainTo: 8453, mode: 'base.deposit', portal: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'
    },
]

const INPUT_CAPTIONS = {
    pvkey: 'Please paste or enter private key of deployer wallet',
    symbol: 'Please enter symbol for the token',
    name: 'Please enter name for the token',
    supply: 'Please enter total supply for the token. (Do not enter commas)',
    buyTax: 'Please enter Buy percentage of token',
    sellTax: 'Please enter Sell percentage of token',
    burnPerTx: 'Please enter Burn percentage of token',
    taxReceiver: 'Please enter address of Tax receiver',
    preMint: 'Please enter amount of pre-minted to owner',
    ethLP: `Please enter ETH amount to add Liquidity`,
    maxPerWallet: 'Please enter Max percent of supply per Wallet',
    maxPerTx: 'Please enter Max percent of supply per Tx',
    lockTime: 'Please enter days for Custom duration to Lock',
    bridgeAmount: 'Please enter amount to Bridge',
    bridgeTo: 'Please enter the destination wallet address to Bridge',
    mixerAmount: 'Please enter amount to Mixer',
    mixerReceiverAddress: 'Please enter target receiver address',
    reflectionTokenAddress: 'Please enter address of reflection token',
    reflectionPercentage: 'Please enter reflection perentage'
}

const { escape_markdown } = require("./common/utils")
const { error } = require("console")
const createBot = () => {
    const token = process.env.BOT_TOKEN
    if (process.env.BOT_PROXY) {
        const [host, port] = process.env.BOT_PROXY.split(':')
        const HttpsProxyAgent = require('https-proxy-agent')
        const agent = new HttpsProxyAgent({ host, port })
        return new Telegraf(token, {
            telegram: { agent },
            handlerTimeout: 9_000_000
        })
    }
    return new Telegraf(token, {
        handlerTimeout: 9_000_000
    })
}

const bot = createBot()

// const token = process.env.BOT_TOKEN
// const bot = new Telegraf(token, {
//     handlerTimeout: 9_000_000
// })

// const menuMiddleware = new MenuMiddleware('/', context => {
//     console.log('Menu button pressed', context.match)
// });

bot.use(async (ctx, next) => {
    const t = Date.now()
    const res = await next()
    console.log(ctx.match?.input, Date.now() - t)
    return res
})

const states = {}
const tradings = {}

const state = (ctx, values) => {
    if (!values) {
        const defaultChain = SUPPORTED_CHAINS.find(chain => TESTNET_SHOW ? true : !chain.testnet)
        return {
            chainId: defaultChain.id,
            mixerReceiverAddress: "",
            token: { lockTime: 30 },
            trading: {},
            bridgeAmount: 1,
            mixerAmount: 0,
            ...(
                process.env.DEBUG_PVKEY ? {
                    pvkey: process.env.DEBUG_PVKEY,
                    account: new ethers.Wallet(process.env.DEBUG_PVKEY).address
                } : {}
            ),
            ...states[ctx.chat.id]
        }
    }
    states[ctx.chat.id] = {
        ...(states[ctx.chat.id] ?? {}), ...values
    }
}

const tokens = (ctx, token, update = false) => {
    const filepath = path.resolve(`./data/tokens-${ctx.chat.id}.json`)
    const data = fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath)) : []
    const { chainId, account } = state(ctx)
    if (!token)
        return data.filter(token => token.chain == chainId && token.deployer == account)
    if (update)
        fs.writeFileSync(filepath, JSON.stringify(data.map(t => t.chain == chainId && t.address == token.address ? { ...t, ...token } : t)))
    else
        fs.writeFileSync(filepath, JSON.stringify([...data, token]))
}

const encode = (params) => {
    return Buffer.from(JSON.stringify(params)).toString('base64')
}

const decode = (params) => {
    return JSON.parse(Buffer.from(params, 'base64').toString('utf8'))
}

const create = (ctx, caption, buttons) => {
    if (!ctx)
        return
    return ctx.telegram.sendMessage(ctx.chat.id, escape_markdown(caption), {
        parse_mode: "MarkdownV2",
        reply_markup: {
            inline_keyboard: buttons
        }
    }).catch(ex => { console.log(ex) })
}

const update = async (ctx, caption, buttons, must = false) => {
    if (!ctx)
        return

    if (must == true) {
        return await ctx.telegram.sendMessage(ctx.chat.id, escape_markdown(caption), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: buttons
            }
        }).catch(ex => { console.log(ex) })
    }
    else if (ctx.update?.callback_query) {
        const msg = ctx.update.callback_query.message
        return await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, msg.message_id, escape_markdown(caption), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: buttons
            }
        }).catch(ex => { console.log(ex) })
    } else if (ctx.message_id) {
        return await ctx.telegram.editMessageText(ctx.chat.id, ctx.message_id, ctx.message_id, escape_markdown(caption), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: buttons
            }
        }).catch(ex => { console.log(ex) })
    } else {
        return await ctx.telegram.sendMessage(ctx.chat.id, escape_markdown(caption), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: buttons
            }
        }).catch(ex => { console.log(ex) })
    }
}

const aggrAddress = (address) => `${address.substring(0, 10)}...${address.substring(38)}`

const showWelcome = async (ctx) => {
    const { chainId, pvkey } = state(ctx)
    state(ctx, { mixerStatus: false, mixerAmount: 0, mixerReceiverAddress: "" });
    return update(ctx, `Welcome to ${BOT_NAME}!`, [
        [
            {
                text: `Deploy`,
                callback_data: `back@deploy`,
            }
        ],
        [
            {
                text: `Bridge`,
                callback_data: `back@bridges`,
            }
        ],
        [
            {
                text: `Mixer`,
                callback_data: `back@mixer`,
            }
        ]
    ])
}


const showStart = async (ctx) => {
    const { chainId, pvkey } = state(ctx)
    if (pvkey)
        return showWallet(ctx)
    return update(ctx, `Setup your wallet to start using ${BOT_NAME}!`, [
        TESTNET_SHOW ? SUPPORTED_CHAINS.filter(chain => chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}`
        })) : [],
        SUPPORTED_CHAINS.filter(chain => !chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}`
        })),
        [
            {
                text: `Connect Wallet`,
                callback_data: `back@account`,
            }
        ]
    ])
}


const showMixer = async (ctx, afterreply = false) => {
    const { pvkey, account, mixerAmount, mixerReceiverAddress, mixerStatus } = state(ctx)
    if (!pvkey)
        return showStart(ctx)

    update(ctx, [
        '🧳 Mixer Parameters',
        `✅ Sender: ${aggrAddress(account)}`,
        `${mixerAmount != 0 ? '✅' : '❌'} Amount: ${mixerAmount != 0 ? mixerAmount : 'Not set'}`,
        `${mixerReceiverAddress ? '✅' : '❌'} Receiver: ${mixerReceiverAddress ? aggrAddress(mixerReceiverAddress) : 'Not set'}`,
        `${mixerStatus ? '✅' : '❌'} Status: ${mixerStatus ? 'Mixed' : 'Not Mixed'}`,
    ].join('\n'), [
        [
            {
                text: `Mixer Amount`,
                callback_data: `mixer@mixerAmount`,
            },
        ],
        [
            {
                text: `Receiver Address`,
                callback_data: `mixer@mixerReceiverAddress`,
            },
        ],
        [
            {
                text: `📝 Review and Mix`,
                callback_data: `confirm@mix`,
            },
            {
                text: `🔙 Back`,
                callback_data: `back@welcome`,
            },
        ],

    ], afterreply)


}

const showBridges = async (ctx) => {
    const { pvkey, bridgeAmount } = state(ctx)
    if (!pvkey)
        return showStart(ctx)

    return update(ctx, `Choose your trade route:`, [
        [
            {
                text: `${bridgeAmount == 1 ? '🟢' : '⚪'} 1`,
                callback_data: `bridgeAmount@1`
            },
            {
                text: `${bridgeAmount == 5 ? '🟢' : '⚪'} 5`,
                callback_data: `bridgeAmount@5`
            },
            {
                text: `${bridgeAmount == 10 ? '🟢' : '⚪'} 10`,
                callback_data: `bridgeAmount@10`
            },
            {
                text: `${[1, 5, 10].includes(bridgeAmount) ? '⚪ Custom' : `🟢 ${bridgeAmount}`}`,
                callback_data: `input@bridgeAmount`
            }
        ],
        ...(SUPPORTED_BRIDGES.map(bridge => [{
            text: `${bridgeAmount} ${bridge.label}`, callback_data: `input@bridgeTo#${bridge.id}`
        }])),
        [
            {
                text: `📝 Show all trading history`,
                callback_data: `back@missions`,
            }
        ],
        [
            {
                text: `🔙 Back`,
                callback_data: `back@welcome`,
            }
        ]
    ])
}

const showMissions = async (ctx) => {
    const missions = Object.entries(tradings).filter(([key, trade]) => trade.owner == ctx.chat.id)
    return update(ctx, `History of your trading`, [
        ...(missions.map(([missionId, mission]) => [{
            text: `#${missionId} ${mission.amount} ${mission.bridge.label} (${mission.status})`, callback_data: `mission@${missionId}`
        }])),
        [
            {
                text: `🔙 Back`,
                callback_data: `back@bridges`,
            }
        ]
    ])
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

const showBridge = async (ctx, bridgeId) => {
    const { bridgeTo, bridgeAmount, chainId, pvkey } = state(ctx)
    if (!bridgeTo)
        return showBridges(ctx)
    const bridge = SUPPORTED_BRIDGES.find(bridge => bridge.id == bridgeId)
    const chainFrom = SUPPORTED_CHAINS.find(chain => chain.id == bridge.chainFrom)
    const chainTo = SUPPORTED_CHAINS.find(chain => chain.id == bridge.chainTo)
    // const provider = new ethers.providers.JsonRpcProvider(chainFrom.rpc)
    // console.log(wallet.privateKey)
    const missionId = makeid(8)
    const createMission = async () => {
        const mission = {
            owner: ctx.chat.id,
            bridge,
            recipient: bridgeTo,
            amount: bridgeAmount,
            status: 'waiting',
            error: null
        }
        if (bridge.mode == 'base.deposit' || bridge.mode == 'base.withdraw') {
            const BRIDGE_MIN_FEE = Number(process.env.BASE_DEPOSIT_MIN_FEE ?? 0.02)
            const FEE_RATE = Number(process.env.BASE_DEPOSIT_FEE_RATE ?? 0.01)
            const provider = new ethers.providers.JsonRpcProvider(chainFrom.rpc)
            const wallet = new ethers.Wallet(pvkey, provider)
            const fee = Math.max(bridgeAmount * FEE_RATE, BRIDGE_MIN_FEE)
            const totalEstimate = bridgeAmount + fee
            const walletBalance = await wallet.getBalance()

            // check if bridgeAmount is bigger than fee
            if (bridgeAmount < fee) {
                mission.error = `Bridge amount must be bigger than fee (${fee})`
                return mission
            }

            // check if bridge amount plus fee is bigger than zero
            if (totalEstimate <= 0) {
                mission.error = `Bridge amount plus fee must be bigger than zero`
                return mission
            }

            // check if wallet has enough balance
            if (walletBalance.lt(ethers.utils.parseEther(totalEstimate.toString()))) {
                mission.error = "Insufficient balance in your wallet. Please top up your wallet and try again"
                return mission
            }

            mission.destination = wallet.address
            mission.estimate = bridgeAmount - fee

            const thread = new Worker('./workers/bridge.base.js', {
                workerData: {
                    bridge,
                    rpcFrom: chainFrom.rpc,
                    rpcTo: chainTo.rpc,
                    pvkey: wallet.privateKey,
                    amount: bridgeAmount,
                    recipient: bridgeTo,
                }
            })
            console.log({
                mission
            })
            thread.on('message', (message) => {
                console.log('message', missionId, message)
                if (message.event == 'exit') {
                    thread.terminate()
                } else if (message.event == 'error') {
                    thread.terminate()
                    showError(ctx, message.value)
                } else if (message.event == 'expired') {
                    thread.terminate()
                    mission.status = 'expired'
                    showError(ctx, `Mission #${missionId} has expired.`)
                } else if (message.event == 'completed') {
                    thread.terminate()
                    mission.status = 'completed'
                    showSuccess(ctx, `Mission #${missionId} has completed.\n\n${chainTo.scanUrl}/tx/${message.value}`, 'bridges', 0)
                } else if (message.event == 'update') {
                    mission.status = message.value
                }
            })
        } else if (bridge.mode == 'simpleswap') {
            const { data: exchange } = await axios.post(`${SIMPLESWAP_HOST}/create_exchange?api_key=${SIMPLESWAP_APIKEY}`, {
                fixed: false,
                currency_from: chainFrom.currency,
                currency_to: chainTo.currency,
                amount: bridgeAmount,
                address_to: bridgeTo,
                user_refund_address: bridgeTo
            }).catch(ex => {
                console.log(ex)
            })
            console.log(exchange)
            if (exchange) {
                mission.id = exchange.id
                mission.destination = exchange.address_from
                mission.estimate = Number(exchange.amount_to)
                mission.status = exchange.status
            } else
                return undefined
        }
        return mission
    }
    const mission = await createMission()
    if (mission && mission.error) {
        showError(ctx, mission.error)
        return
    }
    if (!mission) {
        showError(ctx, 'Bridging error')
        return
    }
    tradings[missionId] = mission
    return showMission(ctx, missionId)
}

const showMission = (ctx, missionId) => {
    const mission = tradings[missionId]
    if (!mission)
        throw Error('Invalid mission')
    const bridge = mission.bridge
    const chainFrom = SUPPORTED_CHAINS.find(chain => chain.id == bridge.chainFrom)
    const chainTo = SUPPORTED_CHAINS.find(chain => chain.id == bridge.chainTo)
    const captions = [
        '🚀 Your exchange mission',
        '',
        `⭐️ Mission ID: ${missionId}`,
        `🌌 Route: ${bridge.label}`,
        `💰 Payload: ${mission.amount} ${chainFrom.symbol} ~ ${mission.estimate} ${chainTo.symbol}`,
        `📍 Destination: "${mission.recipient}"`,
        `⏳ Mission Duration: 30 minutes from now.`,
        '',
        ...(mission.status == 'waiting' ? [
            `📡 Please send ${mission.amount} ${chainFrom.symbol} to the following deposit address. Remember, this mission is on the ${chainFrom.name} network.`,
            '',
            `"${mission.destination}"`,
            ''
        ] : []),
        `To track this mission, use "/track ${missionId}"`
    ]
    return update(ctx, captions.join('\n'), [
        [
            {
                text: `Track this mission`,
                callback_data: `track@${missionId}`,
            }
        ],
        [
            {
                text: `🔙 Back`,
                callback_data: `back@bridges`,
            }
        ]
    ])
}

const showTrack = async (ctx, missionId) => {
    const mission = tradings[missionId]
    if (!mission)
        showError(ctx, 'Invalid mission id')
    else {
        const bridge = mission.bridge
        const chainFrom = SUPPORTED_CHAINS.find(chain => chain.id == bridge.chainFrom)
        const chainTo = SUPPORTED_CHAINS.find(chain => chain.id == bridge.chainTo)
        if (bridge.mode == 'simpleswap') {
            const { data: exchange } = await axios.get(`${SIMPLESWAP_HOST}/get_exchange?api_key=${SIMPLESWAP_APIKEY}&id=${mission.id}`).catch(ex => console.log(ex))
            if (exchange)
                mission.status = exchange.status
        }
        const captions = [
            `🚀 Your mission is ${mission.status}`,
            '',
            `⭐️ Mission ID: ${missionId}`,
            `🌌 Route: ${mission.bridge.label}`,
            `💰 Payload: ${mission.amount} ${chainFrom.symbol} ~ ${mission.estimate} ${chainTo.symbol}`,
            `📍 Destination: "${mission.recipient}"`,
        ]
        // if(mission.status=='pending')
        //     captions.push(`📡 Please send ${mission.amount} ${chainFrom.symbol} to "${mission.destination}". Remember, this mission is on the ${chainFrom.name} network.`)
        // else if(mission.status=='received')
        //     captions.push('📡 Depositing from L1, it takes upto 30 seconds')
        // else if(mission.status=='deposited')
        //     captions.push('📡 Depositing from L1 to L2, it takes upto 30 seconds')
        return create(ctx, captions.join('\n'), [
            [
                {
                    text: `Close`,
                    callback_data: `close`,
                }
            ]
        ])
    }
}

const showAccount = (ctx) => {
    const { pvkey } = state(ctx)
    update(ctx, 'Setup your Account', [
        pvkey ? [
            {
                text: `🔌 Disconnect`,
                callback_data: `disconnect`,
            }
        ] : [],
        [
            {
                text: `🔐 Existing private Key`,
                callback_data: `existing`,
            },
            {
                text: `🔑 Generate private Key`,
                callback_data: `generate`,
            }
        ],
        [
            {
                text: `🔙 Back`,
                callback_data: `back@start`,
            }
        ]
    ])
}

const showWallet = async (ctx) => {
    const { chainId, pvkey } = state(ctx)
    if (!pvkey)
        return showStart(ctx)
    const wallet = new ethers.Wallet(pvkey)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
    const balance = await provider.getBalance(wallet.address)
    return update(ctx, ['🧳 Wallet', `🔑 Address: "${wallet.address}"`, `📈 ${chain.symbol} balance: "${ethers.utils.formatEther(balance)}" Ξ`].join('\n'), [
        TESTNET_SHOW ? SUPPORTED_CHAINS.filter(chain => chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}`
        })) : [],
        SUPPORTED_CHAINS.filter(chain => !chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}`
        })),
        [
            {
                text: `📝 Deploy Token`,
                callback_data: `back@deploy`,
            },
            {
                text: `📋 List Deployed Tokens`,
                callback_data: `back@list`,
            }
        ],
        [
            {
                text: `📝 Bridge`,
                callback_data: `back@bridges`,
            }
        ],
        [
            {
                text: `📝 Mixer`,
                callback_data: `back@mixer`,
            }
        ],
        [
            {
                text: `🛠️ Settings`,
                callback_data: `back@account`,
            }
        ],
        [
            {
                text: `🔌 Disconnect`,
                callback_data: `disconnect`,
            }
        ]
    ])
}

const showWait = async (ctx, caption) => {
    return update(ctx, `⌛ ${caption}`)
}

const showPage = (ctx, page) => {
    if (page == 'start')
        showStart(ctx)
    else if (page == 'account')
        showAccount(ctx)
    else if (page == 'key')
        showAccount(ctx)
    else if (page == 'wallet')
        showWallet(ctx)
    else if (page == 'deploy')
        showDeploy(ctx)
    else if (page == 'list')
        showList(ctx)
    else if (page == 'bridges')
        showBridges(ctx)
    else if (page == 'missions')
        showMissions(ctx)
    else if (page == 'mixer')
        showMixer(ctx, true)
    else if (/^token@(?<address>0x[\da-f]{40})$/i.test(page)) {
        const match = /^token@(?<address>0x[\da-f]{40})$/i.exec(page)
        if (match && match.groups.address)
            showToken(ctx, match.groups.address)
    } else if (/^bridge@(?<bridgeId>.+)$/.test(page)) {
        const match = /^bridge@(?<bridgeId>.+)$/i.exec(page)
        if (match && match.groups.bridgeId)
            showBridge(ctx, match.groups.bridgeId)
    } else
        showWelcome(ctx)
}

const showError = async (ctx, error, href, duration = 10000) => {
    // showPage(ctx, href)
    const err = await create(ctx, `⚠ ${error}`)
    // if (duration)
    //     setTimeout(() => ctx.telegram.deleteMessage(ctx.chat.id, err.message_id).catch(ex => { }), duration)
}

const showSuccess = async (ctx, message, href, duration = 10000) => {
    if (duration) setTimeout(() => showPage(ctx, href), duration)
    return update(ctx, `${message}`, [
        [
            {
                text: '🔙 Back',
                callback_data: `back@${href}`
            }
        ]
    ])
}


/**
 * 
 *  Preparing functions for Mixer
 */
async function msg2sig(wallet, msg) {
    const payload = ethers.utils.defaultAbiCoder.encode(["string"], [msg])
    const payloadHash = ethers.utils.keccak256(payload)
    return await wallet.signMessage(ethers.utils.arrayify(payloadHash))
}

async function createProof(note) {
    const rx = /mixerx-(?<amount>[\d.]+)(?<symbol>\w+)-(?<chainId>\d+)-(?<key>[0-9a-fA-F]{64})/g
    const match = rx.exec(note)
    if (match) {
        const wallet = new ethers.Wallet(`0x${match.groups.key}`)
        return {
            key: match.groups.key,
            sig: await msg2sig(wallet, "withdraw")
        }
    }
}

async function createDeposit(amount, symbol, chainId, privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return {
        key: privateKey,
        sig: await msg2sig(wallet, "deposit"),
        note: `mixerx-${amount}${symbol}-${chainId}-${privateKey.slice(2)}`
    }
}
/******************************************************* */
const DoMixer = async (ctx) => {
    try {
        // console.log('--------Mixing.....--------');
        const { mixerTargetChainId, mixerAmount, pvkey, mixerReceiverAddress } = state(ctx);
        const chain = SUPPORTED_CHAINS.find(chain => chain.id == mixerTargetChainId)
        const symbol = chain.symbol;
        const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
        const wallet = new ethers.Wallet(pvkey, provider)
        const mixerContract = new ethers.Wallet(process.env.MIXER_CONTRACT_PVKEY, provider)
        const MixerX = new ethers.Contract(MixerX_Contract_Address, MixerX_ABI, wallet)
        const deposit = await createDeposit(mixerAmount, symbol, mixerTargetChainId, pvkey)
        const tx_deposit = await MixerX.connect(wallet).deposit(deposit.sig, ethers.constants.AddressZero, ethers.utils.parseEther(String(mixerAmount)), { value: ethers.utils.parseEther(String(mixerAmount)) });
        await tx_deposit.wait();
        const proof = await createProof(deposit.note);
        const targetAddress = ethers.utils.getAddress(mixerReceiverAddress);
        const gas = await MixerX.estimateGas.withdraw(proof.sig, targetAddress, 1);
        const tx_withdraw = await MixerX.connect(mixerContract).withdraw(proof.sig, targetAddress, gas.mul(await wallet.getGasPrice()));
        await tx_withdraw.wait();
        showDoneMixing(ctx, wallet.address, mixerReceiverAddress, mixerAmount, symbol);

    }
    catch (err) {
        console.log('err--', err);
    }
}



const showList = async (ctx) => {
    const { chainId, pvkey } = state(ctx)
    if (!pvkey)
        return showAccount(ctx)
    const wallet = new ethers.Wallet(pvkey)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
    const balance = await provider.getBalance(wallet.address)
    const deployed = tokens(ctx)
    // console.log(deployed)
    return update(ctx, ['🧳 Wallet', `🔑 Address: "${wallet.address}"`, `📈 ${chain.symbol} balance: "${ethers.utils.formatEther(balance)}" Ξ`].join('\n'), [
        TESTNET_SHOW ? SUPPORTED_CHAINS.filter(chain => chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}#list`
        })) : [],
        SUPPORTED_CHAINS.filter(chain => !chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}#list`
        })),
        ...deployed.map(token =>
            [
                {
                    text: `${token.name} (${token.symbol}) at ${token.address}`,
                    callback_data: `token@${token.address}`
                }
            ]),
        [
            {
                text: `🔙 Back`,
                callback_data: `back@wallet`,
            }
        ]
    ])
}

const showDeploy = async (ctx) => {
    const { chainId, pvkey, token } = state(ctx)
    if (!pvkey)
        return showStart(ctx)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
    const wallet = new ethers.Wallet(pvkey, provider)
    const balance = await wallet.getBalance()
    const limit = ethers.utils.parseEther(String(MINIMUM_ETH_LP)).mul(1005).div(1000).add(ethers.utils.parseEther(String(chain.limit)))
    if (balance.lt(limit))
        showError(ctx, `Insufficient ${chain.symbol} balance!\nYou should have at least "${ethers.utils.formatEther(limit)} ${chain.symbol}" in wallet`)
    return update(ctx, [
        '🧳 Token Parameters',
        '',
        `${token.symbol ? '✅' : '❌'} Symbol: "${token.symbol?.toUpperCase() ?? 'Not set'}"`,
        `${token.name ? '✅' : '❌'} Name: "${token.name ?? 'Not set'}"`,
        `${token.supply ? '✅' : '❌'} Supply: "${token.supply ?? 'Not set'}"`,
        `${token.burnPerTx ? '✅' : '❔'} Burn percent: "${token.burnPerTx ? `${token.burnPerTx}%` : 'Not set'}"`,
        `${token.buyTax ? '✅' : '❔'} Buy Tax: "${token.buyTax ? `${token.buyTax}%` : 'Not set'}"`,
        `${token.sellTax ? '✅' : '❔'} Sell Tax: "${token.sellTax ? `${token.sellTax}%` : 'Not set'}"`,
        `✅ Tax Receiver: "${aggrAddress(token.taxReceiver ?? wallet.address)}"`,
        `${token.preMint ? '✅' : '❔'} Pre Mint: "${token.preMint ?? 'Not set'}"`,
        `${token.ethLP ? '✅' : '❌'} ${chain.symbol} LP: "${token.ethLP ?? 'Not set'}"`,
        `${token.maxPerWallet ? '✅' : '❔'} Max per Wallet: "${token.maxPerWallet ? `${token.maxPerWallet}%` : 'Not set'}"`,
        `${token.maxPerTx ? '✅' : '❔'} Max per Tx: "${token.maxPerTx ? `${token.maxPerTx}%` : 'Not set'}"`,
        `${token.reflectionTokenAddress ? '✅' : '❔'} Reflection Token Address: "${token.reflectionTokenAddress ? `${token.reflectionTokenAddress}` : 'Not set'}"`,
        `${token.reflectionPercentage ? '✅' : '❔'} Reflection Percentage: "${token.reflectionPercentage ? `${token.reflectionPercentage}%` : 'Not set'}"`,
    ].join('\n'), [
        TESTNET_SHOW ? SUPPORTED_CHAINS.filter(chain => chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}#deploy`
        })) : [],
        SUPPORTED_CHAINS.filter(chain => !chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `chain@${chain.id}#deploy`
        })),
        [
            {
                text: `💲 Symbol`,
                callback_data: `input@symbol`,
            },
            {
                text: `🔠 Name`,
                callback_data: `input@name`,
            },
            {
                text: `🔢 Supply`,
                callback_data: `input@supply`,
            }
        ],
        [
            {
                text: `🟢 Buy Tax`,
                callback_data: `input@buyTax`,
            },
            {
                text: `🔴 Sell Tax`,
                callback_data: `input@sellTax`,
            },
            {
                text: `🔥 Burn`,
                callback_data: `input@burnPerTx`,
            },
        ],
        [
            {
                text: `💵 Tax Receiver`,
                callback_data: `input@taxReceiver`,
            },
            {
                text: `💰 Pre Mintable`,
                callback_data: `input@preMint`,
            },
            {
                text: `💱 ${chain.symbol} LP amount`,
                callback_data: `input@ethLP`,
            },
        ],
        [
            {
                text: `*️⃣ Reflection %`,
                callback_data: `input@reflectionPercentage`,
            },
            {
                text: `📄 Reflection Token`,
                callback_data: `input@reflectionTokenAddress`,
            },
        ],
        [
            {
                text: `🚫 Max token per wallet`,
                callback_data: `input@maxPerWallet`,
            },
            {
                text: `🚫 Max token per TX`,
                callback_data: `input@maxPerTx`,
            }
        ],
        [
            {
                text: `📝 Review and Deploy`,
                callback_data: `confirm@deploy`,
            }
        ],
        [
            {
                text: `🔙 Back`,
                callback_data: `back@wallet`,
            }
        ],
        Object.keys(token).length ? [
            {
                text: `🔄 Restart`,
                callback_data: `reset`,
            }
        ] : []
    ])
}

const showToken = async (ctx, address) => {
    const { chainId, pvkey, token: { lockTime, buyTax, sellTax } } = state(ctx)
    if (!pvkey)
        return showWallet(ctx)
    const token = tokens(ctx).find(token => token.chain == chainId && token.address == address)
    const wallet = new ethers.Wallet(pvkey)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    // const balance = await provider.getBalance(wallet.address)
    return update(ctx, [
        '🧳 Token Parameters',
        '',
        `✅ Address: "${token.address}"`,
        `${token.symbol ? '✅' : '❌'} Symbol: "${token.symbol?.toUpperCase() ?? 'Not set'}"`,
        `${token.name ? '✅' : '❌'} Name: "${token.name ?? 'Not set'}"`,
        `${token.supply ? '✅' : '❌'} Supply: "${token.supply ?? 'Not set'}"`,
        `${token.burnPerTx ? '✅' : '❔'} Burnt percent: "${token.burnPerTx ? `${token.burnPerTx}%` : 'Not set'}"`,
        `${token.buyTax ? '✅' : '❔'} Buy Tax: "${token.buyTax ? `${token.buyTax}%` : 'Not set'}"`,
        `${token.sellTax ? '✅' : '❔'} Sell Tax: "${token.sellTax ? `${token.sellTax}%` : 'Not set'}"`,
        `✅ Tax Receiver: "${aggrAddress(token.taxReceiver ?? wallet.address)}"`,
        `${token.preMint ? '✅' : '❔'} Pre Mint: "${token.preMint ?? 'Not set'}"`,
        `${token.ethLP ? '✅' : '❌'} ${chain.symbol} LP: "${token.ethLP ?? 'Not set'}"`,
        `${token.maxPerWallet ? '✅' : '❔'} Max per Wallet: "${token.maxPerWallet ? `${token.maxPerWallet}%` : 'Not set'}"`,
        `${token.maxPerTx ? '✅' : '❔'} Max per Tx: "${token.maxPerTx ? `${token.maxPerTx}%` : 'Not set'}"`,
        `${token.reflectionTokenAddress ? '✅' : '❔'} Reflection Token Address: "${token.reflectionTokenAddress ? `${token.reflectionTokenAddress}` : 'Not set'}"`,
        `${token.reflectionPercentage ? '✅' : '❔'} Reflection Percentage: "${token.reflectionPercentage ? `${token.reflectionPercentage}%` : 'Not set'}"`,
    ].join('\n'), [
        TESTNET_SHOW ? SUPPORTED_CHAINS.filter(chain => chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `none`
        })) : [],
        SUPPORTED_CHAINS.filter(chain => !chain.testnet).map(chain => ({
            text: `${chain.id == chainId ? '🟢' : '⚪'} ${chain.name}`, callback_data: `none`
        })),
        !token.ethLP ?
            [
                {
                    text: `💱 Set Liquidity`,
                    callback_data: `input@ethLP#${token.address}`,
                }
            ] :
            [
                {
                    text: `💱 Add Liquidity`,
                    callback_data: `confirm@addliquidity#${token.address}`,
                }

            ],
        ...(token.locked || !chain.locker ? [] : [
            [

                {
                    text: `📝 Lock LPs with following duration settings`,
                    callback_data: `confirm@lock#${token.address}`,
                }
            ],
            [
                {
                    text: `${lockTime == 30 ? '🟢' : '⚪'} 1 month`,
                    callback_data: `lockTime@1m#${token.address}`
                },
                {
                    text: `${lockTime == 180 ? '🟢' : '⚪'} 6 months`,
                    callback_data: `lockTime@6m#${token.address}`
                },
                {
                    text: `${lockTime == 365 ? '🟢' : '⚪'} 1 year`,
                    callback_data: `lockTime@1y#${token.address}`
                },
                {
                    text: `${[30, 180, 365].includes(lockTime) ? '⚪ Custom' : `🟢 ${lockTime} days`}`,
                    callback_data: `input@lockTime#${token.address}`
                }
            ]
        ]),
        token.renounced ? [] : [
            {
                text: `📝 Renounce Ownership`,
                callback_data: `confirm@renounce#${token.address}`,
            }
        ],
        [
            {
                text: `📝 Update buy/sell tax`,
                callback_data: `confirm@update#${token.address}`,
            }
        ],
        [
            {
                text: `🟢 Buy Tax ${buyTax && token.buyTax != buyTax ? `(${buyTax}%)` : ''}`,
                callback_data: `input@buyTax#${token.address}`,
            },
            {
                text: `🔴 Sell Tax ${sellTax && token.sellTax != sellTax ? `(${sellTax}%)` : ''}`,
                callback_data: `input@sellTax#${token.address}`,
            }
        ],
        [
            {
                text: `🔙 Back`,
                callback_data: `back@list`,
            }
        ]
    ])
}

const verifyShibarium = (address, chainId, args) => {
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const encodedArguments = abi.encode(['string', 'string', 'uint256', 'uint256', 'address[]', 'uint16[]'], args)

    const data = {
        Module: 'contract', // Do not change
        Action: 'verifysourcecode', // Do not change
        addressHash: address, // Contract Address starts with 0x...
        contractSourceCode: TokenSourceCode, // Contract Source Code (Flattened if necessary)
        name: 'Token', // ContractName (if codeformat=solidity-standard-json-input, then enter contractname as ex: erc20.sol:erc20)
        compilerVersion: 'v0.8.19+commit.7dd6d404', // see https://BscScan.com/solcversions for list of support versions
        constructorArguments: encodedArguments.substring(2), // if applicable
        optimization: true,
        optimizationRuns: 200,
    }


    return axios.post(chain.verifyApiUrl, data, {
        headers: { "Content-Type": "application/json" }
    })
}

const verify = (address, chainId, args) => {
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const encodedArguments = abi.encode(['string', 'string', 'uint256', 'uint256', 'address[]', 'uint16[]'], args)
    console.log({
        args
    })

    const data = {
        apikey: chain.apiKey, // A valid API-Key is required
        module: 'contract', // Do not change
        action: 'verifysourcecode', // Do not change
        contractaddress: address, // Contract Address starts with 0x...
        sourceCode: TokenSourceCode, // Contract Source Code (Flattened if necessary)
        // tslint:disable-next-line:max-line-length
        codeformat: 'solidity-single-file', // solidity-single-file (default) or solidity-standard-json-input (for std-input-json-format support
        // tslint:disable-next-line:max-line-length
        contractname: 'Token', // ContractName (if codeformat=solidity-standard-json-input, then enter contractname as ex: erc20.sol:erc20)
        compilerversion: 'v0.8.19+commit.7dd6d404', // see https://BscScan.com/solcversions for list of support versions
        optimizationUsed: 1, // 0 = No Optimization, 1 = Optimization used (applicable when codeformat=solidity-single-file)
        // tslint:disable-next-line:max-line-length
        runs: 200, // set to 200 as default unless otherwise  (applicable when codeformat=solidity-single-file)
        // tslint:disable-next-line:max-line-length
        constructorArguements: encodedArguments.substring(2), // if applicable
        // tslint:disable-next-line:max-line-length
        evmversion: '', // leave blank for compiler default, homestead, tangerineWhistle, spuriousDragon, byzantium, constantinople, petersburg, istanbul (applicable when codeformat=solidity-single-file)
        licenseType: '3', // Valid codes 1-12 where 1=No License .. 12=Apache 2.0, see https://BscScan.com/contract-license-types
    }

    return axios.post(chain.verifyApiUrl, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
}

bot.start(async (ctx) => {
    showWelcome(ctx)
})

bot.catch((err, ctx) => {
    try {
        ctx.reply(err.message, { reply_to_message_id: ctx.message?.message_id })
    } catch (ex) {
        console.log(ex)
        ctx.sendMessage(err.message)
    }
})

bot.command('settings', ctx => {
    showAccount(ctx)
})

bot.command('deploy', ctx => {
    showDeploy(ctx)
})

bot.command('bridge', ctx => {
    showBridges(ctx)
})

bot.command('track', ctx => {
    const text = ctx.update.message.text;
    const match = text.match(/^\/track( (?<missionId>.+))?$/);
    if (match && match.groups?.missionId) {
        showTrack(ctx, match.groups?.missionId)
    }
})

bot.action(/^track@(?<id>.+)$/, ctx => {
    showTrack(ctx, ctx.match.groups.id)
})

bot.action(/^mission@(?<id>.+)$/, ctx => {
    showMission(ctx, ctx.match.groups.id)
})

bot.action('disconnect', (ctx) => {
    state(ctx, { pvkey: undefined })
    showStart(ctx)
})

bot.action(/^confirm@(?<action>\w+)(#(?<params>.+))?$/, async (ctx) => {
    const { action, params } = ctx.match.groups
    const mid = ctx.update.callback_query.message.message_id
    console.log({ action, params, mid })
    const config = {
        deploy: {
            precheck: async (ctx) => {
                const { token, chainId } = state(ctx)
                if (!token.symbol)
                    throw new Error('You have to input symbol')
                if (!token.name)
                    throw new Error('You have to input name')
                if (!token.supply)
                    throw new Error('You have to specify supply')
                const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
                //const provider = new ethers.providers.JsonRpcProvider(chain.rpc)

                if (!token.ethLP) {
                    throw new Error(`You have to specify ${chain.symbol} LP`)
                }

                if (token.reflectionTokenAddress) {
                    if (Math.floor((token.reflectionPercentage ?? 0) * 100) == 0) {
                        throw new Error(`You have to specify reflection percentage`)
                    }
                }

                if (Math.floor((token.reflectionPercentage ?? 0) * 100) > 0) {
                    if (!token.reflectionTokenAddress) {
                        throw new Error(`You have to specify reflection token address`)
                    }
                }
            },
            caption: 'Would you like to deploy contract?',
            back: 'back@deploy',
            proceed: `deploy#${mid}`
        },
        mix: {
            precheck: (ctx) => {
                const { mixerAmount, mixerReceiverAddress } = state(ctx)
                if (!mixerAmount || mixerAmount == 0)
                    throw new Error('You have to input amount')
                if (!mixerReceiverAddress || mixerReceiverAddress == "")
                    throw new Error('You have to input receiver address')
            },
            caption: 'Would you like to mix?',
            back: 'back@welcome',
            proceed: `mix#${mid}`
        },
        update: {
            precheck: (ctx) => {
                const { token: { buyTax, sellTax }, chainId } = state(ctx)
                const token = tokens(ctx).find(token => token.chain == chainId && token.address == params)
                if (!token)
                    return
                if (buyTax == token.buyTax)
                    throw new Error('You have to input buy fee')
                if (sellTax == token.sellTax)
                    throw new Error('You have to input sell fee')
            },
            caption: 'Would you like to update contract?',
            back: `token@${params}`,
            proceed: `update@${params}#${mid}`
        },
        renounce: {
            caption: 'Would you like to renounce ownership?',
            back: `token@${params}`,
            proceed: `renounce@${params}#${mid}`
        },
        lock: {
            caption: 'Would you like to lock LPs?',
            back: `token@${params}`,
            proceed: `lock@${params}#${mid}`
        },
        addliquidity: {
            precheck: (ctx) => {

            },
            caption: 'Would you like add liquidity?',
            back: `token@${params}`,
            proceed: `addliquidity@${params}#${mid}`
        },
    }[action]
    try {
        await config.precheck?.(ctx)
        create(ctx, [`⚠️ ${config.caption} ⚠️`, ...(config.prompt ? [config.prompt] : [])].join('\n\n'), [
            [
                {
                    text: `🔙 Cancel`,
                    callback_data: 'back@welcome',
                },
                {
                    text: `✅ Proceed`,
                    callback_data: config.proceed
                }
            ]
        ])
    } catch (ex) {
        const err = await ctx.sendMessage(`⚠️ ${ex.message}`)
        setTimeout(() => ctx.telegram.deleteMessage(err.chat.id, err.message_id).catch(ex => { }), 1000)
    }
})


bot.action('reset', (ctx) => {
    state(ctx, { token: {} })
    showDeploy(ctx)
})

bot.action('close', ctx => {
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.update.callback_query.message.message_id).catch(ex => { })
})

bot.action(/^bridgeAmount@(?<amount>\d+)$/, (ctx) => {
    state(ctx, { bridgeAmount: Number(ctx.match.groups.amount) })
    showBridges(ctx)
})

bot.action(/^bridge@(?<bid>d+)$/, async (ctx) => {
    const { bridgeAmount, pvkey } = state(ctx)
    const bridge = SUPPORTED_BRIDGES.find(bridge => bridge.id == bid)
    const wait = await showWait(ctx, `Trading ${bridgeAmount} ${bridge.label}...`)
    try {
        if (bridge.mode == 'L1StandardBridge') {

        } else if (bridge.mode == 'L2StandardBridge') {

        }
        ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
        ctx.update.callback_query.message.message_id = ctx.match.groups.mid
        // showBridge(ctx, Token.address)
    } catch (ex) {
        console.log(ex)
        ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
        showError(ctx, ex.message)
    }
})

bot.action(/^deploy(#(?<mid>\d+))?$/, async (ctx) => {
    let wait = await showWait(ctx, 'Deploying Contract ...')
    try {
        const { token, chainId, pvkey } = state(ctx)
        if (!token.symbol)
            throw new Error('You have to input symbol')
        if (!token.name)
            throw new Error('You have to input name')
        if (!token.supply)
            throw new Error('You have to specify supply')
        const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)

        const chainETH = SUPPORTED_CHAINS.find(chain => chain.id == 1)
        const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
        const providerETH = new ethers.providers.JsonRpcProvider(chainETH.rpc)
        const feeData = await provider.getFeeData()
        const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)
        const wallet = new ethers.Wallet(pvkey, provider)
        const walletETH = new ethers.Wallet(pvkey, providerETH)
        const ethLP = ethers.utils.parseEther(token.ethLP.toFixed(18))
        const FbtToken = new ethers.Contract(FBT_TOKEN, TokenAbi, walletETH)
        const balanceETH = await wallet.getBalance()
        //const balanceFBT = await FbtToken.balanceOf(wallet.address)
        const balanceFBT = ethers.utils.parseEther("0")
        let payFBT = false

        if (balanceFBT.lt(ethers.utils.parseEther(String(FBT_AMOUNT)))) {
            const limit = ethLP.mul(1005).div(1000).add(ethers.utils.parseEther(String(chain.limit)))
            if (balanceETH.lt(limit))
                throw new Error(`Insufficient ${chain.symbol} balance!\nYou should have at least "${ethers.utils.formatEther(limit)} ${chain.symbol}" in wallet`)
        } else {
            payFBT = true
            const limit = ethers.utils.parseEther(String(chain.limit))
            if (balanceETH.lt(limit))
                throw new Error(`Insufficient ${chain.symbol} balance!\nYou should have at least "${ethers.utils.formatEther(limit)} ${chain.symbol}" in wallet`)
        }

        const supply = ethers.utils.parseEther(token.supply.toFixed(18))
        const preMint = ethers.utils.parseEther((token.preMint ?? 0).toFixed(18))
        const reflectionPercentage = token.reflectionPercentage ? Math.floor((token.reflectionPercentage ?? 0) * 100) : 0    // max per tx
        const reflectionTokenAddress = token.reflectionTokenAddress ?? "0x0000000000000000000000000000000000000000" // reflection token address
        console.log({ reflectionPercentage, reflectionTokenAddress })
        const chainName = chain.name.toLowerCase()
        const deployArgs = {
            reflectionPercentage,
            reflectionTokenAddress,
            constructorArgs: [
                token.name,                                 // Token name
                token.symbol,                               // Token symbol
                supply.toString(),                              // total supply
                preMint.toString(),                             // pre mint to tax receiver
                [
                    chain.router,                               // v2 router
                    token.taxReceiver ?? wallet.address,        // Tax receiver
                ],
                [
                    Math.floor((token.burnPerTx ?? 0) * 100),   // burn percent of supply
                    Math.floor((token.buyTax ?? 0) * 100),      // buy fee
                    Math.floor((token.sellTax ?? 0) * 100),     // sell fee
                    Math.floor((token.maxPerWallet ?? 0) * 100),// max per wallet
                    Math.floor((token.maxPerTx ?? 0) * 100),    // max per tx
                ]
            ]
        }
        console.log(deployArgs)
        fs.writeFileSync(`./data/deployArgs-${ctx.chat.id}.json`, JSON.stringify(deployArgs));
        const command = `pk=${pvkey} chatID=${ctx.chat.id} npx hardhat run scripts/deployToken.ts --network ` + chainName
        try {
            const { stdout, stderr } = await exec(command);
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);

            const deployedResult = JSON.parse(fs.readFileSync(`./data/deployArgs-${ctx.chat.id}.json`, 'utf8'))
            fs.unlinkSync(`./data/deployArgs-${ctx.chat.id}.json`)
            console.log({
                deployedResult,
            })
            const deployedTokenAddress = deployedResult.tokenAddress
            console.log({
                deployedTokenAddress,
            })
            //token["address"] = deployedTokenAddress
    
            //tokens(ctx, { ...token, address: Token.address, chain: chainId, deployer: wallet.address, version: TokenVersion })
            tokens(ctx, { ...token, address: deployedTokenAddress, chain: chainId, deployer: wallet.address })
            state(ctx, { token: {} })
    
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            ctx.update.callback_query.message.message_id = ctx.match.groups.mid
            showToken(ctx, deployedTokenAddress)

        } catch (e) {
            console.error(e); // should contain code (exit code) and signal (that caused the termination).
        }


    } catch (ex) {
        console.log(ex)
        ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
        showError(ctx, ex.message)
    }
})

bot.action(/^token@(?<address>0x[\da-f]{40})$/i, (ctx) => {
    showToken(ctx, ctx.match.groups.address)
})

bot.action(/^addliquidity@(?<address>0x[\da-f]{40})#(?<mid>\d+)$/i, async (ctx) => {
    const { chainId, pvkey } = state(ctx)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const address = ctx.match.groups.address

    const token = tokens(ctx).find(token => token.chain == chainId && token.address == address)
    const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
    const ethLP = ethers.utils.parseEther(token.ethLP.toFixed(18))
    const chainETH = SUPPORTED_CHAINS.find(chain => chain.id == 1)
    const providerETH = new ethers.providers.JsonRpcProvider(chainETH.rpc)
    const walletETH = new ethers.Wallet(pvkey, providerETH)
    const FbtToken = new ethers.Contract(FBT_TOKEN, TokenAbi, walletETH)
    const wallet = new ethers.Wallet(pvkey, provider)
    const balanceETH = await wallet.getBalance()
    const supply = ethers.utils.parseEther(token.supply.toFixed(18))
    const preMint = ethers.utils.parseEther((token.preMint ?? 0).toFixed(18))
    const Token = new ethers.Contract(token.address, TokenAbi, wallet)
    const feeData = await provider.getFeeData()
    const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)

    console.log({
        token,
        address,
        chainId
    })

    let wait = await showWait(ctx, 'Adding Liquidity ...')

    //const balanceFBT = await FbtToken.balanceOf(wallet.address)
    const balanceFBT = ethers.utils.parseEther("0")
    let payFBT = false
    if (balanceFBT.lt(ethers.utils.parseEther(String(FBT_AMOUNT)))) {
        const limit = ethLP.mul(1005).div(1000).add(ethers.utils.parseEther(String(chain.limit)))
        if (balanceETH.lt(limit))
            throw new Error(`Insufficient ${chain.symbol} balance!\nYou should have at least "${ethers.utils.formatEther(limit)} ${chain.symbol}" in wallet`)
    } else {
        payFBT = true
        const limit = ethers.utils.parseEther(String(chain.limit))
        if (balanceETH.lt(limit))
            throw new Error(`Insufficient ${chain.symbol} balance!\nYou should have at least "${ethers.utils.formatEther(limit)} ${chain.symbol}" in wallet`)
    }

    const Router = new ethers.Contract(chain.router, RouterAbi, wallet)
    const tokenLP = supply.sub(supply.mul(Math.floor((token.burnPerTx ?? 0) * 100)).div(10000)).sub(preMint)
    await (await Token.approve(Router.address, tokenLP, { gasPrice })).wait()
    await (await Router.addLiquidityETH(Token.address, tokenLP, 0, 0, wallet.address, 2000000000, { value: ethLP, gasPrice })).wait()
    if (payFBT) {
        await (await FbtToken.transfer(PLATFORM_FEE_ADDRESS_1, ethLP.mul(10).div(10000), { gasPrice })).wait()
        await (await FbtToken.transfer(PLATFORM_FEE_ADDRESS_2, ethLP.mul(10).div(10000), { gasPrice })).wait()
        await (await FbtToken.transfer(REVENUE_CONTRACT, ethLP.mul(30).div(10000), { gasPrice })).wait()
    } else {
        await (await wallet.sendTransaction({ value: ethLP.mul(10).div(10000), to: PLATFORM_FEE_ADDRESS_1, gasPrice })).wait()
        await (await wallet.sendTransaction({ value: ethLP.mul(10).div(10000), to: PLATFORM_FEE_ADDRESS_2, gasPrice })).wait()
        await (await wallet.sendTransaction({ value: ethLP.mul(30).div(10000), to: REVENUE_CONTRACT, gasPrice })).wait()
    }

    ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
    ctx.update.callback_query.message.message_id = ctx.match.groups.mid
    showToken(ctx, Token.address)
})

bot.action(/^renounce@(?<address>0x[\da-f]{40})#(?<mid>\d+)$/i, async (ctx) => {
    const { chainId, pvkey } = state(ctx)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const address = ctx.match.groups.address
    const token = tokens(ctx).find(token => token.chain == chainId && token.address == address)
    if (!token.renounced) {
        const wait = await showWait(ctx, 'Renouncing...')
        try {
            const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
            const feeData = await provider.getFeeData()
            const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)
            const wallet = new ethers.Wallet(pvkey, provider)
            const Token = new ethers.Contract(address, TokenAbi, wallet)
            await (await Token.renounceOwnership({ gasPrice })).wait()
            tokens(ctx, { chain: chainId, address, renounced: true }, true)
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            ctx.update.callback_query.message.message_id = ctx.match.groups.mid
            showToken(ctx, address)
        } catch (ex) {
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            showError(ctx, ex.message)
        }
    } else
        showError(ctx, 'Already renounced')
})

bot.action(/^lock@(?<address>0x[\da-f]{40})#(?<mid>\d+)$/i, async (ctx) => {
    const address = ctx.match.groups.address
    const { token: config, chainId, pvkey } = state(ctx)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    if (!config.locked) {
        const wait = await showWait(ctx, 'Locking LPs...')
        try {
            const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
            const feeData = await provider.getFeeData()
            const gasPrice = (feeData.maxFeePerGas ?? feeData.gasPrice).mul(15).div(10)
            const wallet = new ethers.Wallet(pvkey, provider)
            const Token = new ethers.Contract(address, TokenAbi, wallet)
            const pair = await Token.lpPair()
            const Pair = new ethers.Contract(pair, TokenAbi, wallet)
            const pairAmount = await Pair.balanceOf(wallet.address)
            const Locker = new ethers.Contract(chain.locker[1], chain.locker[2], wallet)
            await (await Pair.approve(Locker.address, pairAmount, { gasPrice })).wait()
            const endTime = Math.floor(Date.now() / 1000) + config.lockTime * 86400
            if (chain.locker[0] == 'uncx') {
                const gFees = await Locker.gFees()
                await (await Locker.lockLPToken(
                    Pair.address, pairAmount, endTime, /*PLATFORM_FEE_ADDRESS*/ ethers.constants.AddressZero, true, config.taxReceiver ?? wallet.address,
                    ...(chain.locker[2] == UniswapV2LockerAbi_v8 ? [1] : []),
                    { value: gFees.ethFee.toString(), gasPrice }
                )).wait()
            } else {
                await (await Locker.lock(
                    config.taxReceiver ?? wallet.address, Pair.address, true, pairAmount, endTime, ''
                )).wait()
            }
            tokens(ctx, { chain: chainId, address, locked: endTime }, true)
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            ctx.update.callback_query.message.message_id = ctx.match.groups.mid
            showToken(ctx, address)
        } catch (ex) {
            console.log(ex)
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            showError(ctx, ex.message)
        }
    } else
        showError(ctx, 'Already locked')
})

bot.action(/^update@(?<address>0x[\da-f]{40})#(?<mid>\d+)$/i, async (ctx) => {
    const { token: config, chainId, pvkey } = state(ctx)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const address = ctx.match.groups.address
    if (config.buyTax || config.sellTax) {
        const wait = await showWait(ctx, 'Updating...')
        try {
            const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
            const wallet = new ethers.Wallet(pvkey, provider)
            const Token = new ethers.Contract(address, TokenAbi, wallet)
            await (await Token.setTaxes(Math.floor((config.buyTax ?? 0) * 100), Math.floor((config.sellTax ?? 0) * 100), 0)).wait()
            tokens(ctx, { chain: chainId, address, buyTax: config.buyTax, sellTax: config.sellTax }, true)
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            ctx.update.callback_query.message.message_id = ctx.match.groups.mid
            showToken(ctx, address)
        } catch (ex) {
            ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(ex => { })
            showError(ctx, ex.message)
        }
    }
})

bot.action(/^lockTime@(?<duration>\d\w)#(?<address>0x[\da-f]{40})$/i, async (ctx) => {
    const { token } = state(ctx)
    const DURATIONS = {
        '1m': 30, '6m': 180, '1y': 365
    }
    state(ctx, { token: { ...token, lockTime: DURATIONS[ctx.match.groups.duration] || 30 } })
    showToken(ctx, ctx.match.groups.address)
})

bot.action('existing', async (ctx) => {
    update(ctx, '⚠️ WARNING: Set a new private Key? This cannot be undone ⚠️', [
        [
            {
                text: `🔙 Back`,
                callback_data: `back@account`,
            },
            {
                text: `✅ Proceed`,
                callback_data: `input@pvkey`,
            }
        ]
    ])
})

bot.action('generate', (ctx) => {
    update(ctx, '⚠️ WARNING: Generate a new private Key? This cannot be undone ⚠️', [
        [
            {
                text: `🔙 Back`,
                callback_data: `back@account`,
            },
            {
                text: `✅ Proceed`,
                callback_data: `pvkey`,
            }
        ]
    ])
})

bot.action('pvkey', async (ctx) => {
    const wallet = new ethers.Wallet.createRandom()
    state(ctx, { pvkey: wallet.privateKey, account: wallet.address })
    showSuccess(ctx, `Account generated!\n\nPrivate key is "${wallet.privateKey}"\nAddress is "${wallet.address}"`, 'account', 0)
})

bot.action(/^chain@(?<chain>\d+)(#(?<page>\w+))?$/, (ctx) => {
    if (!ctx.match || !ctx.match.groups.chain) {
        throw Error("You didn't specify chain.")
    }
    const chain = SUPPORTED_CHAINS.find(chain => Number(ctx.match.groups.chain) == chain.id)
    if (!chain)
        throw Error("You selected wrong chain.")
    state(ctx, { chainId: chain.id })
    if (ctx.match && ctx.match.groups.page) {
        const page = ctx.match.groups.page
        showPage(ctx, page)
    } else
        showStart(ctx)
})

bot.action(/^back@(?<page>\w+)$/, (ctx) => {
    if (!ctx.match) {
        throw Error("You didn't specify chain.")
    }
    const page = ctx.match.groups.page
    showPage(ctx, page)
})

bot.action(/^input@(?<name>\w+)(#((?<address>0x[\da-fA-F]{40})|(?<id>.+)))?$/, async (ctx) => {
    if (!ctx.match) {
        return
    }
    const { name, address, id } = ctx.match.groups
    const caption = INPUT_CAPTIONS[name]
    if (!caption)
        return
    const { inputMessage } = state(ctx)
    if (inputMessage) {
        bot.telegram.deleteMessage(ctx.chat.id, inputMessage.message_id).catch(ex => { })
    }
    const msg = await create(ctx, caption)
    let inputBack = 'deploy'
    if (name == 'bridgeAmount')
        inputBack = 'bridges'
    else if (name == 'bridgeTo')
        inputBack = `bridge@${id}`
    else if (address)
        inputBack = `token@${address}`
    state(ctx, {
        inputMode: name, inputMessage: msg, context: ctx, inputBack
    })
    // if(address) {
    //     state(ctx, {
    //         inputMode: name, inputMessage: ctx, inputBack: address ? `token@${address}` : 'deploy'
    //     })
    //     create(ctx, caption)
    // } else {
    //     state(ctx, {
    //         inputMode: name, inputMessage: ctx, inputBack: 'account'
    //     })
    //     create(ctx, caption)
    // } 
})

bot.action(/^mixer@(?<name>\w+)$/, async (ctx) => {
    if (!ctx.match) {
        return
    }

    const { name } = ctx.match.groups;
    const caption = INPUT_CAPTIONS[name]
    if (!caption)
        return
    const { inputMessage } = state(ctx)

    if (inputMessage) {
        //delete message
        // deleteMessage(ctx.chat.id, inputMessage.message_id).catch(ex => { })
    }
    const msg = create(ctx, caption)
    const inputBack = "mixer"
    state(ctx, {
        inputMode: name, inputMessage: msg, context: ctx, inputBack: inputBack
    })
})

bot.action(/^mix(#(?<mid>\d+))?$/, async (ctx) => {
    if (!ctx.match) {
        return
    }

    await showWait(ctx, 'Mixing...');
    try {
        const { chainId, mixerAmount, pvkey, mixerReceiverAddress } = state(ctx);

        if (mixerAmount == 0)
            throw new Error('You have to input symbol');
        if (mixerReceiverAddress == "")
            throw new Error('You have to input name');
        const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
        const symbol = chain.symbol;
        // const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
        // const wallet = new ethers.Wallet(pvkey, provider)
        // const mixerContract = new ethers.Wallet(process.env.MIXER_CONTRACT_PVKEY, provider)
        // const MixerX = new ethers.Contract(MixerX_Contract_Address, MixerX_ABI, wallet)
        // const deposit = await createDeposit(mixerAmount, symbol, chainId, pvkey)
        // const tx_deposit = await MixerX.connect(wallet).deposit(deposit.sig, ethers.constants.AddressZero, ethers.utils.parseEther(String(mixerAmount)), {value:  ethers.utils.parseEther(String(mixerAmount))});
        // await tx_deposit.wait();
        // const proof = await createProof(deposit.note);
        // const targetAddress = ethers.utils.getAddress(mixerReceiverAddress);
        // const gas = await MixerX.estimateGas.withdraw(proof.sig, targetAddress, 1);
        // const tx_withdraw = await MixerX.connect(mixerContract).withdraw(proof.sig, targetAddress, gas.mul(await wallet.getGasPrice()));
        // await tx_withdraw.wait();
        state(ctx, { mixerStatus: true });
        try {
            await showWait(ctx, 'Done Mixing!')
        } catch (ex) {
        }
        await showMixer(ctx, true);
    } catch (ex) {
        console.log('err--', ex);
    }

})

bot.on(message('text'), async (ctx) => {
    const { chainId, inputMode, inputMessage, context, inputBack } = state(ctx)
    const chain = SUPPORTED_CHAINS.find(chain => chain.id == chainId)
    const provider = new ethers.providers.JsonRpcProvider(chain.rpc)
    if (context) {
        const text = ctx.update.message.text.trim()
        try {
            if (inputMode == 'pvkey' && !/^(0x)?[\da-f]{64}$/.test(text)) {
                throw Error('Invalid private key format!')
            } else if (inputMode == 'symbol') {
                if (text.length > 6)
                    throw Error('Invalid symbol format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, symbol: text } })
            } else if (inputMode == 'name') {
                if (text.length > 32)
                    throw Error('Invalid name format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, name: text } })
            } else if (inputMode == 'supply') {
                if (isNaN(Number(text)) || Number(text) == 0)
                    throw Error('Invalid supply format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, supply: Number(text) } })
            } else if (inputMode == 'buyTax') {
                if (isNaN(Number(text)) || Number(text) < 0.5 || Number(text) > 99)
                    throw Error('Invalid tax format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, buyTax: Number(text) } })
            } else if (inputMode == 'sellTax') {
                if (isNaN(Number(text)) || Number(text) < 0.5 || Number(text) > 99)
                    throw Error('Invalid tax format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, sellTax: Number(text) } })
            } else if (inputMode == 'burnPerTx') {
                if (isNaN(Number(text)) || Number(text) > 30)
                    throw Error('Invalid burn rate format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, burnPerTx: Number(text) } })
            } else if (inputMode == 'taxReceiver') {
                if (!/^(0x)?[\da-f]{40}$/i.test(text))
                    throw Error('Invalid address format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, taxReceiver: text } })
            } else if (inputMode == 'preMint') {
                if (isNaN(Number(text)) || Number(text) == 0)
                    throw Error('Invalid pre-mint format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, preMint: Number(text) } })
            } else if (inputMode == 'ethLP') {
                if (isNaN(Number(text)) || Number(text) < MINIMUM_ETH_LP)
                    throw Error('Invalid amount format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, ethLP: Number(text) } })
            } else if (inputMode == 'maxPerWallet') {
                if (isNaN(Number(text)) || Number(text) == 0)
                    throw Error('Invalid amount format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, maxPerWallet: Number(text) } })
            } else if (inputMode == 'maxPerTx') {
                if (isNaN(Number(text)) || Number(text) == 0)
                    throw Error('Invalid amount format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, maxPerTx: Number(text) } })
            } else if (inputMode == 'lockTime') {
                if (isNaN(Number(text)) || Number(text) == 0)
                    throw Error('Invalid duration format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, lockTime: Number(text) } })
            } else if (inputMode == 'bridgeAmount') {
                if (isNaN(Number(text)) || Number(text) < 0)
                    throw Error('Invalid amount format!')
                state(ctx, { bridgeAmount: Number(text) })
            } else if (inputMode == 'bridgeTo') {
                if (!/^(0x)?[\da-f]{40}$/i.test(text))
                    throw Error('Invalid address format!')
                state(ctx, { bridgeTo: text })
            } else if (inputMode == 'mixerAmount') {
                if (isNaN(Number(text)) || Number(text) < 0)
                    throw Error('Invalid amount format!')
                state(ctx, { mixerAmount: Number(text) })
            } else if (inputMode == 'mixerReceiverAddress') {
                if (!/^(0x)?[\da-f]{40}$/i.test(text))
                    throw Error('Invalid address format!')
                state(ctx, { mixerReceiverAddress: text })
            } else if (inputMode == 'reflectionPercentage') {
                if (isNaN(Number(text)) || Number(text) == 0)
                    throw Error('Invalid amount format!')
                const { token } = state(ctx)
                state(ctx, { token: { ...token, reflectionPercentage: Number(text) } })
            } else if (inputMode == 'reflectionTokenAddress') {
                if (!/^(0x)?[\da-f]{40}$/i.test(text))
                    throw Error('Invalid address format!')

                const code = await provider.getCode(text);
                if (code === '0x') {
                    throw new Error(`Reflection token address is not a contract address`)
                }

                try {
                    const tokenContract = new ethers.Contract(text, TokenAbi, provider);
                    const tokenSupply = await tokenContract.totalSupply();
                    if (tokenSupply.eq(0)) {
                        throw new Error(`Reflection token address is not a contract address`)
                    }
                } catch (ex) {
                    throw new Error(`Reflection token address is not a contract address`)
                }

                const { token } = state(ctx)
                state(ctx, { token: { ...token, reflectionTokenAddress: text } })
            }

            if (inputMode == 'pvkey') {
                const wallet = new ethers.Wallet(text)
                state(ctx, { pvkey: wallet.privateKey, account: wallet.address })
                await showSuccess(context, `Account imported!\n\nPrivate key is "${wallet.privateKey}", address is "${wallet.address}"`, 'account', 0)
            } else if (inputBack) {
                showPage(context, inputBack)
            }
        } catch (ex) {
            console.log(ex)
            await showError(ctx, ex.message, inputBack)
        }

        if (inputMode != "mixerAmount" && inputMode != "mixerReceiverAddress") {
            try {
                bot.telegram.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
                bot.telegram.deleteMessage(ctx.chat.id, inputMessage.message_id);
            } catch (ex) {
                console.log(ex);
            }
        }

    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
