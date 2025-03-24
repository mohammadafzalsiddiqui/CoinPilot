import express from 'express';
import { JoulePoolService } from '../services/JoulePoolService';
import { logger } from '../utils/logger';

const router = express.Router();
const joulePoolService = new JoulePoolService();

// Get best Joule pool info
router.get('/pool/best', async (req, res) => {
  try {
    const bestPool = await joulePoolService.getBestPool();
    res.json(bestPool);
  } catch (error) {
    logger.error('Failed to get best Joule pool:', error);
    res.status(500).json({ error: 'Failed to get best Joule pool' });
  }
});

// Get user's deposit balance
router.get('/balance', async (req, res) => {
  try {
    const balance = await joulePoolService.getDepositBalance();
    res.json({ balance });
  } catch (error) {
    logger.error('Failed to get deposit balance:', error);
    res.status(500).json({ error: 'Failed to get deposit balance' });
  }
});

// Lend (deposit) to best Joule pool
router.post('/lend', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    const txHash = await joulePoolService.lendToBestPool(amount);
    
    res.json({ 
      message: 'Successfully lent to Joule pool',
      transactionHash: txHash,
      amount
    });
  } catch (error) {
    logger.error('Failed to lend to Joule pool:', error);
    res.status(500).json({ error: 'Failed to lend to Joule pool' });
  }
});

// Withdraw from Joule pool
router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    const txHash = await joulePoolService.withdrawFromBestPool(amount);
    
    res.json({ 
      message: 'Successfully withdrew from Joule pool',
      transactionHash: txHash,
      amount
    });
  } catch (error) {
    logger.error('Failed to withdraw from Joule pool:', error);
    res.status(500).json({ error: 'Failed to withdraw from Joule pool' });
  }
});

// Calculate theoretical accrued interest
router.post('/calculate-interest', async (req, res) => {
  try {
    const { amount, timestamp } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    if (!timestamp || typeof timestamp !== 'number') {
      return res.status(400).json({ error: 'Valid timestamp is required' });
    }
    
    const interest = await joulePoolService.calculateAccruedInterest(amount, timestamp);
    
    res.json({ 
      amount,
      timestamp,
      interest,
      annualApr: (await joulePoolService.getBestPool()).totalDepositApy
    });
  } catch (error) {
    logger.error('Failed to calculate interest:', error);
    res.status(500).json({ error: 'Failed to calculate interest' });
  }
});

export default router;