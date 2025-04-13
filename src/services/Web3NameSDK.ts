
import { Web3Name } from '@web3-name-sdk/core';

// Initialize the SDK (defaulting to BNB Chain)
const web3Name = new Web3Name({
  bnb: {
    // Default to mainnet
    network: 'mainnet'
  }
});

interface GetAddressOptions {
  coinType: number;
}

// Service to interact with the Web3 Name SDK
export const Web3NameService = {
  // Get the email record for a domain
  getEmail: async (domain: string): Promise<string | null> => {
    try {
      const result = await web3Name.getDomainRecord(domain, 'email');
      return result || null;
    } catch (error) {
      console.error('Error fetching email for domain:', error);
      return null;
    }
  },

  // Get cryptocurrency address for a domain and coin type
  getAddress: async (domain: string, options: GetAddressOptions): Promise<string | null> => {
    try {
      const result = await web3Name.getAddress(domain, options);
      return result || null;
    } catch (error) {
      console.error(`Error fetching address for domain with coin type ${options.coinType}:`, error);
      return null;
    }
  },

  // Get all available coin addresses for a domain
  getAllAddresses: async (domain: string): Promise<Record<string, string>> => {
    // Define common coin types with their names
    const coinTypes = [
      { name: 'Bitcoin', coinType: 0 },
      { name: 'Litecoin', coinType: 2 },
      { name: 'Dogecoin', coinType: 3 },
      { name: 'Ethereum', coinType: 60 },
      { name: 'BNB Smart Chain', coinType: 60, prefix: '0x' }, // BSC uses Ethereum's coin type
      { name: 'BNB Chain', coinType: 714 },
      { name: 'Polkadot', coinType: 354 },
      { name: 'Solana', coinType: 501 },
      { name: 'Avalanche', coinType: 9000 },
      { name: 'Polygon', coinType: 966 }
    ];

    const addresses: Record<string, string> = {};
    
    await Promise.all(
      coinTypes.map(async ({ name, coinType }) => {
        try {
          const address = await Web3NameService.getAddress(domain, { coinType });
          if (address) {
            addresses[name] = address;
          }
        } catch (error) {
          // Silently fail for individual address lookups
        }
      })
    );

    return addresses;
  }
};
