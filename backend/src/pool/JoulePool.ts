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
  ltv: number | string;
  decimals: number;
  marketSize: number;
  totalBorrowed: number;
  depositApy: number;
  extraDepositApy: number | string;
  borrowApy: number;
  price: number;
}

/**
 * Fetches all available pools from Joule Finance
 */
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
    // Fetch all available pools directly from the Joule Finance API
    const allPoolDetailsResponse = await fetch("https://price-api.joule.finance/api/market");
    
    if (!allPoolDetailsResponse.ok) {
      throw new Error(`API request failed with status: ${allPoolDetailsResponse.status}`);
    }
    
    const allPoolDetails = await allPoolDetailsResponse.json();
    
    if (!allPoolDetails || !allPoolDetails.data || !Array.isArray(allPoolDetails.data)) {
      throw new Error("Invalid response format from API");
    }
    
    console.log(`Found ${allPoolDetails.data.length} pools from Joule Finance API`);
    
    // Process all available pools from the API
    const poolsData = allPoolDetails.data.map((poolDetail: any) => {
      // Extract the token address from the asset type
      // The format is typically something like "0x1::aptos_coin::AptosCoin"
      const tokenAddress = extractTokenAddress(poolDetail.asset.type);
      
      return {
        assetName: poolDetail.asset.assetName,
        tokenAddress: tokenAddress,
        ltv: poolDetail.ltv,
        decimals: poolDetail.asset.decimals,
        marketSize: Number(poolDetail.marketSize) / poolDetail.asset.decimals,
        totalBorrowed: Number(poolDetail.totalBorrowed) / poolDetail.asset.decimals,
        depositApy: poolDetail.depositApy,
        extraDepositApy: poolDetail.extraAPY?.depositAPY ?? "0",
        borrowApy: poolDetail.borrowApy,
        price: poolDetail.priceInfo.price,
      };
    });
    
    return poolsData;
    
  } catch (error) {
    console.error("Error fetching pool data:", error);
    throw error;
  }
}

/**
 * Helper function to extract token address from the asset type string
 */
function extractTokenAddress(assetType: string): string {
  // The asset type might contain additional information
  // We need to extract just the token address part
  
  // Match patterns like "0x1::aptos_coin::AptosCoin" 
  const match = assetType.match(/0x[a-fA-F0-9]+::[a-zA-Z_]+::[a-zA-Z_]+/);
  if (match) {
    return match[0];
  }
  
  // If we can't extract it, return the original string
  return assetType;
}

// Execute the function
getAllPoolData()
  .then((poolsData) => {
    console.log("All Pools Data:", JSON.stringify(poolsData, null, 2));
    console.log(`Total pools found: ${poolsData.length}`);
  })
  .catch((error) => {
    console.error("Failed to get pool data:", error);
  });