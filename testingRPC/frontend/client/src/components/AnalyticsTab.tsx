import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { TrendingUp, BarChart3, PieChart, Download } from 'lucide-react'
import { format } from 'date-fns'

interface AnalyticsTabProps {
  historicalData: any[]
  currentData: any
}

export function AnalyticsTab({ historicalData, currentData }: AnalyticsTabProps) {
  if (!currentData || !historicalData.length) return <div>Loading analytics...</div>

  // Prepare chart data
  const last24Hours = historicalData.slice(0, 144) // Assuming 10-second intervals
  const chartData = last24Hours.reverse().map((item, index) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    score: item.daScore,
    responseTime: item.performance.totalSampleTime,
    blocksConsistent: item.blocksConsistent ? 1 : 0,
    index
  }))

  // Calculate statistics
  const avgScore = Math.round(historicalData.reduce((acc, item) => acc + item.daScore, 0) / historicalData.length)
  const avgResponseTime = Math.round(historicalData.reduce((acc, item) => acc + item.performance.totalSampleTime, 0) / historicalData.length)
  const consistencyRate = Math.round((historicalData.filter(item => item.blocksConsistent).length / historicalData.length) * 100)
  
  // Score distribution
  const scoreDistribution = [
    { range: '80-100', count: historicalData.filter(item => item.daScore >= 80).length, color: '#10b981' },
    { range: '50-79', count: historicalData.filter(item => item.daScore >= 50 && item.daScore < 80).length, color: '#f59e0b' },
    { range: '0-49', count: historicalData.filter(item => item.daScore < 50).length, color: '#ef4444' }
  ]

  // Performance trends
  const performanceTrend = chartData.map(item => ({
    time: item.time,
    samples: historicalData.length,
    avgScore: avgScore,
    currentScore: item.score
  }))

  // RPC performance analysis
  const rpcAnalysis = currentData.performance.rpcMetrics ? 
    Object.entries(currentData.performance.rpcMetrics).map(([rpc, metrics]: [string, any]) => ({
      rpc: rpc.replace('https://', '').split('/')[0],
      uptime: metrics.totalRequests > 0 ? ((metrics.totalRequests - metrics.failedRequests) / metrics.totalRequests * 100).toFixed(1) : 0,
      avgResponseTime: Math.round(metrics.averageResponseTime),
      totalRequests: metrics.totalRequests,
      reliability: metrics.isHealthy ? 'High' : 'Low'
    })) : []

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average DA Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              avgScore >= 80 ? 'text-green-600' : avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {avgScore}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Last {historicalData.length} samples
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Network performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              consistencyRate >= 95 ? 'text-green-600' : consistencyRate >= 80 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {consistencyRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Block consistency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalData.length}</div>
            <p className="text-xs text-muted-foreground">
              Data points collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>DA Score Trend Analysis</CardTitle>
            <CardDescription>Historical performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="blocksConsistent" 
                  stroke="#10b981" 
                  strokeWidth={1}
                  dot={false}
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>Network performance characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution Analysis</CardTitle>
          <CardDescription>Breakdown of DA scores across all samples</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RPC Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>RPC Performance Analysis</CardTitle>
          <CardDescription>Detailed performance metrics for each RPC endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RPC Endpoint</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Avg Response Time</TableHead>
                <TableHead>Total Requests</TableHead>
                <TableHead>Reliability</TableHead>
                <TableHead>Performance Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rpcAnalysis.map((rpc, i) => {
                const performanceGrade = 
                  parseFloat(String(rpc.uptime)) >= 99 && rpc.avgResponseTime < 1000 ? 'A+' :
                  parseFloat(String(rpc.uptime)) >= 95 && rpc.avgResponseTime < 2000 ? 'A' :
                  parseFloat(String(rpc.uptime)) >= 90 && rpc.avgResponseTime < 3000 ? 'B' :
                  parseFloat(String(rpc.uptime)) >= 80 ? 'C' : 'F'
                
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {rpc.rpc}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={parseFloat(rpc.uptime) > 95 ? 'text-green-600' : 'text-red-600'}>
                          {rpc.uptime}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={rpc.avgResponseTime < 1000 ? 'text-green-600' : rpc.avgResponseTime < 3000 ? 'text-yellow-600' : 'text-red-600'}>
                        {rpc.avgResponseTime}ms
                      </span>
                    </TableCell>
                    <TableCell>{rpc.totalRequests.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={rpc.reliability === 'High' ? 'default' : 'destructive'}>
                        {rpc.reliability}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        performanceGrade.includes('A') ? 'default' : 
                        performanceGrade === 'B' ? 'secondary' : 'destructive'
                      }>
                        {performanceGrade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered analysis of your network performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {avgScore < 70 && (
              <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
                <h4 className="font-medium text-yellow-800">Performance Alert</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your average DA score ({avgScore}) is below optimal. Consider investigating RPC endpoint reliability.
                </p>
              </div>
            )}
            
            {avgResponseTime > 3000 && (
              <div className="p-4 border-l-4 border-l-red-500 bg-red-50">
                <h4 className="font-medium text-red-800">High Latency Detected</h4>
                <p className="text-sm text-red-700 mt-1">
                  Average response time ({avgResponseTime}ms) is high. Consider optimizing network configuration or switching RPC providers.
                </p>
              </div>
            )}
            
            {consistencyRate > 95 && avgScore > 80 && (
              <div className="p-4 border-l-4 border-l-green-500 bg-green-50">
                <h4 className="font-medium text-green-800">Excellent Performance</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your network is performing excellently with {consistencyRate}% consistency and an average score of {avgScore}.
                </p>
              </div>
            )}
            
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
              <h4 className="font-medium text-blue-800">Monitoring Summary</h4>
              <p className="text-sm text-blue-700 mt-1">
                Collected {historicalData.length} data points. System has been monitoring for approximately {Math.round(historicalData.length * 10 / 60)} minutes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}