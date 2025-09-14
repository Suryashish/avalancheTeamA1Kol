import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import type { Transaction, DetailedTransaction, AvalancheService } from '@/lib/avalanche';
import { TransactionDetails } from './TransactionDetails';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Hash,
  Wallet,
  Eye
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
  avalancheService: AvalancheService;
}

export function TransactionTable({ transactions, title = "Transactions", avalancheService }: TransactionTableProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDetails, setShowDetails] = useState(false);
  const [detailedTransaction, setDetailedTransaction] = useState<DetailedTransaction | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatValue = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue === 0) return '0';
    if (numValue < 0.001) return '<0.001';
    return numValue.toFixed(4);
  };

  const handleViewDetails = async (transactionHash: string) => {
    setLoading(transactionHash);
    try {
      const detailed = await avalancheService.getDetailedTransaction(transactionHash);
      if (detailed) {
        setDetailedTransaction(detailed);
        setShowDetails(true);
      } else {
        console.error('Failed to fetch detailed transaction');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusBadge = (status?: number) => {
    if (status === undefined) return null;
    return (
      <Badge 
        variant={status === 1 ? "default" : "destructive"}
        className={status === 1 ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {status === 1 ? "Success" : "Failed"}
      </Badge>
    );
  };

  const getValueIndicator = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue === 0) return null;
    return numValue > 1 ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-orange-500" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {title}
          <Badge variant="outline" className="ml-auto">
            {transactions.length} transactions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('hash')}
                >
                  <div className="flex items-center gap-2">
                    Transaction Hash
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>From / To</TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center gap-2">
                    Value (AVAX)
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('blockNumber')}
                >
                  <div className="flex items-center gap-2">
                    Block
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Age
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.hash} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {formatHash(transaction.hash)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.hash, `hash-${transaction.hash}`)}
                      >
                        {copiedField === `hash-${transaction.hash}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                          {formatAddress(transaction.from)}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">→</span>
                        <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                          {transaction.to ? formatAddress(transaction.to) : 'Contract'}
                        </code>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getValueIndicator(transaction.value)}
                      <span className="font-mono font-semibold">
                        {formatValue(transaction.value)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      #{transaction.blockNumber.toLocaleString()}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(transaction.timestamp)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction.hash)}
                        disabled={loading === transaction.hash}
                        title="View Details"
                      >
                        {loading === transaction.hash ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://snowtrace.io/tx/${transaction.hash}`, '_blank')}
                        title="View on Snowtrace"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {transactions.length === 0 && (
          <div className="text-center py-8">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </CardContent>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        {detailedTransaction && (
          <TransactionDetails
            transaction={detailedTransaction}
            onBack={() => setShowDetails(false)}
          />
        )}
      </Dialog>
    </Card>
  );
}