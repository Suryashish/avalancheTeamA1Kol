import { ethers } from 'ethers';

export interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasUsed?: string;
  timestamp: number;
  status?: number;
}

export interface DetailedTransaction extends Transaction {
  nonce: number;
  gasLimit: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  type: number;
  data: string;
  logs: TransactionLog[];
  cumulativeGasUsed?: string;
  effectiveGasPrice?: string;
  transactionIndex: number;
  confirmations: number;
}

export interface TransactionLog {
  address: string;
  topics: readonly string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}

export interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
}

export class AvalancheService {
  private provider: ethers.JsonRpcProvider;
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  // Method to update RPC URL if needed
  updateRpcUrl(newRpcUrl: string) {
    this.rpcUrl = newRpcUrl;
    this.provider = new ethers.JsonRpcProvider(newRpcUrl);
  }

  getRpcUrl(): string {
    return this.rpcUrl;
  }

  async getLatestBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error fetching latest block number:', error);
      throw error;
    }
  }

  async getBlock(blockNumber: number): Promise<Block | null> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block) return null;

      return {
        number: block.number,
        hash: block.hash || '',
        timestamp: block.timestamp,
        transactionCount: block.transactions.length,
        gasUsed: block.gasUsed.toString(),
        gasLimit: block.gasLimit.toString(),
        miner: block.miner || 'Unknown'
      };
    } catch (error) {
      console.error(`Error fetching block ${blockNumber}:`, error);
      return null;
    }
  }

  async getTransaction(txHash: string): Promise<Transaction | null> {
    try {
      const [tx, receipt] = await Promise.all([
        this.provider.getTransaction(txHash),
        this.provider.getTransactionReceipt(txHash)
      ]);

      if (!tx) return null;

      // Get block timestamp
      const block = await this.provider.getBlock(tx.blockNumber!);
      
      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber!,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
        gasUsed: receipt?.gasUsed?.toString(),
        timestamp: block?.timestamp || 0,
        status: receipt?.status || undefined
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txHash}:`, error);
      return null;
    }
  }

  async getDetailedTransaction(txHash: string): Promise<DetailedTransaction | null> {
    try {
      const [tx, receipt, block] = await Promise.all([
        this.provider.getTransaction(txHash),
        this.provider.getTransactionReceipt(txHash),
        this.provider.getTransaction(txHash).then(tx => 
          tx ? this.provider.getBlock(tx.blockNumber!) : null
        )
      ]);

      if (!tx || !receipt || !block) return null;

      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber!,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
        gasUsed: receipt.gasUsed.toString(),
        timestamp: block.timestamp,
        status: receipt.status || undefined,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit.toString(),
        maxFeePerGas: tx.maxFeePerGas ? ethers.formatUnits(tx.maxFeePerGas, 'gwei') : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? ethers.formatUnits(tx.maxPriorityFeePerGas, 'gwei') : undefined,
        type: tx.type || 0,
        data: tx.data,
        logs: receipt.logs.map(log => ({
          address: log.address,
          topics: log.topics,
          data: log.data,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          transactionIndex: log.transactionIndex,
          blockHash: log.blockHash,
          logIndex: log.index,
          removed: log.removed
        })),
        cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
        effectiveGasPrice: (receipt as any).effectiveGasPrice ? ethers.formatUnits((receipt as any).effectiveGasPrice, 'gwei') : undefined,
        transactionIndex: receipt.index,
        confirmations: await tx.confirmations()
      };
    } catch (error) {
      console.error(`Error fetching detailed transaction ${txHash}:`, error);
      return null;
    }
  }

  async getLatestTransactions(count: number = 10): Promise<Transaction[]> {
    try {
      const latestBlockNumber = await this.getLatestBlockNumber();
      const transactions: Transaction[] = [];
      let currentBlock = latestBlockNumber;
      
      // Fetch transactions from recent blocks
      while (transactions.length < count && currentBlock > latestBlockNumber - 20) {
        const block = await this.provider.getBlock(currentBlock, true);
        if (block && block.transactions.length > 0) {
          // Get detailed transaction info for the first few transactions in each block
          const txHashes = block.transactions.slice(0, Math.min(3, block.transactions.length));
          
          for (const txHash of txHashes) {
            if (transactions.length >= count) break;
            const tx = await this.getTransaction(txHash as string);
            if (tx) {
              transactions.push(tx);
            }
          }
        }
        currentBlock--;
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching latest transactions:', error);
      return [];
    }
  }

  async getNetworkStats() {
    try {
      const [latestBlockNumber, gasPrice] = await Promise.all([
        this.getLatestBlockNumber(),
        this.provider.getFeeData()
      ]);

      const latestBlock = await this.getBlock(latestBlockNumber);

      return {
        latestBlock: latestBlockNumber,
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0',
        blockTime: latestBlock ? new Date(latestBlock.timestamp * 1000).toISOString() : '',
        network: 'Avalanche C-Chain'
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return {
        latestBlock: 0,
        gasPrice: '0',
        blockTime: '',
        network: 'Avalanche C-Chain'
      };
    }
  }
}

// Create service factory function
export function createAvalancheService(rpcUrl: string): AvalancheService {
  return new AvalancheService(rpcUrl);
}

// Default service instance (will be replaced when RPC is configured)
export let avalancheService: AvalancheService;