import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkStats } from '@/components/indexer/NetworkStats';
import { LatestTransactions } from '@/components/indexer/LatestTransactions';
import { TransactionSearch } from '@/components/indexer/TransactionSearch';
import { Badge } from '@/components/ui/badge';
import { createAvalancheService } from '@/lib/avalanche';
import { Search, Activity, BarChart3, Zap } from 'lucide-react';

interface IndexerPageProps {
    rpcEndpoint: string
    onBackToDashboard: () => void
}

export function IndexerPage({ rpcEndpoint, onBackToDashboard }: IndexerPageProps) {
    const [networkStats, setNetworkStats] = useState({
        latestBlock: 0,
        gasPrice: '0',
        blockTime: '',
        network: 'Avalanche C-Chain'
    });
    const [avalancheService] = useState(() => createAvalancheService(rpcEndpoint));

    useEffect(() => {
        const fetchNetworkStats = async () => {
            try {
                const stats = await avalancheService.getNetworkStats();
                setNetworkStats(stats);
            } catch (error) {
                console.error('Error fetching network stats:', error);
            }
        };

        fetchNetworkStats();

        // Refresh network stats every 30 seconds
        const interval = setInterval(fetchNetworkStats, 1000);

        return () => clearInterval(interval);
    }, [avalancheService]);

    return (
        <div className=" pt-12 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* keep the logo at the top left  */}
            {/* <img src="/logo.png" alt="Logo" className=" p-1 h-24 w-24 mr-1 inline" /> */}

            {/* Back to Dashboard Button - Fixed Position */}
            <div className="  fixed top-4 right-4 z-50 flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBackToDashboard}
                    className="flex items-center gap-1"
                >
                    ← Back to Dashboard
                </Button>
                <ModeToggle />
            </div>

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {/* <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl"> */}
                            {/* <Mountain className="h-8 w-8 text-white" /> */}

                        {/* </div> */}
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                            Custom L1 explorer
                        </h1>
                        <Badge variant="outline" className="ml-2">
                            <Zap className="h-3 w-3 mr-1" />
                            Live
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                        Professional blockchain indexer and explorer for the Avalanche C-Chain.
                        Real-time transaction monitoring and network analytics.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Connected to: <code className="bg-muted px-2 py-1 rounded">{rpcEndpoint}</code>
                    </p>
                </div>

                {/* Network Stats */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Network Overview
                    </h2>
                    <NetworkStats stats={networkStats} />
                </div>

                {/* Main Content */}
                <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                        <TabsTrigger value="transactions" className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4" />
                            Live Transactions
                        </TabsTrigger>
                        <TabsTrigger value="search" className="flex items-center gap-2 text-sm">
                            <Search className="h-4 w-4" />
                            Transaction Search
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2 text-sm">
                            <BarChart3 className="h-4 w-4" />
                            Analytics Hub
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="mt-0">
                        <LatestTransactions avalancheService={avalancheService} />
                    </TabsContent>

                    <TabsContent value="search" className="mt-0">
                        <TransactionSearch avalancheService={avalancheService} />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0">
                        <div className="text-center py-16">
                            <div className="p-4 bg-muted/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">Advanced Analytics</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                Comprehensive network analytics, transaction patterns, and performance metrics
                                will be available in future updates.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Badge variant="outline">Transaction Volume</Badge>
                                <Badge variant="outline">Gas Analytics</Badge>
                                <Badge variant="outline">Network Health</Badge>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                {/* <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    <p>
                        Built with React, TypeScript, and Tailwind CSS.
                        Powered by Avalanche C-Chain RPC.
                    </p>
                </footer> */}
            </div>
        </div>
    );
}