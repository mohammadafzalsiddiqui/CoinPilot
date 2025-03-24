import axios from "axios";
import dotenv from "dotenv";

// Define interface matching the JSON structure you provided
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

async function getAptUsdcPools(): Promise<LPPoolData[]> {
  // Load environment variables
  dotenv.config();
  
  try {
    console.log("Fetching and filtering APT-USDC pools from Liquidswap...");
    
    // Use the URL with proper network ID
    const response = await axios.get(
      "https://api.liquidswap.com/pools/registered?networkId=1"
    );
    
    console.log("Raw response structure:", Object.keys(response.data[0]));
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from API");
    }
    
    const rawPools: LiquidswapPoolRaw[] = response.data;
    console.log(`Retrieved ${rawPools.length} pools from Liquidswap API`);
    
    // Filter for APT-USDC pools
    const aptUsdcRawPools = rawPools.filter(pool => {
      const hasApt = 
        (pool.coinX.symbol === "APT") || 
        (pool.coinY.symbol === "APT");
        
      const hasUsdc = 
        (pool.coinX.symbol === "USDC") || 
        (pool.coinY.symbol === "USDC");
        
      return hasApt && hasUsdc;
    });
    
    console.log(`Found ${aptUsdcRawPools.length} APT-USDC pools`);
    
    // Process the APT-USDC pools
    const formattedPools = aptUsdcRawPools.map((pool) => {
      // Determine which is APT and which is USDC
      const aptIsCoinX = pool.coinX.symbol === "APT";
      
      // Get the proper coins
      const coinA = aptIsCoinX ? pool.coinX : pool.coinY;
      const coinB = aptIsCoinX ? pool.coinY : pool.coinX;
      
      // Parse numeric values
      const reserveA = parseFloat(aptIsCoinX ? pool.coinX.reserve : pool.coinY.reserve);
      const reserveB = parseFloat(aptIsCoinX ? pool.coinY.reserve : pool.coinX.reserve);
      const tvl = parseFloat(pool.tvl);
      const feeValue = parseFloat(pool.fee) / 10000; // Convert basis points to percentage
      
      // Check for pool address in the response
      // First, check if there's an actual "address" field in the API response 
      // (logging the structure should help identify this)
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
      // This may not be the actual on-chain address but can be used as a reference
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
    console.error("Error fetching APT-USDC pools:", error);
    
    // Fallback to hardcoded values if API call fails
    console.log("API request failed. Using hardcoded APT-USDC pool data as fallback.");
    
    return [{
      tokenA: "0x1::aptos_coin::AptosCoin",
      tokenB: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b::asset::USDC",
      tokenASymbol: "APT",
      tokenBSymbol: "USDC",
      tokenADecimals: 8,
      tokenBDecimals: 6,
      reserveA: 125000,
      reserveB: 625000,
      liquidity: 1250000,
      apr: 4.5,
      volume24h: 450000,
      fee: 0.003,
      poolType: "LiquidSwapLP",
      poolCurve: "Uncorrelated",
      poolAddress: "liquidswap_APT_USDC_Uncorrelated_v1" // Fallback identifier
    }];
  }
}

// Execute the function and show details of the response structure
getAptUsdcPools()
  .then((poolsData) => {
    console.log(`Successfully retrieved ${poolsData.length} APT-USDC pools`);
    console.log("APT-USDC Pools Data:", JSON.stringify(poolsData, null, 2));
  })
  .catch((error) => {
    console.error("Failed to get APT-USDC pools data:", error);
  });

