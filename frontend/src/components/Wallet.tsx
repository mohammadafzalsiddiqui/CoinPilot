import { useEffect, useState } from 'react';
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import { Wallet2, LogOut } from 'lucide-react';
import axios from 'axios';

function Wallet() {
  const { connect, disconnect, account, wallets, connected } = useWallet();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleConnect = async (walletName) => {
    try {
      await connect(walletName);
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  // Add blur effect to body when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  return (
    <div className="relative flex items-center justify-end gap-2">
      {connected ? (
        <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 backdrop-blur-sm">
          <Wallet2 className="h-5 w-5 text-green-400" />
          <span className="text-sm text-white font-mono truncate max-w-[120px]">
            {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Disconnect</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900/80 border border-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800/80 transition-colors backdrop-blur-sm"
        >
          <Wallet2 className="h-5 w-5" />
          <span>Connect Wallet</span>
        </button>
      )}

      {/* Perfectly Centered Modal with blurred background and slight left offset */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center mr-96"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)', // Enhanced blur effect
            WebkitBackdropFilter: 'blur(12px)', // For Safari support
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl w-[400px] border border-gray-800/40"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              animation: 'modalFadeIn 0.3s ease-out forwards',
              margin: '0 auto',
              position: 'absolute',
              top: '50%',
              left: 'calc(50% - 10px)', // Offset 10px to the left
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {wallets.map((wallet) => {
                  // Mapping for wallet logos - replace with actual logo URLs
                  const logoMap = {
                    'Petra': 'https://imgs.search.brave.com/S8xLSOAUJKjSxI7PxeBh5kAdR5IaWJD06zXEsSgY0Vk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saDMu/Z29vZ2xldXNlcmNv/bnRlbnQuY29tL3h5/V0xfOXhCSERUYTI5/dVBuczliQWhCbkts/ZmpmLU5OWl9naE1m/Qm5lNHBvV2FwSEVo/Qm9mQjd4SDZuVTRy/SnRRV0VoZDlUT3pY/aWRuVFRIVnRWUllo/UXhHdUhqS09zMzkw/a1U9cnc',
                    'Martian': 'https://lh3.googleusercontent.com/5Nza0dQHga1_Z1RAKh-9cPV3N0KxsB3hy2Z31E73qMzxHA7u-7mF8AENMngX7fl5fEdKRcZ67d-f0S-3sZr6n0SsgQ=s120',
                    'Pontem': 'https://lh3.googleusercontent.com/L5z9qo2zBT0_0iM7Vfk4drJQxjR9msb_JJFRdFWzrivUX7dM3LvDw-X21C5VdnQsubwTaY3Jqvr05NOPKTPmkrxqZJs=s120',
                    'Fewcha': 'https://fewcha.app/logo.svg',
                    'Rise Wallet': 'https://risewallet.io/logo.svg'
                  };
                  
                  // Fallback icon if no logo is available
                  const WalletIcon = () => (
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <Wallet2 className="h-4 w-4 text-gray-400" />
                    </div>
                  );
                  
                  return (
                    <div
                      key={wallet.adapter.name}
                      className="flex items-center justify-between p-4 bg-black/60 rounded-xl border border-gray-800 hover:bg-gray-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Wallet logo or fallback icon */}
                        {logoMap[wallet.adapter.name] ? (
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                            <img 
                              src={logoMap[wallet.adapter.name]} 
                              alt={`${wallet.adapter.name} logo`}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg></div>';
                              }}
                            />
                          </div>
                        ) : (
                          <WalletIcon />
                        )}
                        <span className="text-white font-medium">{wallet.adapter.name}</span>
                      </div>
                      <button
                        onClick={() => handleConnect(wallet.adapter.name)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* More wallets button */}
              <div className="flex justify-center mt-2">
                <button className="flex items-center text-gray-400 text-sm gap-1 hover:text-white py-2">
                  <span>More wallets</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              {/* Privacy policy footer */}
              <div className="pt-3 border-t border-gray-800 mt-3">
                <p className="text-gray-400 text-xs text-center">
                  By continuing, you agree to Aptos Labs' <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
                </p>
                <p className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-2">
                  Powered by 
                  <span className="inline-flex items-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-1">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Aptos Labs
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && <span className="text-gray-400 text-sm ml-2">Connecting...</span>}
      {error && (
        <span className="text-red-400 text-sm ml-2 bg-red-900/30 px-2 py-1 rounded">{error}</span>
      )}

      {/* Add the animation keyframes */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Wallet;