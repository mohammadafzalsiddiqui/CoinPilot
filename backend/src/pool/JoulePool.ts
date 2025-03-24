import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner } from "move-agent-kit";
import dotenv from "dotenv";

// Define proper types for pool data
interface PoolData {
  assetName: string;
  tokenAddress: string;
  ltv: number;
  decimals: number;
  marketSize: number;
  totalBorrowed: number;
  depositApy: number;
  extraDepositApy: number;
  borrowApy: number;
  price: number;
}

async function getAllPoolData(): Promise<PoolData[]> {
  // Load environment variables
  dotenv.config();
  
  // Initialize Aptos config
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
  });
  
  // Create Aptos client
  const aptos = new Aptos(aptosConfig);
  
  // Set up account with private key
  if (!process.env.PRIVATE_KEY_APTOS) {
    throw new Error("PRIVATE_KEY_APTOS not found in environment variables");
  }
  
  // Fix: Simplify private key handling
  const privateKey = new Ed25519PrivateKey(process.env.PRIVATE_KEY_APTOS);
  const account = Account.fromPrivateKey({ privateKey });
  
  // Initialize signer and agent runtime
  const signer = new LocalSigner(account, Network.MAINNET);
  const agentRuntime = new AgentRuntime(signer, aptos);
  
  try {
    // Fetch all pool data by getting a list of tokens first
    // This list is based on the tokens available in the Joule protocol
    const tokenAddresses = [
      "0x1::aptos_coin::AptosCoin", // APT
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC", // USDC
      // You can add more token addresses here as needed
    ];
    
    // Fetch pool details for each token
    const poolDetailsPromises = tokenAddresses.map(async (tokenAddress) => {
      try {
        // Note: Ensure that getPoolDetails is implemented in AgentRuntime
        // If it's not, you'll need to implement this method or use the appropriate method from the SDK
        return await agentRuntime.getPoolDetails(tokenAddress);
      } catch (error) {
        console.error(`Error fetching pool details for ${tokenAddress}:`, error);
        return null;
      }
    });
    
    // Wait for all promises to resolve
    const poolsData = (await Promise.all(poolDetailsPromises)).filter(
      (pool): pool is PoolData => pool !== null
    );
    
    return poolsData;
    
  } catch (error) {
    console.error("Error fetching pool data:", error);
    throw error;
  }
}

// Execute the function
getAllPoolData()
  .then((poolsData) => {
    console.log("All Pools Data:", JSON.stringify(poolsData, null, 2));
  })
  .catch((error) => {
    console.error("Failed to get pool data:", error);
  });