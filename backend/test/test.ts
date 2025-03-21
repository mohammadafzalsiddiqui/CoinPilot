import { AptosPlugin } from "../src/plugins/aptos";
import dotenv from "dotenv";

dotenv.config();

async function testAptosPlugin() {
  try {
    console.log("Initializing Aptos Plugin test...");
    
    // Check for private key before initializing the plugin
    const privateKeyAptos = 'x';
    console.log("Checking for private key...", privateKeyAptos);
    if (!privateKeyAptos) {
      throw new Error("PRIVATE_KEY_APTOS environment variable is not set. Please set it before running this test.");
    }
    console.log("Private key found in environment variables");
    
    const aptosPlugin = new AptosPlugin();
    
    // You can replace with your actual test address
    const testAddress = "0x319432ed47e39d979f4a0ddf29bb0df0030cc05ab2052ef7be7a92a3750fa174";
    
    // Get balances
    console.log("Getting balances...");
    const usdcBalance = await aptosPlugin.getUSDTBalance(testAddress);
    console.log(`USDC Balance: ${usdcBalance}`);
    
    const aptBalance = await aptosPlugin.getNativeBalance(testAddress);
    console.log(`APT Balance: ${aptBalance}`);
    
    // Test transaction
    console.log("Executing test transaction...");
    const recipientAddress = "0x005547188851320ad9851e703688af8b82d0fda54f7a174207a7731689c9e225";
    const amount = 1; // 1 USDC
    
    const txHash = await aptosPlugin.sendTransaction(
      amount,
      testAddress, // This is ignored as the plugin uses the private key from .env
      recipientAddress
    );
    
    console.log(`Transaction hash: ${txHash}`);
    console.log("Test completed successfully");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testAptosPlugin();