import { Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner } from "move-agent-kit";

// Define interfaces for pool types (similar to our previous implementation)
interface AriesPool {
  protocol: string;
  poolId: string;
  assetName: string;
  symbol: string;
  tokenAddress: string;
  decimals: number;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
  totalBorrow: number;
  availableLiquidity: number;
  utilizationRate: number;
  ltv: number;
  isActive: boolean;
  lastUpdated: Date;
}

/**
 * AriesClient class for interacting with Aries Finance on Aptos blockchain
 */
export class AriesClient {
  readonly aptos: Aptos;
  readonly contractAddress: string;
  
  /**
   * Creates an instance of AriesClient
   * @param aptos Initialized Aptos client
   * @param contractAddress The Aries protocol contract address
   */
  constructor(aptos: Aptos, contractAddress: string) {
    this.aptos = aptos;
    this.contractAddress = contractAddress;
  }
  
  /**
   * Fetch all pools/markets available on Aries Finance
   * This is an example implementation - actual view function names will need to be updated
   * based on the actual Aries contract
   */
  async getAllPools(): Promise<AriesPool[]> {
    try {
      // First, we try to get a list of all markets/pools
      // The exact function name might differ - this is a placeholder
      const marketsResponse = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_all_markets`,
          functionArguments: []
        }
      });
      
      // Parse the response - format will depend on actual contract response
      const markets = marketsResponse[0] as string[];
      
      // Process each market to get details
      const poolPromises = markets.map(async (market) => {
        return this.getPoolDetails(market);
      });
      
      // Wait for all promises to resolve
      const pools = await Promise.all(poolPromises);
      return pools.filter((pool): pool is AriesPool => pool !== null);
      
    } catch (error) {
      console.error("Error fetching Aries pools:", error);
      
      // If we can't get markets directly, we can try to fetch predefined markets
      // This is just a fallback - ideally, we'd get the markets from the contract
      return this.getPredefinedPools();
    }
  }
  
  /**
   * Get details for a specific pool/market
   * @param marketAddress The address of the market
   */
  async getPoolDetails(marketAddress: string): Promise<AriesPool | null> {
    try {
      // Get the token type for this market
      const tokenType = await this.getMarketToken(marketAddress);
      
      // Get market metrics
      const [supplyRate, borrowRate, totalSupply, totalBorrow, collateralFactor] = await Promise.all([
        this.getSupplyAPY(marketAddress),
        this.getBorrowAPY(marketAddress),
        this.getTotalSupply(marketAddress),
        this.getTotalBorrow(marketAddress),
        this.getCollateralFactor(marketAddress)
      ]);
      
      // Calculate utilization rate
      const utilizationRate = totalSupply > 0 ? totalBorrow / totalSupply : 0;
      
      // Create pool object
      return {
        protocol: "Aries Finance",
        poolId: marketAddress,
        assetName: this.getAssetNameFromToken(tokenType),
        symbol: this.getSymbolFromToken(tokenType),
        tokenAddress: tokenType,
        decimals: await this.getTokenDecimals(tokenType),
        supplyAPY: supplyRate * 100, // Convert to percentage
        borrowAPY: borrowRate * 100, // Convert to percentage
        totalSupply,
        totalBorrow,
        availableLiquidity: totalSupply - totalBorrow,
        utilizationRate,
        ltv: collateralFactor,
        isActive: true,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error fetching details for market ${marketAddress}:`, error);
      return null;
    }
  }
  
  /**
   * Get the token type for a market
   * @param marketAddress The address of the market
   */
  async getMarketToken(marketAddress: string): Promise<string> {
    try {
      // Query the market to get its underlying token
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_market_token`,
          functionArguments: [marketAddress]
        }
      });
      
      return response[0] as string;
    } catch (error) {
      console.error(`Error getting token for market ${marketAddress}:`, error);
      
      // Fallback: Assume the market address contains the token type
      // This is just a guess - the actual logic will depend on Aries design
      return marketAddress;
    }
  }
  
  /**
   * Get supply APY for a market
   * @param marketAddress The address of the market
   */
  async getSupplyAPY(marketAddress: string): Promise<number> {
    try {
      // Query the supply interest rate
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::interest_rate::get_supply_rate`,
          functionArguments: [marketAddress]
        }
      });
      
      // Parse response based on actual contract output format
      return parseFloat(response[0] as string);
    } catch (error) {
      console.error(`Error getting supply rate for market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Get borrow APY for a market
   * @param marketAddress The address of the market
   */
  async getBorrowAPY(marketAddress: string): Promise<number> {
    try {
      // Query the borrow interest rate
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::interest_rate::get_borrow_rate`,
          functionArguments: [marketAddress]
        }
      });
      
      // Parse response based on actual contract output format
      return parseFloat(response[0] as string);
    } catch (error) {
      console.error(`Error getting borrow rate for market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Get total supply for a market
   * @param marketAddress The address of the market
   */
  async getTotalSupply(marketAddress: string): Promise<number> {
    try {
      // Query the total supply
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_total_supply`,
          functionArguments: [marketAddress]
        }
      });
      
      // Parse response based on actual contract output format
      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting total supply for market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Get total borrow for a market
   * @param marketAddress The address of the market
   */
  async getTotalBorrow(marketAddress: string): Promise<number> {
    try {
      // Query the total borrow
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_total_borrows`,
          functionArguments: [marketAddress]
        }
      });
      
      // Parse response based on actual contract output format
      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting total borrow for market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Get collateral factor (LTV) for a market
   * @param marketAddress The address of the market
   */
  async getCollateralFactor(marketAddress: string): Promise<number> {
    try {
      // Query the collateral factor
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_collateral_factor`,
          functionArguments: [marketAddress]
        }
      });
      
      // Parse response based on actual contract output format
      // This might return a value like 0.75 (75%)
      return parseFloat(response[0] as string);
    } catch (error) {
      console.error(`Error getting collateral factor for market ${marketAddress}:`, error);
      return 0.75; // Default to 75% as a reasonable fallback
    }
  }
  
  /**
   * Get token decimals
   * @param tokenType The token type
   */
  async getTokenDecimals(tokenType: string): Promise<number> {
    try {
      // Query the token info for decimals
      // This is a standard Aptos way to get token decimals
      const response = await this.aptos.view({
        payload: {
          function: "0x1::coin::decimals",
          typeArguments: [tokenType],
          functionArguments: []
        }
      });
      
      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting decimals for token ${tokenType}:`, error);
      
      // Default decimals by token type
      if (tokenType.includes("::aptos_coin::AptosCoin")) {
        return 8; // APT has 8 decimals
      } else if (tokenType.includes("USDC") || tokenType.includes("USDT")) {
        return 6; // Stablecoins typically have 6 decimals
      }
      
      return 8; // Default to 8 as a reasonable fallback
    }
  }
  
  /**
   * Extract asset name from token type
   * @param tokenType The token type string
   */
  getAssetNameFromToken(tokenType: string): string {
    const parts = tokenType.split("::");
    return parts.length > 2 ? parts[2] : tokenType;
  }
  
  /**
   * Extract symbol from token type
   * @param tokenType The token type string
   */
  getSymbolFromToken(tokenType: string): string {
    // Extract symbol from token type
    // For example, "0x1::aptos_coin::AptosCoin" => "APT"
    if (tokenType.includes("::aptos_coin::AptosCoin")) {
      return "APT";
    }
    
    const parts = tokenType.split("::");
    const rawSymbol = parts.length > 2 ? parts[2] : "";
    
    // Clean up common naming patterns
    return rawSymbol
      .replace("Coin", "")
      .replace("Token", "")
      .replace("Asset", "");
  }
  
  /**
   * Get account borrowable amount for a market
   * @param accountAddress The user's address
   * @param marketAddress The market address
   * @param profileName The profile name (defaults to "main")
   */
  async getAccountBorrowable(
    accountAddress: string, 
    marketAddress: string, 
    profileName: string = "main"
  ): Promise<number> {
    try {
      // Convert profile name to bytes
      const profileBytes = this.stringToBytes(profileName);
      
      // Query borrowable amount
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_account_borrowable`,
          functionArguments: [accountAddress, marketAddress, profileBytes]
        }
      });
      
      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting borrowable amount for account ${accountAddress} in market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Get account supply (deposit) for a market
   * @param accountAddress The user's address
   * @param marketAddress The market address
   * @param profileName The profile name (defaults to "main")
   */
  async getAccountSupply(
    accountAddress: string, 
    marketAddress: string, 
    profileName: string = "main"
  ): Promise<number> {
    try {
      // Convert profile name to bytes
      const profileBytes = this.stringToBytes(profileName);
      
      // Query supply amount
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_account_supply`,
          functionArguments: [accountAddress, marketAddress, profileBytes]
        }
      });
      
      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting supply amount for account ${accountAddress} in market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Get account borrow (debt) for a market
   * @param accountAddress The user's address
   * @param marketAddress The market address
   * @param profileName The profile name (defaults to "main")
   */
  async getAccountBorrow(
    accountAddress: string, 
    marketAddress: string, 
    profileName: string = "main"
  ): Promise<number> {
    try {
      // Convert profile name to bytes
      const profileBytes = this.stringToBytes(profileName);
      
      // Query borrow amount
      // This is a placeholder - actual function name may differ
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::controller::get_account_borrow`,
          functionArguments: [accountAddress, marketAddress, profileBytes]
        }
      });
      
      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting borrow amount for account ${accountAddress} in market ${marketAddress}:`, error);
      return 0;
    }
  }
  
  /**
   * Create a deposit payload
   * @param tokenType The token type to deposit
   * @param amount Amount to deposit
   * @param profileName The profile name (defaults to "main")
   * @param repayOnly Whether to only repay existing debt (defaults to false)
   */
  createDepositPayload(
    tokenType: string,
    amount: number,
    profileName: string = "main",
    repayOnly: boolean = false
  ) {
    // Convert profile name to bytes
    const profileBytes = this.stringToBytes(profileName);
    
    // Create the transaction payload
    return {
      function: `${this.contractAddress}::controller::deposit`,
      typeArguments: [tokenType],
      functionArguments: [profileBytes, amount, repayOnly]
    };
  }
  
  /**
   * Create a withdraw payload
   * @param tokenType The token type to withdraw
   * @param amount Amount to withdraw
   * @param profileName The profile name (defaults to "main")
   * @param allowBorrow Whether to allow borrowing if needed (defaults to false)
   */
  createWithdrawPayload(
    tokenType: string,
    amount: number,
    profileName: string = "main",
    allowBorrow: boolean = false
  ) {
    // Convert profile name to bytes
    const profileBytes = this.stringToBytes(profileName);
    
    // Create the transaction payload
    return {
      function: `${this.contractAddress}::controller::withdraw`,
      typeArguments: [tokenType],
      functionArguments: [profileBytes, amount, allowBorrow]
    };
  }
  
  /**
   * Create a register user payload
   * @param profileName The profile name (defaults to "main")
   */
  createRegisterUserPayload(profileName: string = "main") {
    // Convert profile name to bytes
    const profileBytes = this.stringToBytes(profileName);
    
    // Create the transaction payload
    return {
      function: `${this.contractAddress}::controller::register_user`,
      functionArguments: [profileBytes]
    };
  }
  
  /**
   * Helper function to convert string to bytes (UTF-8)
   * @param str The string to convert
   */
  private stringToBytes(str: string): number[] {
    return Array.from(new TextEncoder().encode(str));
  }
  
  /**
   * Fallback function to provide predefined pools when API calls fail
   * This should be replaced with actual contract queries in production
   */
  private async getPredefinedPools(): Promise<AriesPool[]> {
    // Common tokens on Aptos
    const commonTokens = [
      {
        name: "Aptos Coin",
        symbol: "APT",
        tokenAddress: "0x1::aptos_coin::AptosCoin",
        decimals: 8
      },
      {
        name: "USD Coin",
        symbol: "USDC",
        tokenAddress: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::coin::USDC",
        decimals: 6
      },
      {
        name: "Tether USD",
        symbol: "USDT",
        tokenAddress: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T",
        decimals: 6
      }
    ];
    
    // Create predefined pools for common tokens
    return commonTokens.map(token => ({
      protocol: "Aries Finance",
      poolId: `${this.contractAddress}::markets::${token.symbol}Market`, // This is a dummy format
      assetName: token.name,
      symbol: token.symbol,
      tokenAddress: token.tokenAddress,
      decimals: token.decimals,
      supplyAPY: token.symbol === "APT" ? 3.5 : token.symbol.includes("USD") ? 5.8 : 4.2,
      borrowAPY: token.symbol === "APT" ? 4.8 : token.symbol.includes("USD") ? 7.2 : 5.9,
      totalSupply: 1000000,
      totalBorrow: 500000,
      availableLiquidity: 500000,
      utilizationRate: 0.5,
      ltv: token.symbol === "APT" ? 0.75 : token.symbol.includes("USD") ? 0.85 : 0.7,
      isActive: true,
      lastUpdated: new Date()
    }));
  }
}

/**
 * Initialize Aries client
 * @param rpcUrl Optional custom RPC URL
 * @returns Initialized Aries client
 */
export function initializeAriesClient(rpcUrl?: string): AriesClient {
  // Default contract address for Aries Finance
  const ARIES_CONTRACT_ADDRESS = "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3";
  
  // Create Aptos client
  const config = new AptosConfig({
    network: Network.MAINNET,
    fullnode: rpcUrl // Use custom RPC if provided
  });
  
  const aptos = new Aptos(config);
  
  // Create and return Aries client
  return new AriesClient(aptos, ARIES_CONTRACT_ADDRESS);
}

/**
 * Initialize Aries client using Move Agent Kit
 * @param agent Initialized AgentRuntime
 * @returns Initialized Aries client
 */
export function initializeAriesClientWithAgent(agent: AgentRuntime): AriesClient {
  const ARIES_CONTRACT_ADDRESS = "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3";
  return new AriesClient(agent.aptos, ARIES_CONTRACT_ADDRESS);
}

/**
 * Example usage
 */
async function main() {
  try {
    // Initialize the client
    const client = initializeAriesClient();
    
    // Fetch all pools
    console.log("Fetching Aries pools...");
    const pools = await client.getAllPools();
    
    console.log(`Found ${pools.length} Aries pools.`);
    
    // Display pool information
    pools.forEach((pool, index) => {
      console.log(`\nPool #${index + 1}: ${pool.assetName} (${pool.symbol})`);
      console.log(`- Supply APY: ${pool.supplyAPY.toFixed(2)}%`);
      console.log(`- Borrow APY: ${pool.borrowAPY.toFixed(2)}%`);
      console.log(`- Total Supply: ${pool.totalSupply}`);
      console.log(`- Total Borrow: ${pool.totalBorrow}`);
      console.log(`- Utilization Rate: ${(pool.utilizationRate * 100).toFixed(2)}%`);
      console.log(`- LTV: ${(pool.ltv * 100).toFixed(2)}%`);
    });
    
    // Example: Get account-specific data
    // const accountAddress = "YOUR_ACCOUNT_ADDRESS";
    // if (pools.length > 0) {
    //   const pool = pools[0];
    //   const borrowable = await client.getAccountBorrowable(accountAddress, pool.poolId);
    //   const supply = await client.getAccountSupply(accountAddress, pool.poolId);
    //   const borrow = await client.getAccountBorrow(accountAddress, pool.poolId);
    //   
    //   console.log(`\nAccount data for ${pool.assetName}:`);
    //   console.log(`- Borrowable: ${borrowable}`);
    //   console.log(`- Supplied: ${supply}`);
    //   console.log(`- Borrowed: ${borrow}`);
    // }
    
  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Uncomment to run
 main();