import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import { AptosClient, Types } from 'aptos';
import axios from 'axios';

interface CreateDCAFormProps {
  walletAddress: string | null;
  userId: string | null;
  apiBaseUrl?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(NODE_URL);
const USDC_ADDRESS = '0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDC';
const ACTUAL_DESTINATION = '0x283260059ebaaf32f3a75ac14b20f1782c76c4c896cd7bb280467b4f9fc4cc85'; // Replace with your actual destination address

const mapRiskLevel = (risk: string) => {
  switch (risk) {
    case 'low': return 'low_risk';
    case 'medium': return 'medium_risk';
    case 'high': return 'high_risk';
    default: return 'no_risk';
  }
};

const CreateDCAForm: React.FC<CreateDCAFormProps> = ({
  walletAddress,
  userId,
  apiBaseUrl = "http://localhost:3000/api",
  onSuccess,
  onCancel
}) => {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    frequency: '1',
    unit: 'days',
    risk: 'low',
    toAddress: ACTUAL_DESTINATION // Pre-fill with actual destination
  });

  useEffect(() => {
    const fetchUserId = async () => {
      if (connected && account?.address) {
        try {
          if (userId) {
            setCurrentUserId(userId);
            return;
          }
          const address = account.address.toString();
          const response = await axios.post(`${apiBaseUrl}/users`, { address });
          if (response.data && response.data._id) {
            setCurrentUserId(response.data._id);
            localStorage.setItem('userId', response.data._id);
          } else {
            throw new Error('Failed to get user ID from response');
          }
        } catch (error) {
          console.error('Error fetching user ID:', error);
          setError('Failed to retrieve user data. Please try again.');
        }
      } else {
        setCurrentUserId(null);
      }
    };
    fetchUserId();
  }, [connected, account, userId, apiBaseUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const createDCAPlan = async (transactionHash: string) => {
    try {
      if (!currentUserId) throw new Error("User ID not available. Please connect your wallet.");
      const frequencyValue = formData.unit === "minutes" ? "minute" : formData.unit === "hours" ? "hour" : "day";
      const apiData = {
        userId: currentUserId,
        amount: parseFloat(formData.amount),
        frequency: frequencyValue,
        interval: parseInt(formData.frequency),
        toAddress: ACTUAL_DESTINATION,
        riskLevel: mapRiskLevel(formData.risk),
        transactionHash,
        tokenDenom: USDC_ADDRESS,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setTxStatus("Creating DCA plan on the server...");
      const response = await axios.post(`${apiBaseUrl}/dca/plans`, apiData);
      console.log("DCA plan created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating DCA plan:", error);
      throw new Error(axios.isAxiosError(error) && error.response ? error.response.data.error : "Failed to create DCA plan");
    }
  };

  const executeTransaction = async (amount: number, destinationAddress: string): Promise<string> => {
    if (!account?.address || !signAndSubmitTransaction) throw new Error("Wallet not connected properly");
    setTxStatus("Preparing transaction...");

    // USDC on Aptos Devnet uses 6 decimals
    const amountInSmallestUnit = Math.floor(amount * 1000000).toString(); // 6 decimals for USDC

    const payload: Types.TransactionPayload = {
      type: 'entry_function_payload',
      function: '0x1::coin::transfer',
      type_arguments: [USDC_ADDRESS],
      arguments: [destinationAddress, amountInSmallestUnit]
    };

    setTxStatus("Please approve the transaction in your wallet...");
    const response = await signAndSubmitTransaction(payload);
    if (!response.hash) throw new Error("Transaction submission failed");

    setTxStatus("Sending transaction to Aptos Devnet...");
    await aptosClient.waitForTransaction(response.hash);
    console.log("Transaction confirmed with hash:", response.hash);
    return response.hash;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setTxStatus(null);
    setTxHash(null);

    try {
      if (!formData.amount || parseFloat(formData.amount) <= 0) throw new Error("Please enter a valid amount");
      if (!currentUserId) throw new Error("Please connect your wallet before creating a DCA plan");

      setTxStatus("Initiating transaction...");
      const transactionHash = await executeTransaction(parseFloat(formData.amount), ACTUAL_DESTINATION);
      setTxHash(transactionHash);

      setTxStatus("Transaction completed. Creating DCA plan...");
      await createDCAPlan(transactionHash);

      setSuccess("Transaction completed and DCA plan created successfully!");
      setFormData({ amount: '', frequency: '1', unit: 'days', risk: 'low', toAddress: ACTUAL_DESTINATION });

      if (onSuccess) setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      console.error("Error:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
      setTxStatus(null);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-semibold">Schedule USDC Transfer</h3>
        <p className="text-sm text-gray-400">Set up your recurring USDC transfer</p>
      </div>
      <div className="p-6">
        {success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{success}</h3>
            <p className="text-gray-400 mb-3">Your USDC DCA plan has been created and will run according to your schedule.</p>
            {txHash && (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Transaction Reference:</p>
                <p className="text-blue-400 break-all">{txHash}</p>
              </div>
            )}
            <button
              onClick={() => onSuccess ? onSuccess() : null}
              className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              View Your Plans
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-medium text-white">Amount per Transfer</label>
                <input
                  id="amount"
                  placeholder="0.0"
                  type="number"
                  step="0.000001"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:ring-2 focus:ring-white/20 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="token" className="block text-sm font-medium text-white">Token</label>
                <input
                  id="token"
                  placeholder="USDC"
                  value="USDC"
                  readOnly
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:ring-2 focus:ring-white/20 focus:border-transparent cursor-not-allowed opacity-70"
                />
                <p className="text-xs text-gray-400 truncate">{USDC_ADDRESS}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="frequency" className="block text-sm font-medium text-white">Frequency</label>
                <input
                  id="frequency"
                  placeholder="1"
                  type="number"
                  min="1"
                  required
                  value={formData.frequency}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:ring-2 focus:ring-white/20 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="unit" className="block text-sm font-medium text-white">Unit</label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:ring-2 focus:ring-white/20 focus:border-transparent"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="risk" className="block text-sm font-medium text-white">Risk Level</label>
              <select
                id="risk"
                value={formData.risk}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:ring-2 focus:ring-white/20 focus:border-transparent"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <p className="text-sm text-gray-400">Choose your preferred risk level for this investment plan</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="toAddress" className="block text-sm font-medium text-white">Destination Address</label>
              <input
                id="toAddress"
                placeholder="Destination wallet address"
                required
                value={formData.toAddress}
                readOnly
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:ring-2 focus:ring-white/20 focus:border-transparent font-mono cursor-not-allowed opacity-70"
              />
              <p className="text-sm text-gray-400">USDC will be sent to this address</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !connected || !currentUserId}
                className="w-full sm:w-auto bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                    {txStatus || "Scheduling plans..."}
                  </>
                ) : (
                  "Schedule plan"
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-950/50 text-red-300 border border-red-800 rounded-md text-sm">{error}</div>
            )}
            {!connected && !error && (
              <div className="mt-4 p-3 bg-blue-950/50 text-blue-300 border border-blue-800 rounded-md text-sm">Please connect your wallet to create a DCA plan.</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDCAForm;