export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function createOrderId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NM-${new Date().getFullYear()}-${suffix}`;
}

export function getDeliveryWindow(speed = 'standard') {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  const offset = speed === 'express' ? 2 : 5;
  start.setDate(now.getDate() + offset);
  end.setDate(now.getDate() + offset + 2);

  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

export async function requestWalletConnection(providerType = 'any') {
  // If user explicitly requests demo or testing mode
  if (providerType === 'demo') {
    const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      address: `0x${hex}`,
      chainId: '0x1',
      walletType: 'Demo Wallet',
    };
  }

  // Check dedicated Coinbase wallet extension
  if (providerType === 'coinbase' && typeof window !== 'undefined' && window.coinbaseWalletExtension) {
    try {
      const accounts = await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
      const chainId = await window.coinbaseWalletExtension.request({ method: 'eth_chainId' });
      return {
        address: Array.isArray(accounts) ? accounts[0] : '',
        chainId: String(chainId || '0x1'),
        walletType: 'Coinbase Wallet',
      };
    } catch (err) {
      throw err;
    }
  }

  // Check window.ethereum or multi-provider list (EIP-6963 / MetaMask / Coinbase)
  if (typeof window !== 'undefined' && window.ethereum) {
    let targetProvider = window.ethereum;

    if (Array.isArray(window.ethereum.providers)) {
      if (providerType === 'metamask') {
        targetProvider = window.ethereum.providers.find((p) => p.isMetaMask) || window.ethereum;
      } else if (providerType === 'coinbase') {
        targetProvider = window.ethereum.providers.find((p) => p.isCoinbaseWallet) || window.ethereum;
      }
    }

    try {
      const accounts = await targetProvider.request({ method: 'eth_requestAccounts' });
      const chainId = await targetProvider.request({ method: 'eth_chainId' });
      const address = Array.isArray(accounts) ? accounts[0] : '';
      if (address) {
        return {
          address,
          chainId: String(chainId || '0x1'),
          walletType: providerType === 'coinbase' ? 'Coinbase' : providerType === 'metamask' ? 'MetaMask' : 'Web3 Wallet',
        };
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
        throw new Error('REJECTED');
      }
      throw err;
    }
  }

  // Fallback demo for browsers/environments without wallet extensions
  const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return {
    address: `0x71C8${hex.slice(4)}`,
    chainId: '0x1',
    walletType: providerType === 'coinbase' ? 'Coinbase (Simulated)' : 'MetaMask (Simulated)',
  };
}

