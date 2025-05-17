// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {method: string; params?: any[]}) => Promise<any>;
      isMetaMask?: boolean;
      selectedAddress?: string;
    };
  }
}

import { createWeb3Name } from '@web3-name-sdk/core';
import { createPublicClient, http, getAddress as formatAddress } from 'viem';

// Define interfaces
interface GetAddressOptions {
  coinType?: number;
  chainId?: number;
  rpcUrl?: string;
  timeout?: number;
}

// Mapping for chainId to coinType (based on SLIP-0044 standard)
const chainIdToCoinType = (chainId: number): number => {
  // Map of chain IDs to coin types
  const coinTypeMap: Record<number, number> = {
    0: 0,    // Bitcoin
    1: 60,   // Ethereum
    56: 60,  // BNB Chain
    42161: 60, // Arbitrum
    100: 60, // Gnosis
    169: 60, // Manta
    34443: 60, // Mode
    42766: 60, // ZKFair
    1890: 60,  // LightLink
    4200: 60,  // Merlin
    167000: 60, // Taiko
    10241024: 60, // AlienX
    185: 60,  // Mint
    2649: 60, // AILayer
    2818: 60, // Morph
    5545: 60, // DuckChain
    1625: 60, // Gravity
    1514: 60, // Story
    501: 501, // Solana
  };
  
  return coinTypeMap[chainId] || 60; // Default to 60 (EVM) if not found
};

// Supported chains for domain resolution
const SUPPORTED_CHAINS = [
  { name: 'BNB Chain',      chainId: 56,       coinType: 60, nativeDomains: ['.bnb'],      rpcUrl: 'https://bnb-mainnet.g.alchemy.com/v2/b20Yg4jZMHRLeuzNknS1pSAgta1Plerw' },
  { name: 'Ethereum',       chainId: 1,        coinType: 60, nativeDomains: ['.eth'],      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/b20Yg4jZMHRLeuzNknS1pSAgta1Plerw' },
  { name: 'Arbitrum One',   chainId: 42161,    coinType: 60, nativeDomains: ['.arb'],      rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  { name: 'Gnosis',         chainId: 100,      coinType: 60, nativeDomains: ['.gno'],      rpcUrl: 'https://gnosis-mainnet.g.alchemy.com/v2/b20Yg4jZMHRLeuzNknS1pSAgta1Plerw' },
  { name: 'Manta Pacific',  chainId: 169,      coinType: 60, nativeDomains: ['.manta'],    rpcUrl: 'https://lb.drpc.org/ogrpc?network=manta-pacific&dkey=Ag44dFpTPEUPgwqH3VO5e3X6X202G58R8LPAFoHUp5S4' },
  { name: 'Mode',           chainId: 34443,    coinType: 60, nativeDomains: ['.mode'],     rpcUrl: 'https://lb.drpc.org/ogrpc?network=mode&dkey=Ag44dFpTPEUPgwqH3VO5e3X6X202G58R8LPAFoHUp5S4' },
  { name: 'ZKFair',         chainId: 42766,    coinType: 60, nativeDomains: ['.zfk'],      rpcUrl: 'https://rpc.zkfair.io' },
  { name: 'LightLink Phoenix',chainId: 1890,    coinType: 60, nativeDomains: ['.ll'],       rpcUrl: 'https://replicator.phoenix.lightlink.io/rpc/v1' },
  { name: 'ZetaChain',      chainId: 7000,     coinType: 60, nativeDomains: ['.zeta'],     rpcUrl: 'https://lb.drpc.org/ogrpc?network=zeta-chain&dkey=Ag44dFpTPEUPgwqH3VO5e3X6X202G58R8LPAFoHUp5S4' },
  { name: 'Merlin',         chainId: 4200,     coinType: 60, nativeDomains: ['.merlin'],   rpcUrl: 'https://lb.drpc.org/ogrpc?network=merlin&dkey=Ag44dFpTPEUPgwqH3VO5e3X6X202G58R8LPAFoHUp5S4' },
  { name: 'Taiko Alethia',  chainId: 167000,   coinType: 60, nativeDomains: ['.taiko'],    rpcUrl: 'https://lb.drpc.org/ogrpc?network=taiko&dkey=Ag44dFpTPEUPgwqH3VO5e3X6X202G58R8LPAFoHUp5S4' },
  { name: 'AlienX',         chainId: 10241024, coinType: 60, nativeDomains: ['.alien'],    rpcUrl: 'https://rpc.alienxchain.io/http' },
  { name: 'Mint',           chainId: 185,      coinType: 60, nativeDomains: ['.mint'],     rpcUrl: 'https://asia.rpc.mintchain.io' },
  { name: 'AILayer',        chainId: 2649,     coinType: 60, nativeDomains: ['.ail'],      rpcUrl: 'https://mainnet-rpc.ailayer.xyz' },
  { name: 'Morph',          chainId: 2818,     coinType: 60, nativeDomains: ['.mph'],      rpcUrl: 'https://rpc-quicknode.morphl2.io' },
  { name: 'DuckChain',      chainId: 5545,     coinType: 60, nativeDomains: ['.duck'],     rpcUrl: 'https://rpc.duckchain.io' },
  { name: 'Gravity Alpha',  chainId: 1625,     coinType: 60, nativeDomains: ['.g'],        rpcUrl: 'https://rpc.ankr.com/gravity' },
  { name: 'Story',          chainId: 1514,     coinType: 60, nativeDomains: ['.ip'],       rpcUrl: 'https://evm-rpc.story.mainnet.dteam.tech' },

];

// Payment ID chain types
const PAYMENT_ID_CHAINS = [
  { type: 'btc', name: 'Bitcoin', id: 0 },
  { type: 'evm', name: 'Ethereum', id: 1 },
  { type: 'sol', name: 'Solana', id: 2 },
  { type: 'tron', name: 'Tron', id: 3 },

];

// Constants for record keys - aligned with coin types
const COMMON_CHAINS = [
  { name: 'BNB Chain', recordKeys: ['address.60', 'crypto.BNB', 'crypto.BSC'] },
  { name: 'Ethereum', recordKeys: ['address.60', 'crypto.ETH'] },
  { name: 'Arbitrum One', recordKeys: ['address.60', 'crypto.ARB'] },
  { name: 'Bitcoin', recordKeys: ['address.0', 'crypto.BTC'] },
  { name: 'Solana', recordKeys: ['address.501', 'crypto.SOL'] },
];

// Initialize SDK
const web3Name = createWeb3Name();

// Helper function to check for empty addresses
const isEmptyAddress = (address: string | null): boolean => {
  if (!address) return true;
  return address === '0x' || address === '0x0000000000000000000000000000000000000000' || address === '';
};

// Helper function to get native chain for a domain
const getNativeChain = (domain: string): { name: string; chainId: number } | null => {
  const tld = domain.toLowerCase().match(/\.[a-z]+$/i)?.[0];
  if (!tld) return null;
  const chain = SUPPORTED_CHAINS.find(c => c.nativeDomains.includes(tld));
  if (chain) {
    console.log(`Domain ${domain} has native chain: ${chain.name} with TLD ${tld}`);
  }
  return chain ? { name: chain.name, chainId: chain.chainId } : null;
};

// Helper function to detect if input is a Payment ID
const isPaymentId = (input: string): boolean => {
  return input.includes('@');
};

// Helper function to format addresses for display based on chain type - simplified version
const formatAddressForDisplay = (address: string | Uint8Array | Buffer, chainType: string): string => {
  try {
    if (!address) return '';
    
    // Process based on chain type
    switch (chainType) {
      case 'sol':
        // Solana addresses are base58 encoded strings
        return typeof address === 'string' ? address : '';
        
      case 'btc':
        // Bitcoin addresses are specialized strings
        return typeof address === 'string' ? address : '';
        
      case 'evm':
      case 'tron':
      default:
        // EVM addresses should be checksummed
        const hex = typeof address === 'string' && address.startsWith('0x') ? 
          address : address.toString();
        return hex.startsWith('0x') ? formatAddress(hex) : hex;
    }
  } catch (error) {
    console.error(`Error formatting address for ${chainType}:`, error);
    return typeof address === 'string' ? address : '';
  }
};

// Service
export const Web3NameService = {
  // Verify wallet matches any resolved address for PaymentID
  verifyWalletForPaymentId: async (paymentId: string): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        console.error('No wallet extension detected');
        return false;
      }
      
      // Get user's connected wallet address
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        console.error('No wallet accounts available');
        return false;
      }
      
      const userAddress = accounts[0].toLowerCase();
      
      // Get a preliminary set of addresses for this PaymentID
      const preliminaryAddresses = await Promise.all(
        PAYMENT_ID_CHAINS.map(async ({ type, name }) => {
          try {
            const url = `https://nameapi.space.id/getPaymentIdName/${encodeURIComponent(paymentId)}/${type}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === 0 && data.address && !isEmptyAddress(data.address)) {
              return { chain: name, address: data.address.toLowerCase() };
            }
            return null;
          } catch (error) {
            console.error(`Error in preliminary check for ${name}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls and check if any address matches user's wallet
      const validAddresses = preliminaryAddresses.filter(item => item !== null);
      
      // Check for any matching address
      const matchingAddress = validAddresses.find(item => 
        item?.address === userAddress || 
        (item?.address.startsWith('0x') && formatAddress(item.address) === formatAddress(userAddress))
      );
      
      if (matchingAddress) {
        // Get signature as proof of ownership
        const message = `Verify ownership of Payment ID: ${paymentId}`;
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, userAddress]
        });
        
        // Store verification in session to avoid re-signing
        sessionStorage.setItem(`verified_paymentid_${paymentId}`, 'true');
        
        return true;
      } else {
        console.error('Verification failed - user wallet does not match any PaymentID address');
        return false;
      }
    } catch (error) {
      console.error('Error verifying wallet for PaymentID:', error);
      return false;
    }
  },

  // Get cryptocurrency address for a domain for a specific chain
  getAddress: async (domain: string, options: GetAddressOptions = {}): Promise<string | null> => {
    try {
      if (!domain) return null;

      const getAddressOptions: any = {};
      if (options.timeout) getAddressOptions.timeout = options.timeout;
      if (options.rpcUrl) getAddressOptions.rpcUrl = options.rpcUrl;
      
      // Convert chainId to coinType if chainId is provided
      if (options.chainId !== undefined) {
        getAddressOptions.coinType = chainIdToCoinType(options.chainId);
        console.log(`Resolving ${domain} for chainId ${options.chainId} with coinType ${getAddressOptions.coinType}`);
      } else if (options.coinType !== undefined) {
        getAddressOptions.coinType = options.coinType;
        console.log(`Resolving ${domain} for coinType ${options.coinType}`);
      }

      const address = await web3Name.getAddress(domain, getAddressOptions);
      if (address && !isEmptyAddress(address)) {
        if (options.chainId) {
          console.log(`Found address ${address} for ${domain} on chainId ${options.chainId}`);
        } else if (options.coinType) {
          console.log(`Found address ${address} for ${domain} with coinType ${options.coinType}`);
        }
        return address;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching address for ${domain}:`, error);
      return null;
    }
  },

  // Fetch a specific record for a domain
  getDomainRecord: async (domain: string, key: string): Promise<string | null> => {
    try {
      const record = await web3Name.getDomainRecord({ name: domain, key });
      if (record) {
        return record;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching record for ${domain} with key ${key}:`, error);
      return null;
    }
  },

  // Get all records for a domain
  getRecordsForDomain: async (domain: string): Promise<Record<string, string>> => {
    const records: Record<string, string> = {};
    // Build list of all record keys: social, crypto.*, and address.<chainId>
    const socialKeys = ['avatar','description','email','url','twitter','discord','github','reddit','telegram','instagram','contentHash'];
    const cryptoKeys = Array.from(new Set(COMMON_CHAINS.flatMap(c => c.recordKeys).filter(k => k.startsWith('crypto.'))));
    const addressKeys = SUPPORTED_CHAINS.map(c => `address.${c.chainId}`);
    const allKeys = Array.from(new Set([...socialKeys, ...cryptoKeys, ...addressKeys]));
    // Fetch all configured text records via SDK only
    const recordPromises = allKeys.map(async (recordKey) => {
      try {
        const value = await web3Name.getDomainRecord({ name: domain, key: recordKey });
        if (value && value.trim() && !isEmptyAddress(value)) {
          return { key: recordKey, value: value.trim() };
        }
      } catch {
        // ignore missing or error
      }
      return null;
    });
    const results = await Promise.allSettled(recordPromises);
    
    // Process results
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        records[result.value.key] = result.value.value;
      }
    });
    
    return records;
  },

  // Get all available chain addresses for a domain or Payment ID
  getAllAddresses: async (input: string): Promise<Record<string, string>> => {
    console.log(`Getting all addresses for ${input}`);
    
    const finalAddresses: Record<string, string> = {};
    
    try {
      // Check if input is a Payment ID
      if (isPaymentId(input)) {
        console.log(`Resolving Payment ID: ${input}`);
        // Process PaymentID by fetching addresses for each chain type
        const paymentAddresses = await Promise.all(
          PAYMENT_ID_CHAINS.map(async ({ type, name }) => {
            try {
              const url = `https://nameapi.space.id/getPaymentIdName/${encodeURIComponent(input)}/${type}`;
              const response = await fetch(url);
              const data = await response.json();
              
              if (data.code === 0 && data.address && !isEmptyAddress(data.address)) {
                return { chain: name, address: data.address };
              }
              return null;
            } catch (error) {
              console.error(`Error fetching ${name} address for Payment ID ${input}:`, error);
              return null;
            }
          })
        );

        // Add valid payment addresses to the final result
        paymentAddresses.filter(Boolean).forEach(item => {
          if (item && item.address) {
            finalAddresses[item.chain] = item.address;
          }
        });
        
        console.log(`Final addresses resolved for Payment ID ${input}:`, finalAddresses);
        return finalAddresses;
      }
      
      // Check if the input is already a wallet address
      const isAddress = input.startsWith('0x') && input.length === 42;
      if (isAddress) {
        console.log(`Input is wallet address: ${input}`);
        const formattedAddress = formatAddress(input);
        finalAddresses['Ethereum'] = formattedAddress;
        finalAddresses['Polygon'] = formattedAddress;
        finalAddresses['BNB Chain'] = formattedAddress;
        finalAddresses['Arbitrum One'] = formattedAddress;
        finalAddresses['Avalanche C-Chain'] = formattedAddress;
        finalAddresses['Optimism'] = formattedAddress;
        finalAddresses['Base'] = formattedAddress;
        finalAddresses['zkSync Era'] = formattedAddress;
        return finalAddresses;
      }
      
      // Check Web3 Name validity - simplified validation
      if (!input || input.trim() === '') {
        console.log('Empty input provided');
        return finalAddresses;
      }
      
      // Simple validation that the domain has at least one dot and no spaces
      if (!input.includes('.') || input.includes(' ')) {
        console.log(`Invalid Web3 Name format: ${input}`);
        return finalAddresses;
      }
      
      // Resolve on-chain first, then fallback to per-chain text records
      const chainPromises = SUPPORTED_CHAINS.map(async (chain) => {
        // 1) Attempt on-chain resolution via SDK
        try {
          const onchain = await Web3NameService.getAddress(input, { chainId: chain.chainId, rpcUrl: chain.rpcUrl });
          if (onchain && !isEmptyAddress(onchain)) {
            finalAddresses[chain.name] = formatAddress(onchain);
            console.log(`On-chain resolved ${chain.name}: ${finalAddresses[chain.name]}`);
            return;
          }
        } catch {
          // ignore on-chain errors
        }
        // 2) Fallback: fetch text-records from the same chain's resolver
        const client = createWeb3Name({ rpcUrl: chain.rpcUrl });
        const commonDef = COMMON_CHAINS.find(c => c.name === chain.name) || { recordKeys: [] };
        const recordKeys = [`address.${chain.chainId}`, ...commonDef.recordKeys, `address.${chain.coinType}`];
        for (const key of recordKeys) {
          try {
            const rec = await client.getDomainRecord({ name: input, key });
            if (rec && !isEmptyAddress(rec)) {
              finalAddresses[chain.name] = formatAddress(rec);
              console.log(`Text-record resolved ${chain.name} (${key}): ${finalAddresses[chain.name]}`);
              return;
            }
          } catch {
            // no record or error
          }
        }
      });
      await Promise.all(chainPromises);
       
      console.log(`Final addresses resolved for ${input}:`, finalAddresses);
      return finalAddresses;  
    } catch (error) {
      console.error(`Error in getAllAddresses for ${input}:`, error);
      return finalAddresses;
    }
  },

  // Get email addresses for a domain
  getEmailAddresses: async (domain: string): Promise<string[]> => {
    try {
      const emails: string[] = [];
      const processedEmails = new Set<string>(); // Track processed emails to avoid duplicates
      
      // Try to get the email text record directly
      try {
        const emailRecord = await web3Name.getDomainRecord({ name: domain, key: 'email' });
        if (emailRecord && emailRecord.trim()) {
          emails.push(emailRecord.trim());
          processedEmails.add(emailRecord.trim());
        }
      } catch (error) {
        // Continue if error
      }
      
      // Try to get additional email records that might be formatted differently
      try {
        // Some domains use numbered email records (email.1, email.2, etc.)
        for (let i = 1; i <= 5; i++) {
          try {
            const additionalEmail = await web3Name.getDomainRecord({ name: domain, key: `email.${i}` });
            if (additionalEmail && additionalEmail.trim() && !processedEmails.has(additionalEmail.trim())) {
              emails.push(additionalEmail.trim());
              processedEmails.add(additionalEmail.trim());
            }
          } catch (error) {
            // Stop if we hit an error - likely means no more numbered records
            break;
          }
        }
      } catch (error) {
        // Continue if error
      }
      
      // Check for other email-related keys from all records
      try {
        const allRecords = await Web3NameService.getRecordsForDomain(domain);
        for (const [key, value] of Object.entries(allRecords)) {
          // Look for any keys that might contain email addresses
          if ((key.includes('email') || key.includes('mail')) && 
              typeof value === 'string' && 
              value.trim() && 
              !processedEmails.has(value.trim())) {
            emails.push(value.trim());
            processedEmails.add(value.trim());
          }
        }
      } catch (error) {
        // Continue if error
      }
      
      return emails;
    } catch (error) {
      console.error(`Error retrieving email addresses for ${domain}:`, error);
      return [];
    }
  },
  
  // Resolve both emails and crypto addresses - optimized to resolve emails first
  resolveAllRecords: async (input: string): Promise<{
    cryptoAddresses: Record<string, string>;
    emailAddresses: string[];
  }> => {
    try {
      // First get all email addresses (only for domains, not for Payment IDs)
      const emailAddresses = isPaymentId(input) ? [] : await Web3NameService.getEmailAddresses(input);
      
      // Then get all crypto addresses
      const cryptoAddresses = await Web3NameService.getAllAddresses(input);
      
      return {
        cryptoAddresses,
        emailAddresses
      };
    } catch (error) {
      console.error(`Error resolving all records for ${input}:`, error);
      return {
        cryptoAddresses: {},
        emailAddresses: []
      };
    }
  }
};