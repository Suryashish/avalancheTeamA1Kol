import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Clock, 
  Globe, 
  TrendingUp,
  Database,
  Timer
} from 'lucide-react';

interface NetworkStatsProps {
  stats: {
    latestBlock: number;
    gasPrice: string;
    blockTime: string;
    network: string;
  };
}

export function NetworkStats({ stats }: NetworkStatsProps) {
  const formatBlockTime = (isoTime: string) => {
    if (!isoTime) return 'Unknown';
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  };

  const getGasPriceColor = (gasPrice: string) => {
    const price = parseFloat(gasPrice);
    if (price < 25) return 'text-green-500';
    if (price < 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Network Status</CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                Online
              </div>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{stats.network}</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Latest Block</CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{stats.latestBlock.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>Growing</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gas Price</CardTitle>
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-xl font-bold font-mono ${getGasPriceColor(stats.gasPrice)}`}>
            {parseFloat(stats.gasPrice).toFixed(2)} Gwei
          </div>
          <p className="text-xs text-muted-foreground mt-1">Current network fee</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Last Block Time</CardTitle>
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Timer className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{formatBlockTime(stats.blockTime)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>Live timestamp</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}