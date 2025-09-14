import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionTable } from './TransactionTable';
import type { Transaction, AvalancheService } from '@/lib/avalanche';
import { RefreshCw, Loader2, Activity } from 'lucide-react';

interface LatestTransactionsProps {
  avalancheService: AvalancheService;
}

export function LatestTransactions({ avalancheService }: LatestTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const latestTxs = await avalancheService.getLatestTransactions(10);
      setTransactions(latestTxs);
    } catch (error) {
      console.error('Error fetching latest transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchTransactions(true), 2000);
    
    return () => clearInterval(interval);
  }, [avalancheService]);

  const handleRefresh = () => {
    fetchTransactions(true);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Latest Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <p className="text-muted-foreground">
            Latest transactions on the Avalanche C-Chain
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <TransactionTable 
        transactions={transactions} 
        title="Latest Transactions"
        avalancheService={avalancheService}
      />
    </div>
  );
}