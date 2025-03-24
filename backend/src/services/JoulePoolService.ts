import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network
} from "@aptos-labs/ts-sdk";
import fs from "fs";
import dotenv from "dotenv";
import { AgentRuntime, LocalSigner } from "move-agent-kit";
import { logger } from "../utils/logger";

// Import the existing tool functions directly
import  getPoolDetails  from "move-agent-kit";
import  lendToken  from "move-agent-kit";
import  withdrawToken  from "move-agent-kit";
import  borrowToken  from "move-agent-kit";

export class JoulePoolService {
  private agentRuntime: AgentRuntime;
  private account: Account;
  
  /**
   * Initialize the Joule Pool Service
   */
  constructor() {
    dotenv.config();
    
    // Initialize Aptos client with mainnet configuration
    const aptosConfig = new AptosConfig({
      network: Network.MAINNET,
    });
    
    const aptos = new Aptos(aptosConfig);
    
    // Set up account with private key from environment variables
    if (!process.env.PRIVATE_KEY_APTOS) {
      throw new Error("PRIVATE_KEY_APTOS not found in environment variables");
    }
    
    // Create private key and account instances
    const privateKey = new Ed25519PrivateKey(process.env.PRIVATE_KEY_APTOS);
    this.account = Account.fromPrivateKey({ privateKey });
    
    // Initialize signer and agent runtime
    const signer = new LocalSigner(this.account, Network.MAINNET);
    this.agentRuntime = new AgentRuntime(signer, aptos);
    
    logger.info(`JoulePoolService initialized with account: ${this.account.accountAddress}`);
  }
  
  /**
   * Get the best pool from the saved JSON file
   */
  async getBestPool(): Promise<any> {
    try {
      if (!fs.existsSync('best_joule_pool.json')) {
        throw new Error('best_joule_pool.json not found');
      }
      
      const bestPoolData = fs.readFileSync('best_joule_pool.json', 'utf8');
      return JSON.parse(bestPoolData);
    } catch (error: any) {
      logger.error('Error loading best Joule pool:', error);
      throw new Error(`Failed to load best Joule pool data: ${error.message}`);
    }
  }
  
  /**
   * Get details about a specific pool
   * @param tokenAddress Token address to get pool details for
   */
  async getPoolDetails(tokenAddress: string): Promise<any> {
    try {
      const poolDetails = await getPoolDetails(this.agentRuntime, tokenAddress);
      return poolDetails;
    } catch (error: any) {
      logger.error(`Error fetching pool details for ${tokenAddress}:`, error);
      throw new Error(`Failed to get pool details: ${error.message}`);
    }
  }
  
  /**
   * Lend tokens to the best Joule pool
   * @param amount Amount to lend in human-readable format
   * @param newPosition Whether to create a new position
   * @returns Transaction hash and position ID
   */
  async lendToBestPool(amount: number, newPosition = true): Promise<{
    hash: string;
    positionId: string;
  }> {
    try {
      // Get the best pool data
      const bestPool = await this.getBestPool();
      logger.info(`Lending ${amount} ${bestPool.assetName} to best Joule pool`);
      
      // Convert amount to on-chain format
      const actualAmount = Math.floor(amount * Math.pow(10, bestPool.decimals));
      
      // Use a default position ID if creating a new position
      const positionId = newPosition ? "1234" : "1"; // This would be replaced with actual position ID in production
      
      // Use the existing lendToken function from move-agent-kit
      const result = await lendToken(
        this.agentRuntime,
        actualAmount,
        bestPool.tokenAddress,
        positionId,
        newPosition,
        false // Not a fungible asset
      );
      
      return result;
    } catch (error: any) {
      logger.error('Error lending to Joule pool:', error);
      throw new Error(`Failed to lend to Joule pool: ${error.message}`);
    }
  }
  
  /**
   * Withdraw tokens from the Joule pool
   * @param amount Amount to withdraw in human-readable format
   * @param positionId Position ID to withdraw from
   * @returns Transaction hash and position ID
   */
  async withdrawFromPool(amount: number, positionId: string): Promise<{
    hash: string;
    positionId: string;
  }> {
    try {
      // Get the best pool data
      const bestPool = await this.getBestPool();
      logger.info(`Withdrawing ${amount} ${bestPool.assetName} from Joule pool, position ${positionId}`);
      
      // Convert amount to on-chain format
      const actualAmount = Math.floor(amount * Math.pow(10, bestPool.decimals));
      
      // Use the existing withdrawToken function from move-agent-kit
      const result = await withdrawToken(
        this.agentRuntime,
        actualAmount,
        bestPool.tokenAddress,
        positionId,
        false // Not a fungible asset
      );
      
      return result;
    } catch (error: any) {
      logger.error('Error withdrawing from Joule pool:', error);
      throw new Error(`Failed to withdraw from Joule pool: ${error.message}`);
    }
  }
  
  /**
   * Borrow tokens from the Joule pool
   * @param amount Amount to borrow in human-readable format
   * @param positionId Position ID to borrow from
   * @returns Transaction hash and position ID
   */
  async borrowFromPool(amount: number, positionId: string): Promise<{
    hash: string;
    positionId: string;
  }> {
    try {
      // Get the best pool data
      const bestPool = await this.getBestPool();
      logger.info(`Borrowing ${amount} ${bestPool.assetName} from Joule pool, position ${positionId}`);
      
      // Convert amount to on-chain format
      const actualAmount = Math.floor(amount * Math.pow(10, bestPool.decimals));
      
      // Use the borrowToken function from move-agent-kit
      const result = await borrowToken(
        this.agentRuntime,
        actualAmount,
        bestPool.tokenAddress,
        positionId,
        false // Not a fungible asset
      );
      
      return result;
    } catch (error: any) {
      logger.error('Error borrowing from Joule pool:', error);
      throw new Error(`Failed to borrow from Joule pool: ${error.message}`);
    }
  }
  
  /**
   * Calculate the accrued interest for the user's deposit
   * @param depositAmount The amount initially deposited
   * @param depositTimestamp The timestamp when the deposit was made
   * @returns The accrued interest amount
   */
  async calculateAccruedInterest(depositAmount: number, depositTimestamp: number): Promise<number> {
    try {
      const bestPool = await this.getBestPool();
      
      // Calculate time elapsed since deposit in years
      const currentTime = Date.now();
      const timeElapsedMs = currentTime - depositTimestamp;
      const timeElapsedYears = timeElapsedMs / (1000 * 60 * 60 * 24 * 365);
      
      // Use the total deposit APY for calculation
      const interestRate = bestPool.totalDepositApy / 100;
      
      // Simple interest formula: P * r * t
      const interest = depositAmount * interestRate * timeElapsedYears;
      
      logger.info(`Calculated accrued interest: ${interest.toFixed(6)} ${bestPool.assetName}`);
      return interest;
    } catch (error: any) {
      logger.error('Error calculating accrued interest:', error);
      return 0;
    }
  }
  
  /**
   * Get account address
   * @returns Account address as string
   */
  getAddress(): string {
    return this.account.accountAddress.toString();
  }
}