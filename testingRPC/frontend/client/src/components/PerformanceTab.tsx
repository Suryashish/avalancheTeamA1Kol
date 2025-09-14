import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react'

interface PerformanceTabProps {
  currentData: any
  historicalData: any[]
}

export function PerformanceTab({ currentData }: PerformanceTabProps) {
  if (!currentData) return <div>Loading...</div>

  const rpcMetrics = Object.entries(currentData.performance.rpcMetrics).map(([rpc, metrics]: [string, any]) => ({
    rpc: rpc.replace('https://', '').split('/')[0],
    ...metrics,
    successRate: metrics.totalRequests > 0 ? 
      ((metrics.totalRequests - metrics.failedRequests) / metrics.totalRequests * 100).toFixed(1) : 0
  }))

  const responseTimeData = rpcMetrics.map(rpc => ({
    name: rpc.rpc,
    responseTime: Math.round(rpc.averageResponseTime),
    requests: rpc.totalRequests
  }))

  const healthDistribution = [
    { name: 'Healthy', value: rpcMetrics.filter(rpc => rpc.isHealthy).length, color: '#10b981' },
    { name: 'Unhealthy', value: rpcMetrics.filter(rpc => !rpc.isHealthy).length, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(rpcMetrics.reduce((acc, rpc) => acc + rpc.averageResponseTime, 0) / rpcMetrics.length)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across all RPCs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rpcMetrics.reduce((acc, rpc) => acc + rpc.totalRequests, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Since monitoring started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rpcMetrics.reduce((acc, rpc) => acc + rpc.failedRequests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy RPCs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rpcMetrics.filter(rpc => rpc.isHealthy).length}/{rpcMetrics.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time by RPC</CardTitle>
            <CardDescription>Average response time for each endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responseTime" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RPC Health Distribution</CardTitle>
            <CardDescription>Current health status of all RPCs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed RPC Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>RPC Performance Metrics</CardTitle>
          <CardDescription>Detailed performance statistics for each RPC endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RPC Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Total Requests</TableHead>
                <TableHead>Failed Requests</TableHead>
                <TableHead>Consecutive Failures</TableHead>
                <TableHead>Last Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rpcMetrics.map((rpc, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate">
                      {rpc.rpc}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rpc.isHealthy ? 'default' : 'destructive'}>
                      {rpc.isHealthy ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{Math.round(rpc.averageResponseTime)}ms</span>
                      <Progress 
                        value={Math.min(100, (rpc.averageResponseTime / 5000) * 100)} 
                        className="w-16 h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={parseFloat(rpc.successRate) > 95 ? 'text-green-600' : parseFloat(rpc.successRate) > 80 ? 'text-yellow-600' : 'text-red-600'}>
                        {rpc.successRate}%
                      </span>
                      <Progress 
                        value={parseFloat(rpc.successRate)} 
                        className="w-16 h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{rpc.totalRequests.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">{rpc.failedRequests}</TableCell>
                  <TableCell className={rpc.consecutiveFailures > 0 ? 'text-red-600' : 'text-green-600'}>
                    {rpc.consecutiveFailures}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {rpc.lastSuccessTime 
                      ? new Date(rpc.lastSuccessTime).toLocaleTimeString()
                      : 'Never'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}