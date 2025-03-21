import React, { FC, useMemo } from 'react';
import {
  WalletProvider,
  AptosWalletAdapter,
  MartianWalletAdapter,
  PontemWalletAdapter,
  FewchaWalletAdapter,
  RiseWalletAdapter,
} from '@manahippo/aptos-wallet-adapter';

const WalletContext: FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new AptosWalletAdapter(),
      new MartianWalletAdapter(),
      new PontemWalletAdapter(),
      new FewchaWalletAdapter(),
      new RiseWalletAdapter(),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      autoConnect={true}
      onError={(error: Error) => {
        console.error('Wallet error:', error);
      }}
    >
      {children}
    </WalletProvider>
  );
};

export default WalletContext;