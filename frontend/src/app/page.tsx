'use client'

import { WalletConnect } from '@/components/WalletConnect'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

export default function Home() {
  const { isConnected } = useAccount()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Web3 App
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Kết nối ví, xem số dư và chuyển đổi chain
          </p>
        </div>
        <div className="mb-8">
          <WalletConnect />
        </div>
        {!isConnected && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Hướng dẫn sử dụng
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Nhấn nút "Connect Wallet" để kết nối ví của bạn
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Sau khi kết nối, bạn có thể xem số dư và chuyển đổi chain
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Ứng dụng hỗ trợ các chain: Ethereum, Polygon, Optimism,
                  Arbitrum, Base và Sepolia Testnet
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
