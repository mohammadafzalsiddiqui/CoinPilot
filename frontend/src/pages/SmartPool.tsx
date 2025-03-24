import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Info } from 'lucide-react';

function SmartPool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('earn');
  const [inputAmount, setInputAmount] = useState('0.00');
  
  // Currency icons for the top row
  const currencies = [
    { letter: 'Z', color: 'border-white bg-gray-800' },
    { letter: '$', color: 'border-blue-400 bg-gray-800' },
    { letter: 'T', color: 'border-green-400 bg-gray-800' },
    { letter: 'B', color: 'border-yellow-400 bg-gray-800' },
    { letter: 'M', color: 'border-orange-400 bg-gray-800' },
    { letter: 'X', color: 'border-red-400 bg-gray-800' }
  ];

  // Strategies data
  const strategies = [
    { 
      id: 'stAPT-APT', 
      name: 'stAPT/APT', 
      tag: 'Looping Strategy', 
      subtitle: 'Top Performing Strategy',
      apy: '44.84%', 
      invested: 1.76, 
      value: '$10',
      abbr: 'sA'
    },
    { 
      id: 'BTC-ETH', 
      name: 'BTC/ETH', 
      tag: 'Hedging Strategy', 
      apy: '28.35%', 
      invested: 0, 
      value: '$0',
      abbr: 'BE'
    },
    { 
      id: 'USDC-USDT', 
      name: 'USDC/USDT', 
      tag: 'Stablecoin Yield', 
      apy: '12.47%', 
      invested: 0, 
      value: '$0',
      abbr: 'UU'
    },
    { 
      id: 'ETH-APT', 
      name: 'ETH/APT', 
      tag: 'Cross-Chain Yield', 
      apy: '31.92%', 
      invested: 0, 
      value: '$0',
      abbr: 'EA'
    }
  ];

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Validate proper number format
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputAmount(value);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-24 px-4 max-w-6xl mx-auto pb-16">
        {/* Back button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Left Side - Main Title and Description */}
          <div className="flex-1 space-y-4">
            {/* Currency icons */}
            <div className="flex -space-x-2 mb-4">
              {currencies.map((currency, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 ${currency.color} flex items-center justify-center text-xs font-bold`}>
                  {currency.letter}
                </div>
              ))}
            </div>
            
            <h1 className="text-4xl font-bold">
              Redefining yields on <span className="text-gray-400">MoveVM</span>
            </h1>
            <p className="text-lg text-gray-400">
              Lend, Borrow & Access Leveraged Yield Strategies with Liquidity Anchors
            </p>
          </div>
          
          {/* Right Side - APR display and input box */}
          <div className="md:w-1/3 space-y-4">
            {/* <div className="text-right">
              <h2 className="text-3xl font-bold">
                Earn upto <span className="italic">44.84% APR</span>
              </h2>
              <p className="text-xl">on APTOS</p>
            </div> */}
            
            {/* Top Strategy Card - White Box */}
            {/* <div className="bg-black rounded-lg p-6 text-white border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-300">sA</span>
                </div>
                <div>
                  <div className="font-bold">stAPT/APT Looping Strategy</div>
                  <div className="text-sm text-gray-400">Top Performing Strategy</div>
                </div>
              </div>
              
              <div className="text-gray-400 text-sm">1.76 APT</div>
              <div className="text-2xl font-bold">$10</div>
            </div> */}
            
            {/* Input Box - Like in Image 2 */}
            <div className="bg-black rounded-lg p-6 text-white border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">{inputAmount} APT</div>
              <div className="relative">
                <span className="absolute left-0 top-0 text-2xl font-bold">$</span>
                <input
                  type="text"
                  value={inputAmount === '0.00' ? '0.00' : inputAmount}
                  onChange={handleInputChange}
                  className="w-full text-2xl font-bold pl-6 focus:outline-none bg-black text-white"
                />
              </div>
            </div>
            
            {/* Earn Button */}
            <button className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-lg transition-colors text-xl">
              Earn
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8">
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'earn' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('earn')}
          >
            Earn
          </button>
          <button 
            className={`px-6 py-3 text-lg font-medium ${activeTab === 'history' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {activeTab === 'earn' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Redefining yields on MoveVM</h2>
                <p className="text-gray-400 mt-1">Lend, Borrow & Access Leveraged Yield Strategies with Liquidity Anchors</p>
              </div>
              <div className="flex space-x-4">
                {/* <button className="px-6 py-2 rounded-lg bg-black border border-white/10 hover:bg-white/10 transition-colors text-white">
                  My Investments
                </button>
                <button className="px-6 py-2 rounded-lg bg-white hover:bg-gray-100 text-black transition-colors flex items-center">
                  <span className="text-xl mr-2">+</span> Create Strategy
                </button> */}
              </div>
            </div>
            
            {/* Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <div 
                  key={strategy.id} 
                  className="bg-black border border-white/10 rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                          {strategy.abbr}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-bold">{strategy.name}</h3>
                          <p className="text-sm text-gray-400">{strategy.tag}</p>
                          {strategy.subtitle && (
                            <p className="text-sm text-gray-400">{strategy.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-400 font-bold">{strategy.apy}</span>
                        <Info className="h-4 w-4 text-gray-400 ml-1" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <p className="text-sm text-gray-400">Invested</p>
                        <p className="font-bold">{strategy.invested} APT</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Value</p>
                        <p className="font-bold">{strategy.value}</p>
                      </div>
                    </div>
                    
                    <button className="w-full p-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                      {strategy.invested > 0 ? 'Manage' : 'Earn'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-black border border-white/10 rounded-lg p-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No transaction history yet</h3>
              <p className="text-gray-400">Your Smart Pool transaction history will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartPool;