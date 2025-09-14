import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { Plus, Trash2, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfigurationPageProps {
  onConfigurationComplete: (rpcEndpoints: string[], primaryRpc: string) => void;
}

export function ConfigurationPage({ onConfigurationComplete }: ConfigurationPageProps) {
  const [rpcEndpoints, setRpcEndpoints] = useState<string[]>([
    'https://api.avax-test.network/ext/bc/C/rpc',
    'https://avalanche-fuji-c-chain.publicnode.com'
  ]);
  const [newEndpoint, setNewEndpoint] = useState('');
  const [primaryRpc, setPrimaryRpc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});

  const addEndpoint = () => {
    if (newEndpoint.trim() && !rpcEndpoints.includes(newEndpoint.trim())) {
      try {
        new URL(newEndpoint.trim());
        setRpcEndpoints([...rpcEndpoints, newEndpoint.trim()]);
        setNewEndpoint('');
        setError('');
      } catch {
        setError('Please enter a valid URL');
      }
    }
  };

  const removeEndpoint = (index: number) => {
    const updated = rpcEndpoints.filter((_, i) => i !== index);
    setRpcEndpoints(updated);
    if (primaryRpc === rpcEndpoints[index]) {
      setPrimaryRpc('');
    }
  };

  const validateEndpoint = async (endpoint: string): Promise<boolean> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      const data = await response.json();
      return !!data.result;
    } catch {
      return false;
    }
  };

  const validateAllEndpoints = async () => {
    setIsLoading(true);
    const results: Record<string, boolean> = {};
    
    for (const endpoint of rpcEndpoints) {
      results[endpoint] = await validateEndpoint(endpoint);
    }
    
    setValidationResults(results);
    setIsLoading(false);
  };

  const handleConfigure = async () => {
    if (rpcEndpoints.length === 0) {
      setError('Please add at least one RPC endpoint');
      return;
    }

    if (!primaryRpc) {
      setError('Please select a primary RPC endpoint for the indexer');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Configure backend with RPC endpoints
      const response = await fetch('https://avalancheteama1kol.onrender.com/api/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcEndpoints })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to configure RPC endpoints');
      }

      // Configuration successful
      onConfigurationComplete(rpcEndpoints, primaryRpc);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Configuration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const presetConfigurations = [
    {
      name: 'Avalanche Mainnet',
      endpoints: ['https://api.avax.network/ext/bc/C/rpc']
    },
    {
      name: 'Avalanche Testnet (Fuji)',
      endpoints: [
        'https://api.avax-test.network/ext/bc/C/rpc',
        'https://avalanche-fuji-c-chain.publicnode.com'
      ]
    },
    {
      name: 'Custom Subnet',
      endpoints: [''] // User will fill this
    }
  ];

  const loadPreset = (preset: typeof presetConfigurations[0]) => {
    if (preset.endpoints[0]) {
      setRpcEndpoints(preset.endpoints);
      setPrimaryRpc(preset.endpoints[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-3">
            {/* <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
              <Mountain className="h-8 w-8 text-white" />
            </div> */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              Avalanche custom L1 Watcher & Explorer
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Configure your RPC endpoints to monitor data availability across your Avalanche network
          </p>
          <Badge variant="outline" className="text-sm">
            <Settings className="h-3 w-3 mr-1" />
            Initial Setup Required
          </Badge>
        </div>

        {/* Preset Configurations */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Presets</CardTitle>
            <CardDescription>
              Choose a preset configuration or customize your own RPC endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presetConfigurations.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => loadPreset(preset)}
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground text-left">
                    {preset.endpoints.length} endpoint{preset.endpoints.length !== 1 ? 's' : ''}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RPC Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>RPC Endpoints Configuration</CardTitle>
            <CardDescription>
              Add multiple RPC endpoints for redundancy and data availability monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add new endpoint */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter RPC endpoint URL (e.g., https://api.avax.network/ext/bc/C/rpc)"
                value={newEndpoint}
                onChange={(e) => setNewEndpoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEndpoint()}
                className="flex-1"
              />
              <Button onClick={addEndpoint} disabled={!newEndpoint.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Endpoint list */}
            <div className="space-y-3">
              {rpcEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {endpoint}
                      </code>
                      {validationResults[endpoint] !== undefined && (
                        <Badge variant={validationResults[endpoint] ? 'default' : 'destructive'}>
                          {validationResults[endpoint] ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {validationResults[endpoint] ? 'Valid' : 'Invalid'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={primaryRpc === endpoint ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPrimaryRpc(endpoint)}
                    >
                      {primaryRpc === endpoint ? 'Primary' : 'Set Primary'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEndpoint(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {rpcEndpoints.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No RPC endpoints configured. Add at least one endpoint to continue.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Primary RPC Selection */}
        {rpcEndpoints.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Primary RPC:</strong> The selected primary RPC endpoint will be used for the blockchain indexer. 
              All endpoints will be monitored for data availability.
              {primaryRpc && (
                <div className="mt-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">{primaryRpc}</code>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={validateAllEndpoints}
            disabled={isLoading || rpcEndpoints.length === 0}
          >
            {isLoading ? 'Validating...' : 'Validate Endpoints'}
          </Button>
          <Button 
            onClick={handleConfigure}
            disabled={isLoading || rpcEndpoints.length === 0 || !primaryRpc}
            size="lg"
          >
            {isLoading ? 'Configuring...' : 'Start Monitoring'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}