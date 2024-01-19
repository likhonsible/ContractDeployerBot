
import { ethers } from 'hardhat'
import { formatEther, parseEther } from 'ethers/lib/utils';
const colors = require('colors/safe');
import { sleep, verify } from './util';
import { Contract } from 'ethers';
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config()

async function main() {
    const [deployer] = await ethers.getSigners();
    /*
    if (deployer === undefined) throw new Error("Deployer is undefined.");
    console.log(colors.cyan("Deployer Address: ") + colors.yellow(deployer.address));
    console.log(colors.cyan("Account balance: ") +colors.yellow(formatEther(await deployer.getBalance())));
    console.log();
    */

    const chatID = process.env.chatID
    const pk = process.env.pk
    console.log(colors.cyan("chatID: ") + chatID);
    const deployArgs = require(`../data/deployArgs-${chatID}.json`)
    //console.log(colors.cyan("deployArgs: ") + JSON.stringify(deployArgs, null, 2));
    //return

    const signer = new ethers.Wallet(pk!, ethers.provider)
    console.log(colors.cyan("Signer Address: ") + colors.yellow(signer.address));

    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const reflectionPercentage = deployArgs.reflectionPercentage;
    const reflectionTokenAddress = deployArgs.reflectionTokenAddress;
    const constructorArgs = deployArgs.constructorArgs;


    try {
        // deploy token
        let contractName = "Token";
        const tokenFactory = await ethers.getContractFactory(contractName);
        const tokenDeployed = await tokenFactory.connect(signer).deploy(
            constructorArgs[0], // name
            constructorArgs[1], // symbol
            constructorArgs[2], // supply
            constructorArgs[3], // preMint
            constructorArgs[4], // addresses
            constructorArgs[5], // percents
        );
        await tokenDeployed.deployed();
        //console.log(colors.cyan(contractName), colors.yellow(tokenDeployed.address));
        await tokenDeployed.deployTransaction.wait(4)
        await verify(tokenDeployed.address, contractName, [
            constructorArgs[0], // name
            constructorArgs[1], // symbol
            constructorArgs[2], // supply
            constructorArgs[3], // preMint
            constructorArgs[4], // addresses
            constructorArgs[5], // percents
        ])

        deployArgs["tokenAddress"] = tokenDeployed.address;

        console.log(colors.cyan("deployArgs: ") + JSON.stringify(deployArgs, null, 2));
        // delete ../data/deployArgs-${chatID}.json
        //fs.unlinkSync(`../data/deployArgs-${chatID}.json`);
        fs.writeFileSync(`./data/deployArgs-${chatID}.json`, JSON.stringify(deployArgs));

        // if reflection token address is not zero address, deploy dividend tracker
        if (reflectionTokenAddress !== zeroAddress) {
            // deploy iterable mapping
            contractName = "IterableMapping"
            const iterableMappingFactory = await ethers.getContractFactory(contractName)
            const iterableMappingDeployed = await iterableMappingFactory.connect(signer).deploy()
            await iterableMappingDeployed.deployed()
            //console.log(colors.cyan(contractName), colors.yellow(iterableMappingDeployed.address));
            await iterableMappingDeployed.deployTransaction.wait(4)
            await verify(iterableMappingDeployed.address, contractName)

            // deploy dividend tracker
            contractName = "DividendTracker";
            const dividendTrackerFactory = await ethers.getContractFactory("DividendTracker", {
                libraries: {
                    IterableMapping: iterableMappingDeployed.address
                },
            })
            const dividendTrackerDeployed = await dividendTrackerFactory.connect(signer).deploy(reflectionTokenAddress, parseEther("1"))
            await dividendTrackerDeployed.deployed()
            //console.log(colors.cyan(contractName), colors.yellow(dividendTrackerDeployed.address));
            await dividendTrackerDeployed.deployTransaction.wait(4)
            await verify(dividendTrackerDeployed.address, contractName, [reflectionTokenAddress, parseEther("1")])

            // transfer dividend tracker ownership to token
            await (await dividendTrackerDeployed.connect(signer).transferOwnership(tokenDeployed.address)).wait(4)
            // update dividend tracker in token
            await (await tokenDeployed.connect(signer).updateDividendTracker(dividendTrackerDeployed.address, reflectionPercentage)).wait(4)
        }
    } catch (error) {
        
    }
}

main()
    .then(async () => {
        console.log("done");
    })
    .catch(error => {
        //console.log(colors.red("ERROR :("));
        //console.log(colors.red(error));
        return undefined;
    })


