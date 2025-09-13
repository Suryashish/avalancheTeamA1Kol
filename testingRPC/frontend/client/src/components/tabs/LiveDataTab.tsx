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
        transactions: Array<{
          hash: string
          from: string
          to: string
          value: string
          gasPrice: string
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
                      
                      {blockData.data.transactions.length > 0 && (
                        <div className="md:col-span-2">
                          <strong>Sample Transactions:</strong>
                          <div className="mt-2 space-y-2">
                            {blockData.data.transactions.slice(0, 3).map((tx, txIndex) => (
                              <div key={txIndex} className="bg-muted/50 p-2 rounded text-xs">
                                <div><strong>Hash:</strong> {tx.hash}</div>
                                <div><strong>From:</strong> {tx.from}</div>
                                <div><strong>To:</strong> {tx.to || 'Contract Creation'}</div>
                                <div><strong>Value:</strong> {formatWei(tx.value)}</div>
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