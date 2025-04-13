
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DomainSearchProps {
  onSearch: (domain: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const DomainSearch: React.FC<DomainSearchProps> = ({ 
  onSearch, 
  isLoading, 
  placeholder = "Enter a domain (e.g. name.bnb)" 
}) => {
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onSearch(domain.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="relative">
        <Input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={placeholder}
          className="pr-20 bg-white/80 backdrop-blur-sm border-web3-purple/20 focus:border-web3-purple"
          aria-label="Domain name"
        />
        <Button 
          type="submit" 
          className="absolute right-0 top-0 bottom-0 rounded-l-none bg-web3-purple hover:bg-web3-purple/90"
          disabled={isLoading || !domain.trim()}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </div>
    </form>
  );
};

export default DomainSearch;
