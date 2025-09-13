import express from "express";
import axios from "axios";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001;

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// In-memory storage for historical data
const historicalData = [];
const performanceMetrics = [];
const alerts = [];
const networkHealth = {
  status: 'healthy',
  lastCheck: new Date(),
  uptime: 0,
  totalChecks: 0,
  successfulChecks: 0
};

// Replace these with Avalanche RPC endpoints for your subnets
const RPCS = [
    "https://api.avax-test.network/ext/bc/C/rpc",      // Avalanche Fuji Testnet (official)
    "https://avalanche-fuji-c-chain.publicnode.com"   // PublicNode Fuji Testnet
    // "https://subnets-test.avax.network/c-chain/tx"
    // "https://api.avax.network/ext/bc/X",
    // "https://api.avax.network/ext/bc/P",
    // "https://rpc.ankr.com/avalanche_fuji"
];

// Alert thresholds
const ALERT_THRESHOLDS = {
  lowScore: 30,
  criticalScore: 10,
  responseTime: 5000, // ms
  consecutiveFailures: 3
};

// Track RPC performance
const rpcPerformance = RPCS.reduce((acc, rpc) => {
  acc[rpc] = {
    averageResponseTime: 0,
    totalRequests: 0,
    failedRequests: 0,
    consecutiveFailures: 0,
    lastSuccessTime: null,
    isHealthy: true
  };
  return acc;
}, {});

// WebSocket connections
const wsClients = new Set();

// Helper to convert number to hex
function toHex(n) {
  return "0x" + n.toString(16);
}

// Fetch block by number with performance tracking
async function getBlock(rpc, blockNumber="latest") {
  const startTime = Date.now();
  try {
    const res = await axios.post(rpc, {
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [blockNumber, true],
      id: 1
    }, { timeout: ALERT_THRESHOLDS.responseTime });
    
    const responseTime = Date.now() - startTime;
    updateRpcPerformance(rpc, true, responseTime);
    
    return res.data.result;
  } catch (e) {
    const responseTime = Date.now() - startTime;
    updateRpcPerformance(rpc, false, responseTime);
    console.error(`RPC error ${rpc}:`, e.message);
    return null;
  }
}

// Fetch tx by hash with performance tracking
async function getTx(rpc, txHash) {
  const startTime = Date.now();
  try {
    const res = await axios.post(rpc, {
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [txHash],
      id: 1
    }, { timeout: ALERT_THRESHOLDS.responseTime });
    
    const responseTime = Date.now() - startTime;
    updateRpcPerformance(rpc, true, responseTime);
    
    return res.data.result;
  } catch (e) {
    const responseTime = Date.now() - startTime;
    updateRpcPerformance(rpc, false, responseTime);
    return null;
  }
}

// Update RPC performance metrics
function updateRpcPerformance(rpc, success, responseTime) {
  const metrics = rpcPerformance[rpc];
  metrics.totalRequests++;
  
  if (success) {
    metrics.consecutiveFailures = 0;
    metrics.lastSuccessTime = new Date();
    metrics.isHealthy = true;
  } else {
    metrics.failedRequests++;
    metrics.consecutiveFailures++;
    
    if (metrics.consecutiveFailures >= ALERT_THRESHOLDS.consecutiveFailures) {
      metrics.isHealthy = false;
      createAlert('rpc_failure', `RPC ${rpc} has ${metrics.consecutiveFailures} consecutive failures`, 'critical');
    }
  }
  
  // Update average response time
  metrics.averageResponseTime = 
    (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
}

// Create alert
function createAlert(type, message, severity = 'warning') {
  const alert = {
    id: Date.now().toString(),
    type,
    message,
    severity,
    timestamp: new Date(),
    acknowledged: false
  };
  
  alerts.unshift(alert);
  
  // Keep only last 100 alerts
  if (alerts.length > 100) alerts.pop();
  
  // Broadcast alert to WebSocket clients
  broadcastToClients({
    type: 'alert',
    data: alert
  });
  
  console.log(`ALERT [${severity.toUpperCase()}]: ${message}`);
}

// Broadcast message to all WebSocket clients
function broadcastToClients(message) {
  wsClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
    }
  });
}
function compareBlocks(blocks) {
  const hashes = blocks.filter(Boolean).map(b => b.hash);
  const unique = new Set(hashes);
  return unique.size === 1;
}

// Compare transactions for consistency
function compareTxs(txArr) {
  const nonNull = txArr.filter(Boolean);
  if(nonNull.length === 0) return false;
  const hashes = nonNull.map(t => t.hash);
  const unique = new Set(hashes);
  return unique.size === 1;
}

// Enhanced DA scoring with multiple factors
function scoreDA(blocks, txResults, performanceMetrics, networkHealth) {
  let score = 0;
  const factors = {};
  
  // 1. Block Consistency (25 points max)
  const validBlocks = blocks.filter(Boolean);
  if (validBlocks.length === 0) {
    factors.blockConsistency = 0;
  } else if (compareBlocks(blocks)) {
    factors.blockConsistency = 25;
  } else {
    // Partial score based on how many blocks agree
    const blockHashes = validBlocks.map(b => b.hash);
    const hashCounts = {};
    blockHashes.forEach(hash => {
      hashCounts[hash] = (hashCounts[hash] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(hashCounts));
    factors.blockConsistency = Math.floor((maxCount / validBlocks.length) * 25);
  }
  
  // 2. Transaction Consistency (20 points max)
  if (txResults.length === 0) {
    factors.txConsistency = 20; // No transactions to verify = perfect
  } else {
    const consistentCount = txResults.filter(compareTxs).length;
    factors.txConsistency = Math.floor((consistentCount / txResults.length) * 20);
  }
  
  // 3. RPC Health & Availability (20 points max)
  const totalRpcs = Object.keys(performanceMetrics).length;
  const healthyRpcs = Object.values(performanceMetrics).filter(rpc => rpc.isHealthy).length;
  factors.rpcHealth = Math.floor((healthyRpcs / totalRpcs) * 20);
  
  // 4. Response Time Performance (15 points max)
  const avgResponseTime = Object.values(performanceMetrics).reduce((acc, rpc) => 
    acc + rpc.averageResponseTime, 0) / totalRpcs;
  
  if (avgResponseTime < 500) factors.responseTime = 15;
  else if (avgResponseTime < 1000) factors.responseTime = 12;
  else if (avgResponseTime < 2000) factors.responseTime = 8;
  else if (avgResponseTime < 5000) factors.responseTime = 4;
  else factors.responseTime = 0;
  
  // 5. Network Reliability (10 points max)
  const successRate = networkHealth.totalChecks > 0 ? 
    (networkHealth.successfulChecks / networkHealth.totalChecks) : 0;
  factors.networkReliability = Math.floor(successRate * 10);
  
  // 6. Data Freshness (5 points max)
  const validBlocksWithTimestamp = validBlocks.filter(b => b.timestamp);
  if (validBlocksWithTimestamp.length > 0) {
    const latestBlockTime = Math.max(...validBlocksWithTimestamp.map(b => parseInt(b.timestamp) * 1000));
    const timeDiff = Date.now() - latestBlockTime;
    
    if (timeDiff < 30000) factors.dataFreshness = 5; // < 30 seconds
    else if (timeDiff < 60000) factors.dataFreshness = 4; // < 1 minute
    else if (timeDiff < 300000) factors.dataFreshness = 2; // < 5 minutes
    else factors.dataFreshness = 0;
  } else {
    factors.dataFreshness = 0;
  }
  
  // 7. Error Rate Penalty (up to -5 points)
  const totalRequests = Object.values(performanceMetrics).reduce((acc, rpc) => 
    acc + rpc.totalRequests, 0);
  const totalFailures = Object.values(performanceMetrics).reduce((acc, rpc) => 
    acc + rpc.failedRequests, 0);
  
  const errorRate = totalRequests > 0 ? (totalFailures / totalRequests) : 0;
  factors.errorPenalty = Math.floor(errorRate * -5);
  
  // Calculate final score
  score = Object.values(factors).reduce((acc, val) => acc + val, 0);
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return {
    totalScore: score,
    factors: factors,
    breakdown: {
      blockConsistency: `${factors.blockConsistency}/25`,
      txConsistency: `${factors.txConsistency}/20`,
      rpcHealth: `${factors.rpcHealth}/20`,
      responseTime: `${factors.responseTime}/15`,
      networkReliability: `${factors.networkReliability}/10`,
      dataFreshness: `${factors.dataFreshness}/5`,
      errorPenalty: `${factors.errorPenalty}/0`
    },
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F'
  };
}

// Main sampling function with enhanced analytics
async function sampleLatestBlock() {
  const startTime = Date.now();
  
  // Fetch latest block from all RPCs
  const blocks = await Promise.all(RPCS.map(rpc => getBlock(rpc)));

  // Sample txs: pick up to 5 random txs from first block
  let txsSample = [];
  if(blocks[0] && blocks[0].transactions.length > 0) {
    const txCount = blocks[0].transactions.length;
    const sampleSize = Math.min(5, txCount);
    for(let i=0;i<sampleSize;i++){
      const idx = Math.floor(Math.random() * txCount);
      txsSample.push(blocks[0].transactions[idx].hash);
    }
  }

  // Fetch sampled txs from all RPCs
  const txResults = [];
  for(let txHash of txsSample){
    const txFromAll = await Promise.all(RPCS.map(rpc => getTx(rpc, txHash)));
    txResults.push(txFromAll);
  }

  const daScoreResult = scoreDA(blocks, txResults, rpcPerformance, networkHealth);
  const totalTime = Date.now() - startTime;
  
  // Create comprehensive result with detailed raw data
  const result = {
    timestamp: new Date(),
    daScore: daScoreResult.totalScore,
    scoreBreakdown: daScoreResult.breakdown,
    scoreFactors: daScoreResult.factors,
    grade: daScoreResult.grade,
    blockDetails: blocks.map((b, i) => ({
      rpc: RPCS[i],
      number: b?.number,
      hash: b?.hash,
      txCount: b?.transactions?.length || 0,
      timestamp: b?.timestamp ? new Date(parseInt(b.timestamp) * 1000) : null,
      gasUsed: b?.gasUsed,
      gasLimit: b?.gasLimit,
      size: b?.size,
      parentHash: b?.parentHash,
      miner: b?.miner,
      difficulty: b?.difficulty,
      extraData: b?.extraData
    })),
    rawBlocks: blocks.map((b, i) => ({
      rpc: RPCS[i],
      success: b !== null,
      data: b ? {
        number: parseInt(b.number, 16),
        hash: b.hash,
        parentHash: b.parentHash,
        timestamp: new Date(parseInt(b.timestamp) * 1000).toISOString(),
        gasUsed: parseInt(b.gasUsed || '0', 16),
        gasLimit: parseInt(b.gasLimit || '0', 16),
        transactionCount: b.transactions?.length || 0,
        size: parseInt(b.size || '0', 16),
        miner: b.miner,
        difficulty: b.difficulty,
        transactions: b.transactions?.slice(0, 3).map(tx => ({
          hash: tx.hash || tx,
          from: tx.from,
          to: tx.to,
          value: tx.value ? parseInt(tx.value, 16).toString() : '0',
          gasPrice: tx.gasPrice ? parseInt(tx.gasPrice, 16).toString() : '0'
        })) || []
      } : null
    })),
    sampledTxs: txsSample,
    txDetails: txResults.map((txArr, i) => ({
      txHash: txsSample[i],
      hashes: txArr.map(tx => tx?.hash || null),
      consistent: compareTxs(txArr),
      gasPrice: txArr[0]?.gasPrice,
      value: txArr[0]?.value,
      from: txArr[0]?.from,
      to: txArr[0]?.to,
      blockNumber: txArr[0]?.blockNumber,
      details: txArr.map((tx, rpcIndex) => ({
        rpc: RPCS[rpcIndex],
        success: tx !== null,
        data: tx ? {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value ? parseInt(tx.value, 16).toString() : '0',
          gasPrice: tx.gasPrice ? parseInt(tx.gasPrice, 16).toString() : '0',
          gas: tx.gas ? parseInt(tx.gas, 16).toString() : '0',
          blockNumber: parseInt(tx.blockNumber || '0', 16),
          transactionIndex: parseInt(tx.transactionIndex || '0', 16),
          nonce: parseInt(tx.nonce || '0', 16)
        } : null
      }))
    })),
    blocksConsistent: compareBlocks(blocks),
    performance: {
      totalSampleTime: totalTime,
      rpcMetrics: { ...rpcPerformance }
    },
    networkHealth: { ...networkHealth }
  };
  
  // Update network health
  networkHealth.totalChecks++;
  if (result.daScore > 0) networkHealth.successfulChecks++;
  networkHealth.lastCheck = new Date();
  
  // Store in historical data
  historicalData.unshift(result);
  if (historicalData.length > 1000) historicalData.pop();
  
  // Check for alerts
  if (result.daScore <= ALERT_THRESHOLDS.criticalScore) {
    createAlert('low_da_score', `Critical DA score: ${result.daScore}/100 (Grade: ${result.grade})`, 'critical');
  } else if (result.daScore <= ALERT_THRESHOLDS.lowScore) {
    createAlert('low_da_score', `Low DA score: ${result.daScore}/100 (Grade: ${result.grade})`, 'warning');
  }
  
  // Additional alerts based on specific factors
  if (result.scoreFactors.rpcHealth < 10) {
    createAlert('rpc_health', `Poor RPC health: ${result.scoreBreakdown.rpcHealth}`, 'warning');
  }
  if (result.scoreFactors.responseTime < 8) {
    createAlert('high_latency', `High response time detected: ${result.scoreBreakdown.responseTime}`, 'warning');
  }
  
  // Broadcast to WebSocket clients
  broadcastToClients({
    type: 'da_update',
    data: result
  });
  
  return result;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log('New WebSocket client connected');
  
  // Send initial data
  ws.send(JSON.stringify({
    type: 'initial',
    data: {
      historicalData: historicalData.slice(0, 50), // Last 50 samples
      alerts: alerts.slice(0, 20), // Last 20 alerts
      rpcPerformance,
      networkHealth
    }
  }));
  
  ws.on('close', () => {
    wsClients.delete(ws);
    console.log('WebSocket client disconnected');
  });
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'acknowledge_alert' && data.alertId) {
        const alert = alerts.find(a => a.id === data.alertId);
        if (alert) {
          alert.acknowledged = true;
          broadcastToClients({
            type: 'alert_acknowledged',
            data: { alertId: data.alertId }
          });
        }
      }
    } catch (e) {
      console.error('Invalid WebSocket message:', e);
    }
  });
});

// API Routes
// Express API to get DA score
app.get("/da", async (req,res)=>{
  try{
    const result = await sampleLatestBlock();
    res.json(result);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

// Get historical data
app.get("/api/history", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(historicalData.slice(0, limit));
});

// Get performance metrics
app.get("/api/performance", (req, res) => {
  res.json({
    rpcMetrics: rpcPerformance,
    networkHealth,
    recentAlerts: alerts.slice(0, 10)
  });
});

// Get alerts
app.get("/api/alerts", (req, res) => {
  const unacknowledged = req.query.unacknowledged === 'true';
  const filteredAlerts = unacknowledged ? 
    alerts.filter(a => !a.acknowledged) : alerts;
  res.json(filteredAlerts.slice(0, 50));
});

// Acknowledge alert
app.post("/api/alerts/:id/acknowledge", (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (alert) {
    alert.acknowledged = true;
    broadcastToClients({
      type: 'alert_acknowledged',
      data: { alertId: req.params.id }
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// Get network topology
app.get("/api/topology", (req, res) => {
  const topology = {
    nodes: RPCS.map((rpc, i) => ({
      id: i,
      label: rpc,
      status: rpcPerformance[rpc].isHealthy ? 'healthy' : 'unhealthy',
      responseTime: rpcPerformance[rpc].averageResponseTime,
      successRate: rpcPerformance[rpc].totalRequests > 0 ? 
        ((rpcPerformance[rpc].totalRequests - rpcPerformance[rpc].failedRequests) / 
         rpcPerformance[rpc].totalRequests * 100).toFixed(1) : 0
    })),
    connections: RPCS.length > 1 ? RPCS.map((_, i) => ({
      from: i,
      to: (i + 1) % RPCS.length,
      status: 'active'
    })) : []
  };
  res.json(topology);
});

// Export data
app.get("/api/export", (req, res) => {
  const format = req.query.format || 'json';
  const data = {
    exportDate: new Date(),
    historicalData: historicalData,
    alerts: alerts,
    rpcPerformance: rpcPerformance,
    networkHealth: networkHealth
  };
  
  if (format === 'csv') {
    // Convert to CSV format
    const csv = historicalData.map(entry => ({
      timestamp: entry.timestamp,
      daScore: entry.daScore,
      blocksConsistent: entry.blocksConsistent,
      sampleTime: entry.performance.totalSampleTime
    }));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=da-watchdog-export.csv');
    res.send(csvStringify(csv));
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=da-watchdog-export.json');
    res.json(data);
  }
});

// Helper function to convert to CSV (simple implementation)
function csvStringify(data) {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ].join('\n');
  return csvContent;
}

// Run server
server.listen(PORT, ()=> console.log(`DA Watchdog API running on http://localhost:${PORT}`));

// Optional: auto-sample every 10 seconds and log
setInterval(async ()=>{
  const result = await sampleLatestBlock();
  console.log("DA Health Sample:", result.daScore);
}, 10000);
