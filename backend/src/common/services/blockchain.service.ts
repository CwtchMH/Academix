/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONTRACT_ABI } from '../utils/abi';
import { CONTRACT_ADDRESS } from '../utils/constant';

// Dynamic import ethers để tránh lỗi khi chưa cài package
// Cần cài đặt: npm install ethers@^6.0.0
let ethers: any;
try {
  ethers = require('ethers');
} catch {
  console.warn(
    '⚠️ ethers.js not installed. Please run: npm install ethers@^6.0.0',
  );
}

export interface IssueCertificateParams {
  tokenId: string | bigint; // uint256
  ipfsHash: string; // CID (IPFS hash)
  recipientAddress: string; // Address của người nhận
}

export interface CertificateData {
  cid: string;
  issuer: string;
  recipient: string;
  issuedAt: bigint;
  revoked: boolean;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: any;
  private contract: any;
  private signer: any = null;

  constructor(private configService: ConfigService) {
    if (!ethers) {
      this.logger.error(
        '⚠️ ethers.js not installed. Please run: npm install ethers@^6.0.0',
      );
      return;
    }

    // Lấy RPC URL từ environment variable
    // Mặc định: Avalanche Fuji testnet
    const rpcUrl =
      this.configService.get<string>('BLOCKCHAIN_RPC_URL') ||
      'https://api.avax-test.network/ext/bc/C/rpc';

    // Khởi tạo provider với chain config cho Avalanche
    const chainConfig = {
      name: 'Avalanche Fuji',
      chainId: 43113, // Fuji testnet chain ID
    };
    this.provider = new ethers.JsonRpcProvider(rpcUrl, chainConfig);

    // Lấy private key từ environment (dùng để sign transactions)
    const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');

    // Khởi tạo contract instance
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.provider,
    );

    // Nếu có private key, tạo signer để có thể gọi write functions
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      // Tạo contract instance với signer
      this.contract = this.contract.connect(this.signer);
      this.logger.log('Blockchain service initialized with signer');
    } else {
      this.logger.warn(
        'BLOCKCHAIN_PRIVATE_KEY not set. Only read operations will be available.',
      );
    }
  }

  /**
   * Tạo chứng chỉ trên smart contract
   * @param params - Thông tin chứng chỉ: tokenId, ipfsHash, recipientAddress
   * @returns Transaction hash
   */
  async issueCertificate(params: IssueCertificateParams): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error(
          'Signer not initialized. Please set BLOCKCHAIN_PRIVATE_KEY in environment variables.',
        );
      }

      const { tokenId, ipfsHash, recipientAddress } = params;

      if (!ethers) {
        throw new Error(
          'ethers.js not installed. Please install: npm install ethers@^6.0.0',
        );
      }

      // Validate inputs
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Convert tokenId to BigNumber nếu là string
      const tokenIdBigInt =
        typeof tokenId === 'string' ? BigInt(tokenId) : tokenId;

      this.logger.log(
        `Issuing certificate: tokenId=${tokenIdBigInt.toString()}, recipient=${recipientAddress}, ipfsHash=${ipfsHash}`,
      );

      // Gọi function issueCertificate trên smart contract
      const tx = await this.contract.issueCertificate(
        tokenIdBigInt,
        ipfsHash,
        recipientAddress,
      );

      this.logger.log(`Transaction sent: ${tx.hash}`);

      // Đợi transaction được mined
      const receipt = await tx.wait();
      this.logger.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Parse event CertificateIssued từ receipt
      try {
        const event = receipt.logs
          .map((log: any) => {
            try {
              return this.contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((parsed: any) => parsed?.name === 'CertificateIssued');

        if (event) {
          // Convert BigInt values to string for logging
          const eventData: any = {};
          if (event.args) {
            for (const key in event.args) {
              const value = event.args[key];
              if (typeof value === 'bigint') {
                eventData[key] = value.toString();
              } else {
                eventData[key] = value;
              }
            }
          }
          this.logger.log(
            `Certificate issued event: ${JSON.stringify(eventData)}`,
          );
        }
      } catch (eventError: unknown) {
        // Nếu parse event fail, không throw error vì transaction đã thành công
        const errorMsg =
          eventError instanceof Error ? eventError.message : 'Unknown error';
        this.logger.warn(
          `Failed to parse event from transaction ${tx.hash}, but transaction was successful: ${errorMsg}`,
        );
      }

      // Return transaction hash ngay cả khi parse event fail
      return tx.hash;
    } catch (error: any) {
      this.logger.error(
        `Error issuing certificate: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chứng chỉ từ smart contract
   * @param tokenId - Token ID của chứng chỉ
   * @returns Certificate data
   */
  async getCertificate(tokenId: string | bigint): Promise<CertificateData> {
    try {
      const tokenIdBigInt =
        typeof tokenId === 'string' ? BigInt(tokenId) : tokenId;

      this.logger.log(
        `Getting certificate: tokenId=${tokenIdBigInt.toString()}`,
      );

      const certificate = await this.contract.getCertificate(tokenIdBigInt);

      return {
        cid: certificate.cid,
        issuer: certificate.issuer,
        recipient: certificate.recipient,
        issuedAt: certificate.issuedAt,
        revoked: certificate.revoked,
      };
    } catch (error: any) {
      this.logger.error(
        `Error getting certificate: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get certificate: ${error.message}`);
    }
  }

  /**
   * Verify chứng chỉ bằng tokenId
   * @param tokenId - Token ID của chứng chỉ
   * @returns { valid: boolean, certificate: CertificateData }
   */
  async verifyCertificate(
    tokenId: string | bigint,
  ): Promise<{ valid: boolean; certificate: CertificateData }> {
    try {
      const tokenIdBigInt =
        typeof tokenId === 'string' ? BigInt(tokenId) : tokenId;

      this.logger.log(
        `Verifying certificate: tokenId=${tokenIdBigInt.toString()}`,
      );

      const result = await this.contract.verifyCertificate(tokenIdBigInt);

      return {
        valid: result.valid,
        certificate: {
          cid: result.cert.cid,
          issuer: result.cert.issuer,
          recipient: result.cert.recipient,
          issuedAt: result.cert.issuedAt,
          revoked: result.cert.revoked,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error verifying certificate: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  /**
   * Verify chứng chỉ bằng IPFS hash (CID)
   * @param ipfsHash - IPFS hash (CID) của chứng chỉ
   * @returns { valid: boolean, certificate: CertificateData }
   */
  async verifyCertificateByCID(
    ipfsHash: string,
  ): Promise<{ valid: boolean; certificate: CertificateData }> {
    try {
      this.logger.log(`Verifying certificate by CID: ${ipfsHash}`);

      const result = await this.contract.verifyCertificateByCID(ipfsHash);

      return {
        valid: result.valid,
        certificate: {
          cid: result.cert.cid,
          issuer: result.cert.issuer,
          recipient: result.cert.recipient,
          issuedAt: result.cert.issuedAt,
          revoked: result.cert.revoked,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error verifying certificate by CID: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to verify certificate by CID: ${error.message}`);
    }
  }

  /**
   * Lấy token ID từ IPFS hash (CID)
   * @param ipfsHash - IPFS hash (CID)
   * @returns Token ID
   */
  async getCertificateIdByCID(ipfsHash: string): Promise<bigint> {
    try {
      this.logger.log(`Getting certificate ID by CID: ${ipfsHash}`);

      const tokenId = await this.contract.getCertificateIdByCID(ipfsHash);

      return tokenId;
    } catch (error: any) {
      this.logger.error(
        `Error getting certificate ID by CID: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get certificate ID by CID: ${error.message}`);
    }
  }

  /**
   * Revoke chứng chỉ trên smart contract
   * @param tokenId - Token ID của chứng chỉ cần revoke
   * @returns Transaction hash
   */
  async revokeCertificate(tokenId: string | bigint): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error(
          'Signer not initialized. Please set BLOCKCHAIN_PRIVATE_KEY in environment variables.',
        );
      }

      const tokenIdBigInt =
        typeof tokenId === 'string' ? BigInt(tokenId) : tokenId;

      this.logger.log(
        `Revoking certificate: tokenId=${tokenIdBigInt.toString()}`,
      );

      // Gọi function revokeCertificate trên smart contract
      const tx = await this.contract.revokeCertificate(tokenIdBigInt);

      this.logger.log(`Transaction sent: ${tx.hash}`);

      // Đợi transaction được mined
      const receipt = await tx.wait();
      this.logger.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Parse event CertificateRevoked từ receipt
      const event = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed: any) => parsed?.name === 'CertificateRevoked');

      if (event) {
        this.logger.log(
          `Certificate revoked event: ${JSON.stringify(event.args)}`,
        );
      }

      return tx.hash;
    } catch (error: any) {
      this.logger.error(
        `Error revoking certificate: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to revoke certificate: ${error.message}`);
    }
  }

  /**
   * Lấy owner address của contract
   * @returns Owner address
   */
  async getOwner(): Promise<string> {
    try {
      const owner = await this.contract.owner();
      return owner;
    } catch (error: any) {
      this.logger.error(`Error getting owner: ${error.message}`, error.stack);
      throw new Error(`Failed to get owner: ${error.message}`);
    }
  }
}
