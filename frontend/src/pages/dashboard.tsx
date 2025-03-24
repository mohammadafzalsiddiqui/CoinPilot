// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';

interface Transaction {
  planId: string;
  txHash: string;
  amount: number;
  timestamp: string;
  status: string;
}

function Dashboard({ onBack }: { onBack: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API routes
  const API_BASE = 'http://localhost:8000/api/dca';
  
  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} transactions`);
      
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transaction data');
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Effect to fetch data initially and then poll for updates
  useEffect(() => {
    fetchTransactions();
    
    // Set up polling interval
    const intervalId = setInterval(fetchTransactions, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchTransactions();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-6">Live Transaction Dashboard</h3>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Transaction History</h3>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-white/10 rounded-md text-sm hover:bg-white/20 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {loading && transactions.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-black/20 rounded-lg">
              <p>No transactions recorded yet.</p>
              <p className="text-sm mt-2">Transactions will appear here as they are executed by the server.</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden bg-black/40">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-black">
                    <tr className="text-left">
                      <th className="p-4">Time</th>
                      <th className="p-4">Plan ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr 
                        key={`${tx.txHash}-${index}`} 
                        className="border-t border-white/10"
                      >
                        <td className="p-4 text-gray-300">{formatTimestamp(tx.timestamp)}</td>
                        <td className="p-4 font-mono">{tx.planId}</td>
                        <td className="p-4 text-green-400">{tx.amount.toFixed(4)} APT</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-md text-sm bg-green-500/20 text-green-400">
                            {tx.status || 'completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={onBack}
          className="bg-white/10 text-white px-6 py-2 rounded-md hover:bg-white/20 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Dashboard;