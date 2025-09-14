import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LiveDataTabProps {
  data: {
    rawBlocks?: Array<{
      rpc: string
      success: boolean
      data: {
        number: number
        hash: string
        parentHash: string
        timestamp: string
        gasUsed: number
        gasLimit: number
        transactionCount: number
        size: number
        miner: string
        difficulty: string
        networkName?: string
        chainId?: number
        nodeID?: string
        lastSent?: string
        trackedSubnets?: Array<{
          subnetID: string
          name: string
          validators: number
          isActive: boolean
        }>
        validatorInfo?: {
          nodeID: string
          stake: string
          delegationFee: number
          uptime: number
          connected: boolean
        }
        networkStats?: {
          totalValidators: number
          totalStake: string
          blockTime: number
          tps: number
        }
        transactions: Array<{
          hash: string
          from: string
          to: string
          value: string
          gasPrice: string
          type?: string
          inputData?: string
          logs?: Array<{
            address: string
            topics: string[]
            data: string
          }>
        }>
      } | null
    }>
    txDetails: Array<{
      txHash?: string
      details?: Array<{
        rpc: string
        success: boolean
        data: {
          hash: string
          from: string
          to: string
          value: string
          gasPrice: string
          gas: string
          blockNumber: number
          transactionIndex: number
          nonce: number
          type?: string
          chainId?: number
          networkName?: string
          status?: string
          gasUsed?: number
          effectiveGasPrice?: string
          cumulativeGasUsed?: number
          contractAddress?: string
          logs?: Array<{
            address: string
            topics: string[]
            data: string
          }>
          receipt?: {
            status: string
            gasUsed: number
            logs: Array<any>
          }
        } | null
      }>
    }>
  }
}

const formatHexValue = (value: string | number) => {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value
  }
  return `0x${value.toString(16)}`
}

const formatWei = (wei: string) => {
  if (!wei || wei === '0x0' || wei === '0') return '0 AVAX'
  
  // Convert hex to decimal if needed
  const decimal = wei.startsWith('0x') ? parseInt(wei, 16) : parseInt(wei)
  const avax = (decimal / 1e18).toFixed(6)
  return `${avax} AVAX`
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000)
  return date.toLocaleString()
}

const formatUptime = (uptime: number) => {
  return `${(uptime * 100).toFixed(2)}%`
}

const formatStake = (stake: string) => {
  if (!stake) return '0 AVAX'
  const decimal = stake.startsWith('0x') ? parseInt(stake, 16) : parseInt(stake)
  const avax = (decimal / 1e18).toFixed(2)
  return `${avax} AVAX`
}

const formatTPS = (tps: number) => {
  return `${tps.toFixed(2)} TPS`
}

const formatBlockTime = (blockTime: number) => {
  return `${blockTime.toFixed(1)}s`
}

const formatNodeID = (nodeID: string) => {
  if (!nodeID) return 'N/A'
  return `${nodeID.slice(0, 12)}...${nodeID.slice(-8)}`
}

export function LiveDataTab({ data }: LiveDataTabProps) {
  const { rawBlocks = [], txDetails = [] } = data

  return (
    <div className="space-y-6">
      {/* Raw Blocks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📦 Live Block Data
            <Badge variant="secondary">{rawBlocks.length} blocks fetched</Badge>
          </CardTitle>
          <CardDescription>
            Real-time blockchain block data from multiple RPC endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 w-full">
            <div className="space-y-4">
              {rawBlocks.map((blockData, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={blockData.success ? "default" : "destructive"}>
                        {blockData.rpc}
                      </Badge>
                      <Badge variant={blockData.success ? "secondary" : "destructive"}>
                        {blockData.success ? "✓ Success" : "✗ Failed"}
                      </Badge>
                    </div>
                  </div>
                  
                  {blockData.success && blockData.data && (
                    <div className="space-y-4">
                      {/* Basic Block Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong>Block Number:</strong> #{blockData.data.number.toLocaleString()}
                        </div>
                        <div>
                          <strong>Transactions:</strong> {blockData.data.transactionCount}
                        </div>
                        <div className="md:col-span-2">
                          <strong>Hash:</strong> 
                          <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                            {blockData.data.hash}
                          </code>
                        </div>
                        <div className="md:col-span-2">
                          <strong>Parent Hash:</strong> 
                          <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                            {blockData.data.parentHash}
                          </code>
                        </div>
                        <div>
                          <strong>Timestamp:</strong> {formatTimestamp(blockData.data.timestamp)}
                        </div>
                        <div>
                          <strong>Gas Used:</strong> {blockData.data.gasUsed.toLocaleString()}
                        </div>
                        <div>
                          <strong>Gas Limit:</strong> {blockData.data.gasLimit.toLocaleString()}
                        </div>
                        <div>
                          <strong>Size:</strong> {(blockData.data.size / 1024).toFixed(2)} KB
                        </div>
                        <div>
                          <strong>Miner:</strong> 
                          <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                            {blockData.data.miner.slice(0, 10)}...{blockData.data.miner.slice(-8)}
                          </code>
                        </div>
                      </div>

                      {/* Network Information */}
                      {(blockData.data.networkName || blockData.data.chainId || blockData.data.nodeID) && (
                        <div className="border-t pt-3">
                          <h4 className="font-semibold mb-2 text-sm">🌐 Network Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {blockData.data.networkName && (
                              <div>
                                <strong>Network:</strong> {blockData.data.networkName}
                              </div>
                            )}
                            {blockData.data.chainId && (
                              <div>
                                <strong>Chain ID:</strong> {blockData.data.chainId}
                              </div>
                            )}
                            {blockData.data.nodeID && (
                              <div className="md:col-span-2">
                                <strong>Node ID:</strong> 
                                <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                                  {formatNodeID(blockData.data.nodeID)}
                                </code>
                              </div>
                            )}
                            {blockData.data.lastSent && (
                              <div>
                                <strong>Last Sent:</strong> {formatTimestamp(blockData.data.lastSent)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Validator Information */}
                      {blockData.data.validatorInfo && (
                        <div className="border-t pt-3">
                          <h4 className="font-semibold mb-2 text-sm">👥 Validator Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <strong>Stake:</strong> {formatStake(blockData.data.validatorInfo.stake)}
                            </div>
                            <div>
                              <strong>Delegation Fee:</strong> {blockData.data.validatorInfo.delegationFee}%
                            </div>
                            <div>
                              <strong>Uptime:</strong> {formatUptime(blockData.data.validatorInfo.uptime)}
                            </div>
                            <div>
                              <strong>Status:</strong> 
                              <Badge variant={blockData.data.validatorInfo.connected ? "default" : "destructive"} className="ml-2">
                                {blockData.data.validatorInfo.connected ? "Connected" : "Disconnected"}
                              </Badge>
                            </div>
                            <div className="md:col-span-2">
                              <strong>Validator Node ID:</strong> 
                              <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                                {formatNodeID(blockData.data.validatorInfo.nodeID)}
                              </code>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Network Statistics */}
                      {blockData.data.networkStats && (
                        <div className="border-t pt-3">
                          <h4 className="font-semibold mb-2 text-sm">📊 Network Statistics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <strong>Total Validators:</strong> {blockData.data.networkStats.totalValidators.toLocaleString()}
                            </div>
                            <div>
                              <strong>Total Stake:</strong> {formatStake(blockData.data.networkStats.totalStake)}
                            </div>
                            <div>
                              <strong>Block Time:</strong> {formatBlockTime(blockData.data.networkStats.blockTime)}
                            </div>
                            <div>
                              <strong>TPS:</strong> {formatTPS(blockData.data.networkStats.tps)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tracked Subnets */}
                      {blockData.data.trackedSubnets && blockData.data.trackedSubnets.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="font-semibold mb-2 text-sm">🔗 Tracked Subnets</h4>
                          <div className="space-y-2">
                            {blockData.data.trackedSubnets.map((subnet, subnetIndex) => (
                              <div key={subnetIndex} className="bg-muted/50 p-2 rounded text-xs">
                                <div className="flex items-center gap-2 mb-1">
                                  <strong>{subnet.name || `Subnet ${subnetIndex + 1}`}</strong>
                                  <Badge variant={subnet.isActive ? "default" : "secondary"}>
                                    {subnet.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div><strong>Subnet ID:</strong> {subnet.subnetID}</div>
                                <div><strong>Validators:</strong> {subnet.validators}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {blockData.data.transactions.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="font-semibold mb-2 text-sm">💳 Sample Transactions</h4>
                          <div className="space-y-2">
                            {blockData.data.transactions.slice(0, 3).map((tx, txIndex) => (
                              <div key={txIndex} className="bg-muted/50 p-2 rounded text-xs">
                                <div><strong>Hash:</strong> {tx.hash}</div>
                                <div><strong>From:</strong> {tx.from}</div>
                                <div><strong>To:</strong> {tx.to || 'Contract Creation'}</div>
                                <div><strong>Value:</strong> {formatWei(tx.value)}</div>
                                {tx.type && (
                                  <div><strong>Type:</strong> {tx.type}</div>
                                )}
                                {tx.inputData && (
                                  <div>
                                    <strong>Input Data:</strong> 
                                    <code className="ml-2 bg-background px-1 py-0.5 rounded">
                                      {tx.inputData.slice(0, 20)}...
                                    </code>
                                  </div>
                                )}
                                {tx.logs && tx.logs.length > 0 && (
                                  <div>
                                    <strong>Logs:</strong> {tx.logs.length} events
                                    <div className="mt-1 space-y-1">
                                      {tx.logs.slice(0, 2).map((log, logIndex) => (
                                        <div key={logIndex} className="bg-background p-1 rounded">
                                          <div><strong>Address:</strong> {log.address.slice(0, 10)}...{log.address.slice(-8)}</div>
                                          <div><strong>Topics:</strong> {log.topics.length}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {blockData.data.transactions.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{blockData.data.transactions.length - 3} more transactions...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Separator />

      {/* Transaction Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔄 Transaction Verification
            <Badge variant="secondary">{txDetails.length} transactions sampled</Badge>
          </CardTitle>
          <CardDescription>
            Cross-RPC transaction validation and detailed inspection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 w-full">
            <div className="space-y-4">
              {txDetails.map((tx, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  {tx.txHash && (
                    <div>
                      <strong>Transaction Hash:</strong>
                      <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                        {tx.txHash}
                      </code>
                    </div>
                  )}
                  
                  {tx.details && tx.details.length > 0 && (
                    <div className="space-y-2">
                      <strong>RPC Responses:</strong>
                      {tx.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="bg-muted/50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={detail.success ? "default" : "destructive"}>
                              {detail.rpc}
                            </Badge>
                            <Badge variant={detail.success ? "secondary" : "destructive"}>
                              {detail.success ? "✓ Found" : "✗ Not Found"}
                            </Badge>
                          </div>
                          
                          {detail.success && detail.data && (
                            <div className="space-y-3">
                              {/* Basic Transaction Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <strong>Block:</strong> #{detail.data.blockNumber}
                                </div>
                                <div>
                                  <strong>Index:</strong> {detail.data.transactionIndex}
                                </div>
                                <div>
                                  <strong>Nonce:</strong> {detail.data.nonce}
                                </div>
                                <div>
                                  <strong>Gas:</strong> {parseInt(detail.data.gas).toLocaleString()}
                                </div>
                                {detail.data.chainId && (
                                  <div>
                                    <strong>Chain ID:</strong> {detail.data.chainId}
                                  </div>
                                )}
                                {detail.data.networkName && (
                                  <div>
                                    <strong>Network:</strong> {detail.data.networkName}
                                  </div>
                                )}
                                {detail.data.type && (
                                  <div>
                                    <strong>Type:</strong> {detail.data.type}
                                  </div>
                                )}
                                {detail.data.status && (
                                  <div>
                                    <strong>Status:</strong> 
                                    <Badge variant={detail.data.status === "0x1" ? "default" : "destructive"} className="ml-2">
                                      {detail.data.status === "0x1" ? "Success" : "Failed"}
                                    </Badge>
                                  </div>
                                )}
                                <div className="md:col-span-2">
                                  <strong>From:</strong> 
                                  <code className="ml-2 bg-background px-1 py-0.5 rounded">
                                    {detail.data.from}
                                  </code>
                                </div>
                                <div className="md:col-span-2">
                                  <strong>To:</strong> 
                                  <code className="ml-2 bg-background px-1 py-0.5 rounded">
                                    {detail.data.to || 'Contract Creation'}
                                  </code>
                                </div>
                                <div>
                                  <strong>Value:</strong> {formatWei(detail.data.value)}
                                </div>
                                <div>
                                  <strong>Gas Price:</strong> {parseInt(detail.data.gasPrice).toLocaleString()} Gwei
                                </div>
                                {detail.data.gasUsed && (
                                  <div>
                                    <strong>Gas Used:</strong> {detail.data.gasUsed.toLocaleString()}
                                  </div>
                                )}
                                {detail.data.effectiveGasPrice && (
                                  <div>
                                    <strong>Effective Gas Price:</strong> {parseInt(detail.data.effectiveGasPrice).toLocaleString()} Gwei
                                  </div>
                                )}
                                {detail.data.cumulativeGasUsed && (
                                  <div>
                                    <strong>Cumulative Gas Used:</strong> {detail.data.cumulativeGasUsed.toLocaleString()}
                                  </div>
                                )}
                                {detail.data.contractAddress && (
                                  <div className="md:col-span-2">
                                    <strong>Contract Address:</strong> 
                                    <code className="ml-2 bg-background px-1 py-0.5 rounded">
                                      {detail.data.contractAddress}
                                    </code>
                                  </div>
                                )}
                              </div>

                              {/* Transaction Logs */}
                              {detail.data.logs && detail.data.logs.length > 0 && (
                                <div className="border-t pt-2">
                                  <strong className="text-xs">Event Logs ({detail.data.logs.length}):</strong>
                                  <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                                    {detail.data.logs.slice(0, 3).map((log, logIndex) => (
                                      <div key={logIndex} className="bg-background p-2 rounded text-xs">
                                        <div><strong>Address:</strong> {log.address}</div>
                                        <div><strong>Topics:</strong> {log.topics.length} topics</div>
                                        {log.topics.length > 0 && (
                                          <div><strong>Event Signature:</strong> {log.topics[0].slice(0, 20)}...</div>
                                        )}
                                        {log.data && log.data !== '0x' && (
                                          <div><strong>Data:</strong> {log.data.slice(0, 30)}...</div>
                                        )}
                                      </div>
                                    ))}
                                    {detail.data.logs.length > 3 && (
                                      <div className="text-xs text-muted-foreground">
                                        +{detail.data.logs.length - 3} more logs...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Transaction Receipt */}
                              {detail.data.receipt && (
                                <div className="border-t pt-2">
                                  <strong className="text-xs">Receipt Information:</strong>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mt-1">
                                    <div>
                                      <strong>Status:</strong> 
                                      <Badge variant={detail.data.receipt.status === "0x1" ? "default" : "destructive"} className="ml-2">
                                        {detail.data.receipt.status === "0x1" ? "Success" : "Failed"}
                                      </Badge>
                                    </div>
                                    <div>
                                      <strong>Gas Used:</strong> {detail.data.receipt.gasUsed.toLocaleString()}
                                    </div>
                                    <div>
                                      <strong>Logs Count:</strong> {detail.data.receipt.logs.length}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}