import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AlertTriangle, Activity, Wifi, Database, Clock, TrendingUp, Download, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { PerformanceTab } from '@/components/PerformanceTab'
import { AlertsTab } from '@/components/AlertsTab'
import { NetworkTab } from '@/components/NetworkTab'
import { AnalyticsTab } from '@/components/AnalyticsTab'
import { ModeToggle } from '@/components/mode-toggle'
import './App.css'

interface DAResult {
  timestamp: string
  daScore: number
  blockDetails: Array<{
    rpc: string
    number: string
    hash: string
    txCount: number
    timestamp: string | null
    gasUsed: string
    gasLimit: string
    size: string
  }>
  sampledTxs: string[]
  txDetails: Array<{
    hashes: (string | null)[]
    consistent: boolean
    gasPrice: string
    value: string
  }>
  blocksConsistent: boolean
  performance: {
    totalSampleTime: number
    rpcMetrics: Record<string, {
      averageResponseTime: number
      totalRequests: number
      failedRequests: number
      consecutiveFailures: number
      lastSuccessTime: string | null
      isHealthy: boolean
    }>
  }
  networkHealth: {
    status: string
    lastCheck: string
    uptime: number
    totalChecks: number
    successfulChecks: number
  }
}

interface AlertItem {
  id: string
  type: string
  message: string
  severity: 'warning' | 'critical' | 'info'
  timestamp: string
  acknowledged: boolean
}

function App() {
  const [currentData, setCurrentData] = useState<DAResult | null>(null)
  const [historicalData, setHistoricalData] = useState<DAResult[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Establish WebSocket connection
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3001')
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'initial':
            setHistoricalData(message.data.historicalData || [])
            setAlerts(message.data.alerts || [])
            if (message.data.historicalData?.[0]) {
              setCurrentData(message.data.historicalData[0])
            }
            break
          case 'da_update':
            setCurrentData(message.data)
            setHistoricalData(prev => [message.data, ...prev.slice(0, 99)])
            break
          case 'alert':
            setAlerts(prev => [message.data, ...prev])
            break
          case 'alert_acknowledged':
            setAlerts(prev => prev.map(alert => 
              alert.id === message.data.alertId 
                ? { ...alert, acknowledged: true }
                : alert
            ))
            break
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    }

    connectWebSocket()

    return () => {
      wsRef.current?.close()
    }
  }, [])

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`http://localhost:3001/api/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`http://localhost:3001/api/export?format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `da-watchdog-export.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default'
    if (score >= 50) return 'secondary'
    return 'destructive'
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const chartData = historicalData.slice(0, 50).reverse().map(item => ({
    time: format(new Date(item.timestamp), 'HH:mm:ss'),
    score: item.daScore,
    responseTime: item.performance.totalSampleTime
  }))

  return (
    <div className="min-h-screen bg-background dark:bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Avalanche DA Watchdog</h1>
            <p className="text-muted-foreground">Real-time Data Availability Monitoring Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isConnected ? 'default' : 'destructive'} className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <ModeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportData('json')}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportData('csv')}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Active Alerts ({unacknowledgedAlerts.length})</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {unacknowledgedAlerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex justify-between items-center">
                    <span className="text-sm">{alert.message}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">DA Health Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(currentData?.daScore || 0)}`}>
                    {currentData?.daScore || 0}/100
                  </div>
                  <Progress 
                    value={currentData?.daScore || 0} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentData?.blocksConsistent ? '✓ Blocks Consistent' : '✗ Blocks Inconsistent'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentData?.networkHealth.successfulChecks || 0}/
                    {currentData?.networkHealth.totalChecks || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Success Rate: {
                      currentData?.networkHealth.totalChecks 
                        ? Math.round((currentData.networkHealth.successfulChecks / currentData.networkHealth.totalChecks) * 100)
                        : 0
                    }%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentData?.performance.totalSampleTime || 0}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last sample duration
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>DA Score Trend</CardTitle>
                  <CardDescription>Real-time DA health score over time</CardDescription>
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
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                  <CardDescription>Sample processing time</CardDescription>
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
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Block Details */}
            <Card>
              <CardHeader>
                <CardTitle>Current Block Details</CardTitle>
                <CardDescription>Latest block information from all RPCs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RPC Endpoint</TableHead>
                      <TableHead>Block Number</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead>Tx Count</TableHead>
                      <TableHead>Gas Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData?.blockDetails.map((block, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {block.rpc}
                            <Badge variant={currentData.performance.rpcMetrics[block.rpc]?.isHealthy ? 'default' : 'destructive'}>
                              {currentData.performance.rpcMetrics[block.rpc]?.isHealthy ? 'Healthy' : 'Unhealthy'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{parseInt(block.number || '0', 16)}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-1 rounded">
                            {block.hash?.slice(0, 10)}...
                          </code>
                        </TableCell>
                        <TableCell>{block.txCount}</TableCell>
                        <TableCell>{parseInt(block.gasUsed || '0', 16).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <PerformanceTab currentData={currentData} historicalData={historicalData} />
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <NetworkTab currentData={currentData} />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertsTab alerts={alerts} onAcknowledgeAlert={acknowledgeAlert} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab historicalData={historicalData} currentData={currentData} />
          </TabsContent>

          {/* More tabs will be implemented next... */}
        </Tabs>
      </div>
    </div>
  )
}

export default App
