import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Network, Server, Zap, Clock } from 'lucide-react'

interface NetworkTabProps {
  currentData: any
}

export function NetworkTab({ currentData }: NetworkTabProps) {
  if (!currentData) return <div>Loading...</div>

  const rpcMetrics = Object.entries(currentData.performance.rpcMetrics).map(([rpc, metrics]: [string, any]) => ({
    rpc,
    ...metrics,
    displayName: rpc.replace('https://', '').replace('http://', '').split('/')[0]
  }))

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Topology
          </CardTitle>
          <CardDescription>
            Visual representation of RPC endpoints and their health status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 justify-center py-8">
            {rpcMetrics.map((rpc, i) => (
              <div key={i} className="flex flex-col items-center space-y-3">
                {/* RPC Node */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${
                  rpc.isHealthy 
                    ? 'border-green-500 bg-green-100 text-green-700' 
                    : 'border-red-500 bg-red-100 text-red-700'
                }`}>
                  <Server className="h-8 w-8" />
                </div>
                
                {/* RPC Info */}
                <div className="text-center">
                  <p className="text-sm font-medium max-w-24 truncate" title={rpc.displayName}>
                    {rpc.displayName}
                  </p>
                  <Badge variant={rpc.isHealthy ? 'default' : 'destructive'} className="text-xs">
                    {rpc.isHealthy ? 'Healthy' : 'Unhealthy'}
                  </Badge>
                </div>
                
                {/* Connection Line */}
                {i < rpcMetrics.length - 1 && (
                  <div className="absolute mt-10 ml-20">
                    <div className={`w-16 h-1 ${rpc.isHealthy ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <Separator className="my-6" />
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Healthy RPC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Unhealthy RPC</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RPC Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rpcMetrics.map((rpc, i) => (
          <Card key={i} className={`border-l-4 ${
            rpc.isHealthy ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="truncate max-w-48" title={rpc.displayName}>
                    {rpc.displayName}
                  </span>
                </div>
                <Badge variant={rpc.isHealthy ? 'default' : 'destructive'}>
                  {rpc.isHealthy ? 'Healthy' : 'Unhealthy'}
                </Badge>
              </CardTitle>
              <CardDescription className="truncate" title={rpc.rpc}>
                {rpc.rpc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Response Time
                    </div>
                    <p className="text-lg font-semibold">
                      {Math.round(rpc.averageResponseTime)}ms
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      Requests
                    </div>
                    <p className="text-lg font-semibold">
                      {rpc.totalRequests.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Status Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className={`font-medium ${
                      rpc.totalRequests > 0 && 
                      ((rpc.totalRequests - rpc.failedRequests) / rpc.totalRequests * 100) > 95 
                        ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {rpc.totalRequests > 0 
                        ? `${Math.round((rpc.totalRequests - rpc.failedRequests) / rpc.totalRequests * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failed Requests:</span>
                    <span className={`font-medium ${rpc.failedRequests > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {rpc.failedRequests}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Consecutive Failures:</span>
                    <span className={`font-medium ${rpc.consecutiveFailures > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {rpc.consecutiveFailures}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Success:</span>
                    <span className="font-medium text-xs">
                      {rpc.lastSuccessTime 
                        ? new Date(rpc.lastSuccessTime).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Network Summary</CardTitle>
          <CardDescription>Overall network health and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-green-600">
                {rpcMetrics.filter(rpc => rpc.isHealthy).length}
              </p>
              <p className="text-sm text-muted-foreground">Healthy Endpoints</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">
                {Math.round(rpcMetrics.reduce((acc, rpc) => acc + rpc.averageResponseTime, 0) / rpcMetrics.length)}ms
              </p>
              <p className="text-sm text-muted-foreground">Average Response Time</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">
                {rpcMetrics.reduce((acc, rpc) => acc + rpc.totalRequests, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}