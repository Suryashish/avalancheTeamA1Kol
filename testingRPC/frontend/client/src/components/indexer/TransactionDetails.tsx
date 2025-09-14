import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DetailedTransaction } from '@/lib/avalanche';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowLeft, 
  Clock, 
  Fuel, 
  Hash, 
  User,
  Send,
  Receipt,
  Code,
  Info,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface TransactionDetailsProps {
  transaction: DetailedTransaction;
  onBack: () => void;
}

export function TransactionDetails({ transaction, onBack }: TransactionDetailsProps) {
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

  const formatAddress = (address: string, full: boolean = false) => {
    if (full) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      full: date.toLocaleString(),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatHex = (hex: string, maxLength: number = 40) => {
    if (hex.length <= maxLength) return hex;
    return `${hex.slice(0, maxLength)}...`;
  };

  const formatNumber = (value: string | number) => {
    return parseInt(value.toString()).toLocaleString();
  };

  const getStatusBadge = (status?: number) => {
    if (status === undefined) return null;
    return (
      <Badge 
        variant={status === 1 ? "default" : "destructive"} 
        className={`text-sm font-medium ${
          status === 1 
            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" 
            : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {status === 1 ? "Success" : "Failed"}
      </Badge>
    );
  };

  const getTransactionTypeBadge = (type: number) => {
    const types = {
      0: { name: "Legacy", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
      1: { name: "EIP-2930", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      2: { name: "EIP-1559", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
    };
    const typeInfo = types[type as keyof typeof types] || { name: "Unknown", color: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge variant="outline" className={`${typeInfo.color} border-0 font-medium`}>
        Type {type} ({typeInfo.name})
      </Badge>
    );
  };

  const CopyableField = ({ 
    label, 
    value, 
    fullValue, 
    field, 
    icon: Icon,
    className = ""
  }: { 
    label: string; 
    value: string; 
    fullValue?: string; 
    field: string;
    icon?: any;
    className?: string;
  }) => (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
        <span className="font-mono text-sm break-all flex-1">{value}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-background"
                onClick={() => copyToClipboard(fullValue || value, field)}
              >
                {copiedField === field ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copiedField === field ? 'Copied!' : 'Copy to clipboard'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const StatCard = ({ 
    label, 
    value, 
    icon: Icon, 
    className = "",
    tooltip 
  }: {
    label: string;
    value: string | React.ReactNode;
    icon: any;
    className?: string;
    tooltip?: string;
  }) => (
    <div className={`p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );

  const dateInfo = formatDate(transaction.timestamp);

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Transaction Details</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {dateInfo.relative} • {dateInfo.full}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(transaction.status)}
            {getTransactionTypeBadge(transaction.type)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://snowtrace.io/tx/${transaction.hash}`, '_blank')}
              className="hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Snowtrace
            </Button>
          </div>
        </div>

        {/* Transaction Hash Card */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <CopyableField
              label="Transaction Hash"
              value={transaction.hash}
              field="hash"
              icon={Hash}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Logs ({transaction.logs.length})
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Value"
                value={`${transaction.value} AVAX`}
                icon={TrendingUp}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
              />
              <StatCard
                label="Block Number"
                value={formatNumber(transaction.blockNumber)}
                icon={Receipt}
              />
              <StatCard
                label="Confirmations"
                value={formatNumber(transaction.confirmations)}
                icon={Check}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
              />
              <StatCard
                label="Transaction Index"
                value={transaction.transactionIndex.toString()}
                icon={Hash}
              />
            </div>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Transaction Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CopyableField
                    label="From Address"
                    value={formatAddress(transaction.from)}
                    fullValue={transaction.from}
                    field="from"
                    icon={User}
                  />
                  <CopyableField
                    label="To Address"
                    value={transaction.to ? formatAddress(transaction.to) : 'Contract Creation'}
                    fullValue={transaction.to || ''}
                    field="to"
                    icon={Send}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Gas Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Gas Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard
                    label="Gas Used"
                    value={formatNumber(transaction.gasUsed || '0')}
                    icon={Fuel}
                    tooltip="Amount of gas consumed by the transaction"
                  />
                  <StatCard
                    label="Gas Limit"
                    value={formatNumber(transaction.gasLimit)}
                    icon={AlertCircle}
                    tooltip="Maximum gas allowed for this transaction"
                  />
                  <StatCard
                    label="Gas Price"
                    value={`${transaction.gasPrice} Gwei`}
                    icon={TrendingUp}
                    tooltip="Price per unit of gas"
                  />
                </div>

                {(transaction.maxFeePerGas || transaction.effectiveGasPrice) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {transaction.maxFeePerGas && (
                        <StatCard
                          label="Max Fee Per Gas"
                          value={`${transaction.maxFeePerGas} Gwei`}
                          icon={TrendingUp}
                          tooltip="Maximum fee per gas unit (EIP-1559)"
                        />
                      )}
                      {transaction.maxPriorityFeePerGas && (
                        <StatCard
                          label="Max Priority Fee"
                          value={`${transaction.maxPriorityFeePerGas} Gwei`}
                          icon={TrendingUp}
                          tooltip="Maximum priority fee per gas unit"
                        />
                      )}
                      {transaction.effectiveGasPrice && (
                        <StatCard
                          label="Effective Gas Price"
                          value={`${transaction.effectiveGasPrice} Gwei`}
                          icon={Check}
                          tooltip="Actual gas price paid"
                        />
                      )}
                    </div>
                  </>
                )}

                <Separator />
                <StatCard
                  label="Cumulative Gas Used"
                  value={formatNumber(transaction.cumulativeGasUsed || '0')}
                  icon={Receipt}
                  tooltip="Total gas used by all transactions in this block up to this transaction"
                />
              </CardContent>
            </Card>

            {/* Transaction Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Transaction Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <StatCard
                    label="Nonce"
                    value={transaction.nonce.toString()}
                    icon={Hash}
                    tooltip="Sequential number of transactions from the sender"
                  />
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Transaction Type</p>
                    </div>
                    {getTransactionTypeBadge(transaction.type)}
                  </div>
                </div>

                {transaction.data && transaction.data !== '0x' && (
                  <CopyableField
                    label="Input Data"
                    value={formatHex(transaction.data, 60)}
                    fullValue={transaction.data}
                    field="data"
                    icon={Code}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {transaction.logs.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No event logs were generated by this transaction. This typically means the transaction didn't interact with any smart contracts that emit events.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found {transaction.logs.length} event log{transaction.logs.length !== 1 ? 's' : ''} from this transaction.
                </p>
                {transaction.logs.map((log, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Event Log #{index}
                        </CardTitle>
                        {log.removed && (
                          <Badge variant="destructive">Removed</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CopyableField
                        label="Contract Address"
                        value={formatAddress(log.address)}
                        fullValue={log.address}
                        field={`log-address-${index}`}
                      />
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Topics ({log.topics.length})
                        </p>
                        <ScrollArea className="h-40 w-full border rounded-lg">
                          <div className="p-3 space-y-2">
                            {log.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                                <Badge variant="outline" className="text-xs font-mono w-8 justify-center">
                                  {topicIndex}
                                </Badge>
                                <span className="font-mono text-xs break-all flex-1">{topic}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(topic, `topic-${index}-${topicIndex}`)}
                                >
                                  {copiedField === `topic-${index}-${topicIndex}` ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      {log.data && log.data !== '0x' && (
                        <CopyableField
                          label="Event Data"
                          value={formatHex(log.data, 60)}
                          fullValue={log.data}
                          field={`log-data-${index}`}
                          icon={Code}
                        />
                      )}

                      <div className="flex items-center gap-4 pt-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Log Index:</span>
                          <span className="font-mono font-medium">{log.logIndex}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Raw Transaction Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96 w-full rounded-lg border">
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all bg-muted/30">
                    {JSON.stringify(transaction, null, 2)}
                  </pre>
                </ScrollArea>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(transaction, null, 2), 'raw-data')}
                    className="flex items-center gap-2"
                  >
                    {copiedField === 'raw-data' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Raw Data
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(transaction, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `transaction-${transaction.hash.slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Download JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}