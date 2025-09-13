import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/avalanche';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusBadge = (status?: number) => {
    if (status === undefined) return null;
    return (
      <Badge variant={status === 1 ? "default" : "destructive"}>
        {status === 1 ? "Success" : "Failed"}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm font-mono">
            {formatAddress(transaction.hash)}
          </span>
          <div className="flex items-center gap-2">
            {getStatusBadge(transaction.status)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(transaction.hash, 'hash')}
            >
              {copiedField === 'hash' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://snowtrace.io/tx/${transaction.hash}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{formatAddress(transaction.from)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.from, 'from')}
              >
                {copiedField === 'from' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">To</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {transaction.to ? formatAddress(transaction.to) : 'Contract Creation'}
              </span>
              {transaction.to && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transaction.to!, 'to')}
                >
                  {copiedField === 'to' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Value</p>
            <p className="font-semibold">{transaction.value} AVAX</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Block</p>
            <p className="font-mono">{transaction.blockNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Gas Price</p>
            <p className="text-sm">{transaction.gasPrice} Gwei</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Timestamp</p>
            <p className="text-sm">{formatDate(transaction.timestamp)}</p>
          </div>
        </div>

        {transaction.gasUsed && (
          <div>
            <p className="text-sm text-muted-foreground">Gas Used</p>
            <p className="text-sm">{parseInt(transaction.gasUsed).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}