import mongoose, { Schema, Document } from 'mongoose';

// Define the TypeScript interface for PoolData
export interface IPoolData extends Document {
  _id: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema for PoolData
const PoolDataSchema: Schema = new Schema({
  assetName: { type: String, required: true, description: 'Name of the asset (e.g., USDC, ETH)' },
  tokenAddress: { type: String, required: true, description: 'Token address on the blockchain' },
  ltv: { type: Schema.Types.Mixed, required: true, description: 'Loan-to-value ratio (can be a number or string)' },
  decimals: { type: Number, required: true, min: 0, description: 'Number of decimals for the token' },
  marketSize: { type: Number, required: true, description: 'Total market size of the pool' },
  totalBorrowed: { type: Number, required: true, description: 'Total amount of borrowed assets in the pool' },
  depositApy: { type: Number, required: true, description: 'Annual percentage yield for deposits' },
  extraDepositApy: { type: Schema.Types.Mixed, required: true, description: 'Additional deposit APY (can be a number or string)' },
  borrowApy: { type: Number, required: true, description: 'Annual percentage yield for borrowing' },
  price: { type: Number, required: true, description: 'Current price of the asset' }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model for use in the app
export const PoolData = mongoose.model<IPoolData>('PoolData', PoolDataSchema);
