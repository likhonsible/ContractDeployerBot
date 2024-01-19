import { ethers, network } from 'hardhat'
const util = require('../scripts/util');
const { parseEther } = ethers.utils;
const colors = require('colors');
import { expect } from 'chai'
import { formatEther } from 'ethers/lib/utils';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { updateABI } from '../scripts/util';


//available functions
describe("Token contract", async () => {

    function percentage(percent: any, total: any) {
        return (percent / 100) * total;
    }

    let tokenDeployed: Contract;
    let router: Contract;
    let uniToken: Contract;
    let pairContract: Contract;
    let deployer: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    it("1. Get Signer", async () => {
        const signers = await ethers.getSigners();
        if (signers[0] !== undefined) {
            deployer = signers[0];
            console.log(`${colors.cyan('Deployer Address')}: ${colors.yellow(deployer?.address)}`)
        }
        if (signers[1] !== undefined) {
            bob = signers[1];
            console.log(`${colors.cyan('Bob Address')}: ${colors.yellow(bob?.address)}`)
        }
        if (signers[2] !== undefined) {
            alice = signers[2];
            console.log(`${colors.cyan('Alice Address')}: ${colors.yellow(alice?.address)}`)
        }
    });

    it("2. Deploy Contract", async () => {

        // INSTANCE CONTRACT
        router = await util.connectRouter()
        //const routerFactory = await util.connectFactory()
        //const bnbContract = await util.connectWBNB()
        //const busdContract = await util.connectBUSD()

        // DEPLOY
        const iterableMappingFactory = await ethers.getContractFactory("IterableMapping")
        const IterableMappingDeployed = await iterableMappingFactory.deploy()
        await IterableMappingDeployed.deployed()
        console.log({
            IterableMappingDeployed: IterableMappingDeployed.address
        })
        await updateABI("IterableMapping");

        const uniAddress = "0x0000000000000000000000000000000000000000"
        //const uniAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
        const dividendTrackerFactory = await ethers.getContractFactory("DividendTracker", {
            libraries: {
                IterableMapping: IterableMappingDeployed.address
            },
        })
        const dividendTrackerDeployed = await dividendTrackerFactory.deploy(uniAddress, parseEther("1"))
        await dividendTrackerDeployed.deployed()
        console.log({
            dividendTrackerDeployed: dividendTrackerDeployed.address
        })
        await updateABI("DividendTracker");


        const tokenName = "Token";
        const tokenFactory = await ethers.getContractFactory(tokenName);
        uniToken = await ethers.getContractAt("MOCK", uniAddress)
        tokenDeployed = await tokenFactory.deploy(
            "TKN",
            "Token",
            ethers.utils.parseEther("1000000000"),
            ethers.utils.parseEther("0"),
            ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", deployer.address],
            [0, 0, 0, 0, 0]
        );
        await tokenDeployed.deployed();
        await dividendTrackerDeployed.transferOwnership(tokenDeployed.address)
        await tokenDeployed.updateDividendTracker(dividendTrackerDeployed.address, 500)

        console.log(
            colors.cyan("Token Address: ") + colors.yellow(tokenDeployed.address)
        );
        await updateABI(tokenName);
    });

    it("3. Add Liquidity", async () => {
        await tokenDeployed.approve(util.chains.eth.router, ethers.constants.MaxUint256, { from: deployer?.address })
        const ethAmount = parseEther("100");
        const tokenAmount = parseEther("100000000");
        const tx = await router.connect(deployer).addLiquidityETH(
            tokenDeployed.address,
            tokenAmount,
            tokenAmount,
            ethAmount,
            deployer?.address,
            2648069985, // Saturday, 29 November 2053 22:59:45
            {
                value: ethAmount
            }
        )
        console.log(`${colors.cyan('TX')}: ${colors.yellow(tx.hash)}`)
        console.log()
    });

    it("4. Get Pair Contract", async () => {
        const routerFactory = await util.connectFactory();
        const pairAddress = await routerFactory.getPair(util.chains.eth.wChainCoin, tokenDeployed.address)
        pairContract = await util.connectPair(pairAddress);
        console.log(`${colors.cyan('LP Address')}: ${colors.yellow(pairContract?.address)}`)
        console.log(`${colors.cyan('LP Balance')}: ${colors.yellow(formatEther(await pairContract.balanceOf(deployer?.address)))}`)
        expect(1).to.be.eq(1);
        console.log()
    })


    it("5. Transfer From Owner To Bob ", async () => {
        await tokenDeployed.transfer(bob.address, parseEther("500000"))
        expect(await tokenDeployed.balanceOf(bob?.address)).to.be.eq(parseEther("500000"));
        console.log()
    });



    it("6. Transfer From Bob To Alice ", async () => {
        await tokenDeployed.connect(bob).transfer(alice?.address, parseEther("100"))
        expect(await tokenDeployed.balanceOf(alice?.address)).to.be.eq(parseEther("100"));
        console.log()
    });



    it("7. Buy Bob", async () => {
        console.log()
        //--- BUY
        console.log(`${colors.cyan('Contract token Balance Before Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        await util.swapExactETHForTokens(tokenDeployed.address, router, bob, parseEther("1"));
        console.log(`${colors.cyan('Bob token Balance After Swap')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(bob?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });

    it("6. Transfer From deployer To contract ", async () => {
        await tokenDeployed.connect(deployer).transfer(tokenDeployed?.address, parseEther("10000"))
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()
    });

    it("8. Sell Bob", async () => {
        //--- SELL
        await tokenDeployed.connect(bob).approve(router.address, await tokenDeployed.balanceOf(bob?.address))
        await util.swapExactTokensForTokensSupportingFeeOnTransferTokens(tokenDeployed.address, router, bob, (await tokenDeployed.balanceOf(bob?.address)).div(2)); // 100 tokens
        console.log(`${colors.cyan('Bob token Balance')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(bob?.address)))}`)
        console.log(`${colors.cyan('Contract token Balance After')}: ${colors.yellow(formatEther(await tokenDeployed.balanceOf(tokenDeployed.address)))}`)
        console.log()

        const bobUniBalance = await uniToken.balanceOf(bob?.address)
        console.log(`${colors.cyan('Bob Uni Balance')}: ${colors.yellow(formatEther(bobUniBalance))}`)
    });




    /*
    it("9. Remove liquidity", async () => {

        const chainId = (await ethers.provider.getNetwork()).chainId;
        const nonce = await pairContract.nonces(deployer?.address)
        //const amount = await pairContract.totalSupply()
        const amount = await pairContract.balanceOf(deployer?.address)
        const routerAddress = await router.address;
        const deadline = 2648069985; // Saturday, 29 November 2053 22:59:45

        const EIP712Domain = [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
        ]
        const domain = {
            name: 'Uniswap V2',
            version: '1',
            chainId: chainId,
            verifyingContract: pairContract.address
        }
        const Permit = [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
        ]
        const message = {
            owner: deployer?.address,
            spender: routerAddress,
            value: amount.div(2).toHexString(),
            nonce: nonce.toHexString(),
            deadline: deadline
        }
        const data = JSON.stringify({
            types: {
                EIP712Domain,
                Permit
            },
            domain,
            primaryType: 'Permit',
            message
        })

        const signature = await network.provider.send('eth_signTypedData_v4', [deployer.address, data]);
        const { v, r, s } = ethers.utils.splitSignature(signature);
        console.log(v, r, s)

        const trans = await router
            .removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
                tokenDeployed.address,
                amount.div(2),
                0,
                0,
                deployer?.address,
                deadline,
                false,
                v,
                r,
                s
            )
        console.log({
            tx: trans.hash
        })

        const routerFactory = await util.connectFactory();
        const pairAddress = await routerFactory.getPair(util.chains.eth.wChainCoin, tokenDeployed.address)
        pairContract = await util.connectPair(pairAddress);
        console.log(`${colors.cyan('LP Address')}: ${colors.yellow(pairContract?.address)}`)
        console.log(`${colors.cyan('LP Balance')}: ${colors.yellow(formatEther(await pairContract.balanceOf(deployer?.address)))}`)
        expect(1).to.be.eq(1);
        console.log()

    });

    */


});

