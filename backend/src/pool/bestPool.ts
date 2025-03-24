import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

/**
 * Interface for Joule Finance pool data
 */
interface JoulePoolData {
  assetName: string;
  tokenAddress: string;
  ltv: number | string;
  decimals: number;
  marketSize: number;
  totalBorrowed: number;
  depositApy: number;
  extraDepositApy: number | string;
  totalDepositApy: number; // Combined APY
  borrowApy: number;
  price: number;
}

/**
 * Fetches all available pools from Joule Finance and returns the best one by deposit APY
 */
async function getBestJoulePool(): Promise<JoulePoolData | null> {
  try {
    console.log("Fetching pools from Joule Finance...");
    
    // Fetch directly from the Joule Finance API
    const response = await axios.get("https://price-api.joule.finance/api/market");
    
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid response format from Joule Finance API");
    }
    
    const allPools = response.data.data;
    console.log(`Found ${allPools.length} pools from Joule Finance API`);
    
    // Process all pools and calculate total deposit APY
    const poolsData: JoulePoolData[] = allPools.map((poolDetail: any) => {
      // Extract the token address from the asset type
      const tokenAddress = extractTokenAddress(poolDetail.asset.type);
      
      // Calculate total deposit APY (regular + extra)
      const baseDepositApy = Number(poolDetail.depositApy) || 0;
      const extraDepositApy = poolDetail.extraAPY?.depositAPY ? Number(poolDetail.extraAPY.depositAPY) : 0;
      const totalDepositApy = baseDepositApy + extraDepositApy;
      
      return {
        assetName: poolDetail.asset.assetName,
        tokenAddress: tokenAddress,
        ltv: poolDetail.ltv,
        decimals: poolDetail.asset.decimals,
        marketSize: Number(poolDetail.marketSize) / 10 ** poolDetail.asset.decimals,
        totalBorrowed: Number(poolDetail.totalBorrowed) / 10 ** poolDetail.asset.decimals,
        depositApy: baseDepositApy,
        extraDepositApy: extraDepositApy,
        totalDepositApy: totalDepositApy,
        borrowApy: Number(poolDetail.borrowApy) || 0,
        price: Number(poolDetail.priceInfo.price) || 0
      };
    });
    
    // Find the pool with the highest total deposit APY
    const bestPool = poolsData.reduce((best, current) => {
      return current.totalDepositApy > best.totalDepositApy ? current : best;
    }, poolsData[0]);
    
    console.log(`Best pool found: ${bestPool.assetName} with ${bestPool.totalDepositApy.toFixed(2)}% total deposit APY`);
    
    // Save all pools data to JSON file for reference
    fs.writeFileSync('all_joule_pools.json', JSON.stringify(poolsData, null, 2));
    console.log("All pools data saved to all_joule_pools.json");
    
    // Save best pool data to JSON file
    fs.writeFileSync('best_joule_pool.json', JSON.stringify(bestPool, null, 2));
    console.log("Best pool data saved to best_joule_pool.json");
    
    return bestPool;
    
  } catch (error) {
    console.error("Error fetching Joule pool data:", error);
    return null;
  }
}

/**
 * Helper function to extract token address from the asset type string
 */
function extractTokenAddress(assetType: string): string {
  const match = assetType.match(/0x[a-fA-F0-9]+::[a-zA-Z_]+::[a-zA-Z_]+/);
  if (match) {
    return match[0];
  }
  return assetType;
}

// Execute the function
getBestJoulePool()
  .then((bestPool) => {
    if (bestPool) {
      console.log("Analysis complete!");
      console.log(JSON.stringify(bestPool, null, 2));
    } else {
      console.error("Failed to find the best pool.");
    }
  })
  .catch((error) => {
    console.error("Failed to get Joule pool data:", error);
  });