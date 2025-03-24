import mongoose, { Schema, Document } from 'mongoose';

// Define the TypeScript interface for LPPoolData
export interface ILPPoolData extends Document {
  _id: mongoose.Types.ObjectId;
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
  poolType: string; // 'constant_product', 'stable', 'hybrid'
  poolCurve: string; // 'linear', 'exponential', etc.
  poolAddress?: string; // Optional field
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema for LPPoolData
const LPPoolDataSchema: Schema = new Schema({
  tokenA: { type: String, required: true, description: 'Address or identifier for token A' },
  tokenB: { type: String, required: true, description: 'Address or identifier for token B' },
  tokenASymbol: { type: String, required: true, description: 'Symbol for token A' },
  tokenBSymbol: { type: String, required: true, description: 'Symbol for token B' },
  tokenADecimals: { type: Number, required: true, min: 0, description: 'Decimals for token A' },
  tokenBDecimals: { type: Number, required: true, min: 0, description: 'Decimals for token B' },
  reserveA: { type: Number, required: true, description: 'Amount of token A in pool' },
  reserveB: { type: Number, required: true, description: 'Amount of token B in pool' },
  liquidity: { type: Number, required: true, description: 'Total liquidity in pool' },
  apr: { type: Number, required: true, description: 'Annual percentage rate of the pool' },
  volume24h: { type: Number, required: true, description: '24-hour trading volume' },
  fee: { type: Number, required: true, description: 'Fee for trading in the pool' },
  poolType: { 
    type: String, 
    required: true, 
    enum: ['constant_product', 'stable', 'hybrid'], 
    description: 'Type of the liquidity pool' 
  },
  poolCurve: { 
    type: String, 
    required: true, 
    description: 'Curve type used by the pool (linear, exponential, etc.)' 
  },
  poolAddress: { 
    type: String, 
    required: false, 
    description: 'Optional address of the liquidity pool' 
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model for use in the app
export const LPPoolData = mongoose.model<ILPPoolData>('LPPoolData', LPPoolDataSchema);
