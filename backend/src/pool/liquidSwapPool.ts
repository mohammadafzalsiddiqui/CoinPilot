import axios from "axios";
import dotenv from "dotenv";

// Define interface matching the JSON structure from Liquidswap API
interface LiquidswapPoolRaw {
  type: string;
  version: number;
  curve: string;
  tvl: string;
  apr: number;
  volume24: number;
  coinX: {
    type: string;
    chainId: number;
    decimals: number;
    logoUrl: string;
    name: string;
    source: string;
    symbol: string;
    symbolWithBridge: string;
    reserve: string;
    reserveUsd: string;
    priceUsd: number;
  };
  coinY: {
    type: string;
    chainId: number;
    decimals: number;
    logoUrl: string;
    name: string;
    source: string;
    symbol: string;
    symbolWithBridge: string;
    reserve: string;
    reserveUsd: string;
    priceUsd: number;
  };
  networkId: number;
  fee: string;
  lpReserve: string;
  lastBlockTimestamp: string;
}

// Define our output interface for processed pool data
interface LPPoolData {
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenADecimals: number;
  tokenBDecimals: number;
  reserveA: number;
  reserveB: number;
  liquidity: number;
  apr: number;
  volume24h: number;
  fee: number;
  poolType: string;
  poolCurve: string;
  poolAddress?: string; // Optional as we might not have it directly
}

async function getAllLiquidswapPools(): Promise<LPPoolData[]> {
  // Load environment variables
  dotenv.config();
  
  try {
    console.log("Fetching all pools from Liquidswap...");
    
    // Use the URL with proper network ID
    const response = await axios.get(
      "https://api.liquidswap.com/pools/registered?networkId=1"
    );
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from API");
    }
    
    const rawPools: LiquidswapPoolRaw[] = response.data;
    console.log(`Retrieved ${rawPools.length} pools from Liquidswap API`);
    
    // Process all pools without filtering
    const formattedPools = rawPools.map((pool) => {
      // Extract coin data
      const coinA = pool.coinX;
      const coinB = pool.coinY;
      
      // Parse numeric values
      const reserveA = parseFloat(pool.coinX.reserve);
      const reserveB = parseFloat(pool.coinY.reserve);
      const tvl = parseFloat(pool.tvl);
      const feeValue = parseFloat(pool.fee) / 10000; // Convert basis points to percentage
      
      // Check for pool address in the response
      let poolAddress: string | undefined = undefined;
      
      // For any non-standard field that might contain the address
      if ((pool as any).address) {
        poolAddress = (pool as any).address;
      } else if ((pool as any).pool_address) {
        poolAddress = (pool as any).pool_address;
      } else if ((pool as any).id) {
        poolAddress = (pool as any).id;
      }
      
      // If we couldn't find the address explicitly, derive a unique identifier from the pool properties
      if (!poolAddress) {
        poolAddress = `liquidswap_${coinA.type}_${coinB.type}_${pool.curve}_${pool.version}`;
      }
      
      return {
        tokenA: coinA.type,
        tokenB: coinB.type,
        tokenASymbol: coinA.symbol,
        tokenBSymbol: coinB.symbol,
        tokenADecimals: coinA.decimals,
        tokenBDecimals: coinB.decimals,
        reserveA: reserveA / Math.pow(10, coinA.decimals), // Human readable
        reserveB: reserveB / Math.pow(10, coinB.decimals), // Human readable
        liquidity: tvl,
        apr: pool.apr,
        volume24h: pool.volume24,
        fee: feeValue,
        poolType: pool.type,
        poolCurve: pool.curve,
        poolAddress: poolAddress
      };
    });
    
    return formattedPools;
    
  } catch (error) {
    console.error("Error fetching Liquidswap pools:", error);
    
    // Fallback to a basic placeholder pool if API call fails
    console.log("API request failed. Using basic placeholder pool data as fallback.");
    
    return [{
      tokenA: "0x1::aptos_coin::AptosCoin",
      tokenB: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
      tokenASymbol: "APT",
      tokenBSymbol: "USDC",
      tokenADecimals: 8,
      tokenBDecimals: 6,
      reserveA: 0,
      reserveB: 0,
      liquidity: 0,
      apr: 0,
      volume24h: 0,
      fee: 0.003,
      poolType: "LiquidSwapLP",
      poolCurve: "Uncorrelated",
      poolAddress: "api_request_failed_fallback" 
    }];
  }
}

// Execute the function and show details of all pools
getAllLiquidswapPools()
  .then((poolsData) => {
    console.log(`Successfully retrieved ${poolsData.length} Liquidswap pools`);
    
    // Generate summary by token pairs
    const pairSummary = poolsData.reduce((acc, pool) => {
      const pairKey = `${pool.tokenASymbol}-${pool.tokenBSymbol}`;
      if (!acc[pairKey]) {
        acc[pairKey] = [];
      }
      acc[pairKey].push(pool);
      return acc;
    }, {} as Record<string, LPPoolData[]>);
    
    console.log("Token Pairs Summary:");
    Object.entries(pairSummary).forEach(([pair, pools]) => {
      console.log(`- ${pair}: ${pools.length} pools (curves: ${pools.map(p => p.poolCurve).join(', ')})`);
    });
    
    // Show full data
    console.log("All Liquidswap Pools Data:", JSON.stringify(poolsData, null, 2));
    
    // Print top 5 pools by liquidity
    const topPoolsByLiquidity = [...poolsData]
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 5);
      
    console.log("Top 5 Pools by Liquidity:");
    topPoolsByLiquidity.forEach((pool, index) => {
      console.log(`${index + 1}. ${pool.tokenASymbol}-${pool.tokenBSymbol} (${pool.poolCurve}): $${pool.liquidity.toLocaleString()}`);
    });
  })
  .catch((error) => {
    console.error("Failed to get Liquidswap pools data:", error);
  });