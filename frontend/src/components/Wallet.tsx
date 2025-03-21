import { useEffect, useState } from 'react';
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import axios from 'axios';

function Wallet() {
  const { connect, disconnect, account, wallets, connected } = useWallet();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    const storeWalletInfo = async () => {
      if (connected && account?.address) {
        try {
          setIsLoading(true);
          setError(null);

          const address = account.address.toString();
          console.log('Wallet connected:', address);

          const response = await axios.post(`${API_URL}/users`, { address });
          setUser(response.data);
          localStorage.setItem('walletAddress', address);
          localStorage.setItem('userId', response.data._id);
          console.log('User data retrieved from database:', response.data);
        } catch (error) {
          console.error('Failed to store wallet info:', error);
          setError('Failed to connect wallet. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
      }
    };

    storeWalletInfo();
  }, [connected, account]);

  const getUserId = () => user?._id || null;
  const getWalletAddress = () => account?.address?.toString() || null;

  if (typeof window !== 'undefined') {
    window.getUserId = getUserId;
    window.getWalletAddress = getWalletAddress;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {connected ? (
        <>
          <span className="text-sm text-gray-400 truncate max-w-[120px]">
            {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
          >
            Disconnect
          </button>
        </>
      ) : (
        <select
          onChange={(e) => connect(e.target.value)}
          className="bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20"
          value=""
        >
          <option value="" disabled>Select Wallet</option>
          {wallets.map((wallet) => (
            <option key={wallet.adapter.name} value={wallet.adapter.name}>
              {wallet.adapter.name}
            </option>
          ))}
        </select>
      )}
      {isLoading && <span className="text-gray-400">Loading...</span>}
      {error && <span className="text-red-400">{error}</span>}
    </div>
  );
}

export default Wallet;