import React, { useState, useEffect } from 'react';

interface Transaction {
  planId: string;
  txHash: string;
  amount: number;
  timestamp: string;
  status: string;
}

function LiveTransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTransactionAlert, setNewTransactionAlert] = useState(false);

  // Fetch data from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dca/plans/token/aptos');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      // Extract all transactions from all plans
      const allTransactions: Transaction[] = [];
      data.forEach((plan: any) => {
        if (plan.transactions && plan.transactions.length > 0) {
          allTransactions.push(...plan.transactions);
        }
      });
      
      // Sort by timestamp descending
      allTransactions.sort((a: Transaction, b: Transaction) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Check if we have new transactions
      if (transactions.length > 0 && allTransactions.length > transactions.length) {
        setNewTransactionAlert(true);
        setTimeout(() => setNewTransactionAlert(false), 3000);
      }
      
      setTransactions(allTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTransactions();
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(fetchTransactions, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - txTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  // Truncate transaction hash
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-xl font-medium">Live Transaction Feed</h3>
        {newTransactionAlert && (
          <div className="animate-pulse bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
            New transaction detected
          </div>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No transactions recorded yet.</p>
            <p className="text-sm mt-2">Transactions will appear here in real-time as they occur.</p>
          </div>
        ) : (
          <div>
            {transactions.map((tx, index) => (
              <div 
                key={`${tx.txHash}-${index}`} 
                className={`p-4 border-b border-white/5 hover:bg-white/10 transition-colors ${
                  index === 0 && newTransactionAlert ? 'bg-green-900/10' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-mono text-sm">{truncateHash(tx.txHash)}</span>
                  </div>
                  <span className="text-sm text-gray-400">{formatRelativeTime(tx.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-green-400 font-medium">{tx.amount.toFixed(4)} APT</span>
                    <span className="text-gray-400 ml-2 text-sm">purchased</span>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    {tx.status || 'completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveTransactionFeed;