import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomiclabs/hardhat-etherscan'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import '@openzeppelin/hardhat-upgrades'
const mnemonic = "27b3203bb66bb470cdd2fc4a141810b854f4a5fb8667b0d018cf78e23e49b565";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      forking: {
        url: `https://rpc.ankr.com/eth/8336fad58473dbbe5677d919d9a4254db1ee223ef8ec5bf4f891360832de8a46`
        // url: `https://rpc2.sepolia.org`,
      },
      // accounts: [`${mnemonic}`],
      initialBaseFeePerGas: 0
    },
    hardhat: {
      // forking: {
      //   url: `https://rpc.ankr.com/eth`,
      // },
      initialBaseFeePerGas: 0
    },
    mainnet: {
      url: `https://rpc.ankr.com/eth`,
      accounts: [`${mnemonic}`],
      chainId: 1
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${mnemonic}`],
      chainId: 3,
      gasPrice: 5000000000,
      gasMultiplier: 2
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${mnemonic}`],
      chainId: 4,
      gasPrice: 5000000000,
      gasMultiplier: 2
    },
    goerli: {
      url: `https://ethereum-goerli.publicnode.com`,
      accounts: [`${mnemonic}`],
      chainId: 5,
      gasMultiplier: 500
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/65a6236f83cd4a618a4c0d01a8c3bc11`,
      accounts: [`${mnemonic}`],
      chainId: 11155111,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${mnemonic}`],
      chainId: 42,
      gasPrice: 20000000000,
      gasMultiplier: 2
    },
    moonbase: {
      url: 'https://rpc.testnet.moonbeam.network',
      accounts: [`${mnemonic}`],
      chainId: 1287,
      gas: 5198000,
      gasMultiplier: 2
    },
    arbitrumOne: {
      url: 'https://arbitrum.llamarpc.com',
      accounts: [`${mnemonic}`],
      chainId: 79377087078960,
      gasMultiplier: 2
    },
    opera: {
      url: 'https://rpcapi.fantom.network',
      accounts: [`${mnemonic}`],
      chainId: 250
    },
    ftmTestnet: {
      url: 'https://rpc.testnet.fantom.network',
      accounts: [`${mnemonic}`],
      chainId: 4002,
      gasMultiplier: 2
    },
    polygon: {
      url: 'https://rpc.ankr.com/polygon',
      accounts: [`${mnemonic}`],
      chainId: 137,
    },
    mumbai: {
      url: 'https://rpc.ankr.com/polygon_mumbai',
      accounts: [`${mnemonic}`],
      chainId: 80001,
      // gasPrice: 5000000000,
      // gasMultiplier: 2
    },
    xdai: {
      url: 'https://rpc.xdaichain.com',
      accounts: [`${mnemonic}`],
      chainId: 100,
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org',
      accounts: [`${mnemonic}`],
      chainId: 56,
    },
    bscTestnet: {
      url: 'https://rpc.ankr.com/bsc_testnet_chapel',
      accounts: [
        `${mnemonic}`,
      ],
      chainId: 97,
      gasMultiplier: 2
    },
    heco: {
      url: 'https://http-mainnet.hecochain.com',
      accounts: [`${mnemonic}`],
      chainId: 128,
    },
    'heco-testnet': {
      url: 'https://http-testnet.hecochain.com',
      accounts: [`${mnemonic}`],
      chainId: 256,
      gasMultiplier: 2
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: [`${mnemonic}`],
      chainId: 43114
    },
    avaxfuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: [`${mnemonic}`],
      chainId: 43113,
      gasMultiplier: 2
    },
    harmony: {
      url: 'https://api.s0.t.hmny.io',
      accounts: [`${mnemonic}`],
      chainId: 1666600000,
    },
    'harmony-testnet': {
      url: 'https://api.s0.b.hmny.io',
      accounts: [`${mnemonic}`],
      chainId: 1666700000,
      gasMultiplier: 2
    },
    pulsechainmainnet: {
      url: "https://rpc.pcbvr.pulsechain.com",
      accounts: [`${mnemonic}`],
      chainId: 0x171
    },
    pulsechaintestnet: {
      url: "https://rpc.v4.testnet.pulsechain.com",
      accounts: [`${mnemonic}`],
      chainId: 0x3AF
    },
    shibarium: {
      url: "https://www.shibrpc.com",
      accounts: [`${mnemonic}`],
      chainId: 0x6D
    },
    puppynet: {
      url: "https://puppynet.shibrpc.com",
      accounts: [`${mnemonic}`],
      chainId: 0x2CF
    },
    baseChain: {
      url: "https://rpc.notadegen.com/base",
      accounts: [`${mnemonic}`],
      chainId: 0x2105
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [`${mnemonic}`],
      chainId: 0x14a33
    }
  },
  etherscan: {

    apiKey: {
      bsc: "V28HJCGUP2XCHSV5IXXG6IK9W14HHXKDCY",
      bscTestnet: "V28HJCGUP2XCHSV5IXXG6IK9W14HHXKDCY",

      mainnet: "HJNU2TCIRZBH4I3RTB98RI1MRJT8KSJCRG",
      sepolia: "HJNU2TCIRZBH4I3RTB98RI1MRJT8KSJCRG",
      goerli: "HJNU2TCIRZBH4I3RTB98RI1MRJT8KSJCRG",

      arbitrumOne: "CK6T49FSCVR7G1TWTBGQ8N4GQXTAVBXVXS",
      arbitrumGoerli : "CK6T49FSCVR7G1TWTBGQ8N4GQXTAVBXVXS",

      baseChain:"625N7GC5238WP837PCH6D9QI6TE1USBPDT",
      baseGoerli:"625N7GC5238WP837PCH6D9QI6TE1USBPDT",
    },
    customChains: [
      {
        network: "baseChain",
        chainId: 8453,
        urls: {
          apiURL: "https://https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      }
    ]
  },
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
            //runs: 200
          }
        }
      },
      {
        version: '0.6.12', // Pan9inch Router
        settings: {
          optimizer: {
            enabled: true
          }
        }
      },
      {
        version: '0.6.6', // Pangolin Router
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      },
      {
        version: '0.8.2' // Pan9inch Pair
      },
      {
        version: '0.5.17' // WAVAX
      },
      {
        version: '0.5.16' // Pan9inch / Pangolin -> Pair / Factory
      },
      {
        version: '0.5.0' // Pan9inch Pair
      },
      {
        version: '0.4.24' // WBTC
      },
      {
        version: '0.4.18' // WBNB
      },
      {
        version: '0.8.0'
      },
      {
        version: '0.8.12'
      }
    ]
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 6000000
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5'
  },
  gasReporter: {
    token: "ETH",
    currency: 'USD',
    gasPrice: 10,
    enabled: true,
    coinmarketcap: '0caa3779-3cb2-4665-a7d3-652823b53908'
  }
};

export default config;
