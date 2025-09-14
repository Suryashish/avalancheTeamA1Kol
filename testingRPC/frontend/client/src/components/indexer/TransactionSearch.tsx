import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Hash, AlertCircle } from 'lucide-react';
import { TransactionTable } from './TransactionTable';
import type { Transaction, AvalancheService } from '@/lib/avalanche';

interface TransactionSearchProps {
  avalancheService: AvalancheService;
}

export function TransactionSearch({ avalancheService }: TransactionSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a transaction hash');
      return;
    }

    // Basic validation for transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(searchTerm.trim())) {
      setError('Invalid transaction hash format. Please enter a valid 66-character hash starting with 0x');
      return;
    }

    setLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const tx = await avalancheService.getTransaction(searchTerm.trim());
      if (tx) {
        setTransaction(tx);
      } else {
        setError('Transaction not found. Please verify the hash is correct.');
      }
    } catch (err) {
      setError('Failed to fetch transaction. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setTransaction(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transaction Search</h2>
        <p className="text-muted-foreground">
          Search for specific transactions by hash on the Avalanche C-Chain
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Search Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="0x... (Enter transaction hash)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a 66-character transaction hash starting with 0x
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
              {(transaction || error) && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {transaction && (
        <TransactionTable 
          transactions={[transaction]} 
          title="Transaction Details"
          avalancheService={avalancheService}
        />
      )}
    </div>
  );
}