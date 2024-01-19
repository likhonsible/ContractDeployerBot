import { BigNumber, Contract, Wallet } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { randomBytes } from 'crypto'
import fs from "fs";
import { artifacts, network } from "hardhat";
import { ExecException } from 'child_process'
const { ethers, upgrades } = require('hardhat')
const { parseEther, formatEther } = ethers.utils
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')
import hre from 'hardhat'

const provider = ethers.provider
import colors from "colors";

let default_chain: string = process.env.CHAIN ?? 'eth';

export const chains: Record<string, Record<string, any>> = {
    avalanche: {
        dex: 'Pangolin',
        router: '0x2D99ABD9008Dc933ff5c0CD271B88309593aB921',
        factory: '0xE4A575550C2b460d2307b82dCd7aFe84AD1484dd',
        wChainCoin: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
        methods: {
            addLiquidity: 'addLiquidityAVAX',
        }
    },
    bsc: {
        dex: 'Pancake',
        router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
        factory: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
        wChainCoin: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
        BUSD: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
        whaleBUSD: "0x352a7a5277ec7619500b06fa051974621c1acd12",
        methods: {
            addLiquidity: 'addLiquidity',
            addLiquidityETH: 'addLiquidityETH',
        }
    },
    eth: {
        dex: 'UniswapV2',
        router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        wChainCoin: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        methods: {
            addLiquidity: 'addLiquidity',
            addLiquidityETH: 'addLiquidityETH',
        }
    }
}

export function getRouterName(dex: string) {
    return `${dex}Router`;
}

export function getPairName(dex: string) {
    return `${dex}Pair`;
}

export function getFactoryName(dex: string) {
    return `${dex}Factory`;
}

export async function getProxyImplementation(proxyAddress: string): Promise<string> {
    return await getImplementationAddress(provider, proxyAddress)
}

export async function verifyWithotDeploy(
    contractName: string,
    contractAddress: string,
    args: any = []
) {
    const tokenImplementationAddress = await getImplementationAddress(
        ethers.provider,
        contractAddress
    )

    await updateABI(contractName)

    console.log('\nVerifing... ' + tokenImplementationAddress + "\n")
    await verify(tokenImplementationAddress, args)
}



export async function connectRouter(): Promise<Contract> {
    return await ethers.getContractAt(
        getRouterName(chains[default_chain]?.dex),
        chains[default_chain]?.router
    )
}

export async function connectBUSD(): Promise<Contract> {
    //wtf is this not working -> Forgot to await on test bruh
    return await ethers.getContractAt(
        'BEP20Token',
        "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7")
}

export async function connectWBTC_ETH(): Promise<Contract> {
    return await ethers.getContractAt('WBTC', chains?.eth?.WBTC)
}

export async function connectUSDT_ETH(): Promise<Contract> {
    return await ethers.getContractAt('TetherToken', chains?.eth?.USDT)
}

export async function connectWBNB(): Promise<Contract> {
    return await ethers.getContractAt('WBNB', chains?.bsc?.wChainCoin)
}

export async function connectWAVAX(): Promise<Contract> {
    return await ethers.getContractAt('WAVAX', chains?.avalanche?.wChainCoin)
}

export async function connectPair(pairAddress: string): Promise<Contract> {
    return await ethers.getContractAt(getPairName(chains[default_chain]?.dex), pairAddress)
}

export async function connectFactory(): Promise<Contract> {
    return await ethers.getContractAt(
        getFactoryName(chains[default_chain]?.dex),
        chains[default_chain]?.factory
    )
}

export async function deployLFG(): Promise<Contract> {
    const LFGFactory = await ethers.getContractFactory('LIFEGAMESV2')
    const TokenDeployed = await upgrades.deployProxy(LFGFactory, {
        initializer: 'initialize'
    })
    const r = await TokenDeployed.deployed()
    console.log(r)
    return r
}

export async function connectToken(): Promise<Contract> {
    return await ethers.getContractAt(
        'TokenV1',
        '0xD1586f4624775920121A0D58A785F46e9f91500d'
    )
}

export const updateABI = async (contractName: string) => {
    const abiDir = `${__dirname}/../abi`;
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir);
    }
    const Artifact = artifacts.readArtifactSync(contractName);
    fs.writeFileSync(
        `${abiDir}/${contractName}.json`,
        JSON.stringify(Artifact.abi, null, 2)
    )
}

export const deployProxyInitialize = async (contractName: string, autoVerify: boolean = true, args: any = []): Promise<Contract> => {
    /*
    const Token = await ethers.getContractFactory("TokenV1");
    const TokenDeployed = await upgrades.deployProxy(Token, {
     initializer: "initialize",
    });
    await TokenDeployed.deployed();
    await getImplementationAddress(ethers.provider,TokenDeployed.address)
    console.log("Contract deployed to:", TokenDeployed.address);
    */


    const factory = await ethers.getContractFactory(contractName)
    const contract = args.length > 1 ? await upgrades.deployProxy(factory, [args], {
        initializer: "initialize",
    }) : await upgrades.deployProxy(factory, args, {
        initializer: "initialize",
    })
    const token = await contract.deployed()
    const implAddress = await getImplementationAddress(ethers.provider, token.address);
    await updateABI(contractName)
    if (autoVerify) {
        console.log('\nVerifing')
        await verify(implAddress, args)
    }
    console.log(contractName, token.address, implAddress)
    return token
}

export const verify = async (contractAddress: string, contractName: string, args: any[] = []) => {
    // @ts-ignore
    if (network == 'localhost' || network == 'hardhat') return
    try {
        await updateABI(contractName)
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (ex) {
        console.log(ex);

    }
}

export const deployProxy = async (contractName: string, args: any[] = []): Promise<Contract> => {
    const factory = await ethers.getContractFactory(contractName)
    const contract = await upgrades.deployProxy(factory, args)
    const token = await contract.deployed()
    const implAddress = await getImplementationAddress(ethers.provider, token.address);
    await updateABI(contractName)
    await verify(implAddress, contractName, args)
    console.log(contractName, token.address, implAddress)
    return token
}

const deployProxyV2 = async (
    contractName: string,
    autoVerify = true,
    args: any = []
): Promise<Contract> => {
    let token: Contract;
    const factory = await ethers.getContractFactory(contractName)

    if (args) {
        const contract =
            args.length >= 1
                ? await upgrades.deployProxy(factory, args)
                : await upgrades.deployProxy(factory)
        token = await contract.deployed()
    } else {
        const contract = await upgrades.deployProxy(factory)
        token = await contract.deployed()
    }

    const implAddress = await getImplementationAddress(
        ethers.provider,
        token.address
    )

    console.log("");
    console.log(colors.green("Deploy Successfully!"));
    console.log(
        `${colors.cyan(contractName + " Proxy Address: ")} ${colors.yellow(
            token.address
        )}`
    );
    console.log(
        `${colors.cyan(contractName + " Implementation Address: ")} ${colors.yellow(
            implAddress
        )}`
    );
    console.log("");


    await updateABI(contractName)

    if (autoVerify) {
        console.log('\nVerifing')
        await verify(implAddress, contractName, args)
    }
    return token
}

export async function fundBUSD(busdContract: Contract, router: Contract, user: SignerWithAddress, amount: any) {
    const whale = chains?.bsc?.whaleBUSD
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [whale],
    });

    const signer = await ethers.getSigner(whale)
    const busdBalance = await busdContract.balanceOf(whale)
    console.log("whale dai balance", formatEther(busdBalance))

    await busdContract.connect(signer).transfer(user.address, parseEther(amount))
    await busdContract.connect(user).approve(router.address, ethers.constants.MaxUint256);
    await busdContract.connect(user).approve(busdContract.address, ethers.constants.MaxUint256);
    console.log("fund with BUSD:", formatEther(await busdContract.balanceOf(user.address)));
    console.log();
}

export async function swapExactETHForTokens(tokenAddress: string, router: Contract, user: SignerWithAddress, _value: any) {
    await router.connect(user).swapExactETHForTokens(
        0, //amountOutMin
        [chains[default_chain]?.wChainCoin, tokenAddress], //path
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
        { value: _value }
    )
}

// todo test

export async function swapExactTokensForTokensSupportingFeeOnTransferTokensV2(tokenAddress: string, toTokenAddress: string, router: Contract, user: SignerWithAddress, _value: BigNumber) {
    const tx = await router.connect(user).swapExactTokensForTokensSupportingFeeOnTransferTokens(
        _value,
        BigNumber.from(0),
        [tokenAddress, chains[default_chain]?.wChainCoin, toTokenAddress], //path
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
    )
    //console.log(`${colors.cyan('Tx ')}: ${colors.yellow(tx)}`)
}

export async function getAmountsOut(fromTokenAddress: string, toTokenAddress: string, router: Contract, _value: BigNumber) {
    let amountOutMin = await router.getAmountsOut(
        _value,
        [fromTokenAddress, toTokenAddress],
    );
    //console.log(`${colors.cyan('Amounts Out ')}: ${colors.yellow(amountOutMin)}`)
    return amountOutMin[1];
}

export async function swapExactTokensForTokensSupportingFeeOnTransferTokens(tokenAddress: string, router: Contract, user: SignerWithAddress, _value: BigNumber) {
    const tx = await router.connect(user).swapExactTokensForTokensSupportingFeeOnTransferTokens(
        _value,
        BigNumber.from(0),
        [tokenAddress, chains[default_chain]?.wChainCoin], //path
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
    )
    //console.log(`${colors.cyan('Tx ')}: ${colors.yellow(tx)}`)
}

// todo test
export async function swapExactTokensForETH(tokenAddress: string, router: Contract, user: SignerWithAddress, _value: BigNumber) {
    let slippage = 15;
    let amountOutMin = await router.connect(user).getAmountsOut(
        _value,
        [tokenAddress, chains[default_chain]?.wChainCoin],
    );
    let amountOutMinLessSlippage = Math.trunc(amountOutMin[1] - ((amountOutMin[1] * slippage) / 100))
    console.log({
        _value,
        slippage,
        amountOutMin,
        amountOutMinLessSlippage
    })

    await router.connect(user).swapExactTokensForETH(
        _value,
        amountOutMinLessSlippage,
        [tokenAddress, chains[default_chain]?.wChainCoin], //path
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
    )
}

export async function approveAndAddBusdLiquidity(token: Contract, router: Contract, user: SignerWithAddress, aAmount: any, bAmount: any) {
    await token.approve(chains?.bsc?.router, bAmount)
    const tx = await router.connect(user).addLiquidity(
        chains?.bsc?.BUSD,      // A
        token.address,            // B
        aAmount,                  // amountADesired
        bAmount,                  // amountBDesired
        0,                        // mins to revert
        0,
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
    )
    console.log(`${colors.cyan('Tx ')}: ${colors.yellow(tx)}`)
}

export async function approveAndAddBNBLiquidity(token: Contract, router: Contract, user: SignerWithAddress, aAmount: any, bAmount: any) {
    await token.approve(chains?.bsc?.router, bAmount)
    const tx = await router.connect(user).addLiquidity(
        chains?.bsc?.wChainCoin,      // A
        token.address,            // B
        aAmount,                  // amountADesired
        bAmount,                  // amountBDesired
        0,                        // mins to revert
        0,
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
    )
    console.log(`${colors.cyan('Tx ')}: ${colors.yellow(tx)}`)
}


export async function addTempLiquidityLFG(deployer: SignerWithAddress, busdContract: Contract, router: Contract, token: Contract) {
    //await swapApproveBNBtoBUSD(busdContract, router, deployer, parseEther('100'))
    const busdBalance = await busdContract.balanceOf(deployer.address)
    console.log(formatEther(busdBalance))

    await approveAndAddBusdLiquidity(token, router, deployer, busdBalance, parseEther("10"))
}

export async function approveAndAddLiquidity(
    tokenA: string,
    tokenB: string,
    router: Contract,
    user: SignerWithAddress,
    aAmount: BigNumber,
    bAmount: BigNumber
) {
    const tx = await router.connect(user).addLiquidity(
        tokenA, // B
        tokenB, // B
        aAmount, // amountADesired
        aAmount, // amountBDesired
        bAmount, // mins to revert
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
        {
            value: bAmount,
        }
    )
    console.log(`${colors.cyan('Tx ')}: ${colors.yellow(tx)}`)
}

/**
 * BUYS LFG USING PANCAKE ROUTER
 * @param {Contract} token - LFG Token
 * @param {Contract} router - Pancake Router
 * @param {Signer} user - User that is swapping
 * @param {BigNumber} amountBUSD - Amount of BUSD used to buy
 *
 *
 */
export async function buy(
    tokenBUSD: Contract,
    token: Contract,
    router: Contract,
    user: SignerWithAddress,
    amountBUSD: any
) {
    await tokenBUSD.connect(user).approve(router.address, amountBUSD)
    await token
        .connect(user)
        .approve(router.address, ethers.constants.MaxUint256);
    return new Promise(async (resolve, reject) => {
        await router.connect(user).swapExactTokensForTokens(
            amountBUSD, // amountIn
            1, //amountOutMin
            [chains[default_chain]?.BUSD ?? chains[default_chain]?.wChainCoin, token.address], //path
            user.address,
            2648069985 // Saturday, 29 November 2053 22:59:45
        ).then((data: any, err: any) => {
            if (data) {
                resolve(data);
            }
            reject(err);
        })
            .catch((err: any) => {
                reject(err);
            });
    });
}

/**
 * BUYS LFG USING PANCAKE ROUTER
 * @param {Contract} token - LFG Token
 * @param {Contract} router - Pancake Router
 * @param {Signer} user - User that is swapping
 * @param {BigNumber} amountBUSD - Amount of BUSD used to buy
 *
 *
 */
export async function swapExactTokensForAVAXSupportingFeeOnTransferTokens(
    token: Contract,
    router: Contract,
    user: SignerWithAddress,
    amount: BigNumber
) {
    await token.connect(user).approve(router.address, amount)
    await router
        .connect(user)
        .swapExactTokensForAVAXSupportingFeeOnTransferTokens(
            amount, // amountIn
            1, //amountOutMin
            [token.address, chains?.avalanche?.wChainCoin], //path
            user.address,
            2648069985 // Saturday, 29 November 2053 22:59:45
        )
    // APROVE MAX TOKENS
    //await token.connect(user).approve(router.address, ethers.constants.MaxUint256)
}

/*
export async function sellLFG(token: Contract, router: Contract, user: SignerWithAddress, amountLFG: any) {
    await token.connect(user).approve(router.address, amountLFG);
    await router.connect(user).swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountLFG, // amountIn
        1, //amountOutMin
        [token.address, chains?.bsc?.BUSD], //path
        user.address,
        2648069985, // Saturday, 29 November 2053 22:59:45
    )
}
*/

export const percentage = (val_one: number, val_two: number) => {
    return 100 - Math.floor(val_one * 100 / val_two)
}

export async function diff(expected: any, actual: any) {
    return Number((actual / formatEther(expected)) * 100 - 100)
}

export async function diffInverse(expected: any, actual: any) {
    return Number((formatEther(actual) / expected) * 100 - 100)
}

export async function roundDiff(expected: any, actual: any) {
    return Math.round((Math.abs(expected) / ((expected + actual) / 2)) * 100)
    //return (actual / (expected * 100) - 100)
}

export function compareTokenBalance(balanceBefore: BigNumber, balanceAfter: BigNumber) {
    const formatBalanceBefore = formatEther(balanceBefore)
    const formatBalanceAfter = formatEther(balanceAfter)

    if (balanceAfter < balanceBefore) {
        console.log(`${colors.yellow('Token Balance Before')}: ${colors.green(formatBalanceBefore)}`)
        console.log(`${colors.cyan('Token Balance After')}:  ${colors.red(formatBalanceAfter)}`)
    } else if (balanceAfter > balanceBefore) {
        console.log(`${colors.yellow('Token Balance Before')}: ${colors.red(formatBalanceBefore)}`)
        console.log(`${colors.cyan('Token Balance After')}:  ${colors.green(formatBalanceAfter)}`)
    } else {
        console.log(`${colors.yellow('Token Balance Before')}: ${colors.gray(formatBalanceBefore)}`)
        console.log(`${colors.cyan('Token Balance After')}:  ${colors.gray(formatBalanceAfter)}`)
    }
}

export function generateRandomAddresses(n: number): string[] {
    return new Array(n)
        .fill(0)
        .map(() => new Wallet(randomBytes(32).toString('hex')).address)
}

export function generateRandomAmount(max: number): BigNumber {
    return parseEther(randomNumber(1, max).toString())
}

export const randomNumber = (min: number, max: number) => {
    //Use below if final number doesn't need to be whole number
    //return Math.random() * (max - min) + min
    return Math.floor(Math.random() * (max - min) + min)
}

/*
const avalancheFujiTestnet = {
    router: '0x2D99ABD9008Dc933ff5c0CD271B88309593aB921',
    factory: '0xE4A575550C2b460d2307b82dCd7aFe84AD1484dd',
    WAVAX: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
}
*/

// async function approveAndAddLiquidityBNB(user, BNBamount, TokenAmount){
//     await token.approve(util.pancakeTestnet.router, TokenAmount)
//     const tx = await router.connect(user).addLiquidityETH(
//         token.address,
//         TokenAmount,
//         0,
//         0,
//         user.address,
//         2648069985, // Saturday, 29 November 2053 22:59:45
//         {value: BNBamount}
//     )
// }

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export function execShellCommand(cmd: string) {
    const exec = require('child_process').exec
    return new Promise((resolve) => {
        exec(cmd, (error: ExecException, stdout: string, stderr: string) => {
            if (error) {
                console.warn(error)
            }
            resolve(stdout ? stdout : stderr)
        })
    })
}

export const sleep = async (seconds: string) => {
    console.log(`Sleeping for ${seconds} seconds`)
    await execShellCommand("sleep " + seconds);
    console.log("END")
}
export async function forceImport(
    contractAddress: string,
    deployedImpl: any,
    opts: {
        kind?: 'uups' | 'transparent' | 'beacon'
    }
) {
    const contract = await upgrades.forceImport(
        contractAddress,
        deployedImpl,
        opts
    )

    return contract
}

export async function transferEth(from: SignerWithAddress, _to: string, amount: BigNumber) {
    const tx = {
        to: _to,
        value: amount
    };
    await from.sendTransaction(tx);
}

export async function getDeployer(): Promise<SignerWithAddress> {
    const [deployer] = await ethers.getSigners();
    if (deployer === undefined) throw new Error("Deployer is undefined.");
    console.log(
        colors.cyan("Deployer Address: ") + colors.yellow(deployer.address)
    );
    console.log(
        colors.cyan("Account balance: ") +
        colors.yellow(formatEther(await deployer.getBalance()))
    );
    console.log();
    return deployer;
}

export function saveContractAddress(contractName: string, contractAddress: string) {
    let contracts = JSON.parse(fs.readFileSync("deployedContracts.json", "utf-8"));
    contracts[contractName] = contractAddress;
    fs.writeFileSync('deployedContracts.json', JSON.stringify(contracts));
}

export const deploy = async (autoVerify = false, contractName: string, ...args: any): Promise<Contract> => {
    const factory = await ethers.getContractFactory(contractName)
    const contract = await factory.deploy(...args)
    await contract.deployed()
    await updateABI(contractName)

    console.log(colors.cyan(contractName + " Address: ") + colors.yellow(contract.address));

    if (autoVerify) {
        await sleep("15");
        await verify(contract.address, contractName, [...args])
        console.log(colors.cyan(contractName + " Address: ") + colors.yellow(contract.address));
    }

    return contract
}

export async function mineBlock(blocks = 1) {
    const provider = network.provider
    for (; blocks > 0; blocks--) await provider.send("evm_mine")
}

export async function increaseTime(seconds: number) {
    const provider = network.provider
    await provider.send("evm_increaseTime", [seconds])
    // await mineBlock()
}

export default module.exports = {
    connectRouter,
    connectPair,
    connectFactory,
    deployProxy,
    getProxyImplementation,
    generateRandomAddresses,
    deployProxyInitialize,
    connectWAVAX: connectWAVAX,
    generateRandomAmount,
    swapExactTokensForAVAXSupportingFeeOnTransferTokens,
    chains,
    swapExactETHForTokens,
    swapExactTokensForETH,
    swapExactTokensForTokensSupportingFeeOnTransferTokens,
    verifyWithotDeploy,
    updateABI,
    deployProxyV2,
    deploy,
    verify,
    sleep,
    connectBUSD,
    forceImport,
    transferEth,
    connectWBTC_ETH,
    connectUSDT_ETH,
    getAmountsOut,
    getDeployer,
    saveContractAddress,
    execShellCommand,
    mineBlock,
    increaseTime
}