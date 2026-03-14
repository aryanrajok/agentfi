import { defineConfig } from "hardhat/config";
import "dotenv/config";

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY.startsWith("0x") ? process.env.DEPLOYER_PRIVATE_KEY : `0x${process.env.DEPLOYER_PRIVATE_KEY}`]
  : [];

export default defineConfig({
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    bscTestnet: {
      type: "http",
      url: process.env.VITE_BNB_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: DEPLOYER_KEY,
    },
    bscMainnet: {
      type: "http",
      url: process.env.VITE_BNB_MAINNET_RPC || "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: DEPLOYER_KEY,
    },
  },
});
