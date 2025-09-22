# Web3 App Setup Guide

## Cài đặt và chạy ứng dụng

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình WalletConnect Project ID

Để ứng dụng hoạt động, bạn cần có WalletConnect Project ID:

1. Truy cập [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Tạo tài khoản và project mới
3. Copy Project ID
4. Thay thế `YOUR_PROJECT_ID` trong file `src/lib/providers.tsx`

```typescript
// src/lib/providers.tsx
const config = getDefaultConfig({
  appName: "Web3 App",
  projectId: "YOUR_PROJECT_ID", // Thay thế bằng Project ID thực
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
});
```

### 3. Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Các chức năng đã implement

### ✅ Kết nối ví (Wallet Connect)

- Sử dụng RainbowKit để kết nối ví
- Hỗ trợ nhiều loại ví phổ biến (MetaMask, WalletConnect, Coinbase Wallet, v.v.)
- Tự động reconnect khi refresh trang

### ✅ Hiển thị số dư (Balance Display)

- Hiển thị địa chỉ ví đã kết nối
- Hiển thị số dư native token của chain hiện tại
- Hiển thị tên chain và symbol token
- Xử lý loading và error states

### ✅ Chuyển đổi chain (Chain Switcher)

- Hỗ trợ 6 chain phổ biến:
  - Ethereum Mainnet
  - Polygon
  - Optimism
  - Arbitrum
  - Base
  - Sepolia Testnet
- Giao diện thân thiện với các nút chuyển đổi

### ✅ Giao diện responsive

- Thiết kế đẹp với Tailwind CSS
- Hỗ trợ dark mode
- Responsive trên mobile và desktop
- Gradient background và card layout

## Cấu trúc dự án

```
src/
├── app/
│   ├── layout.tsx          # Root layout với Web3Provider
│   ├── page.tsx           # Trang chính với tất cả chức năng
│   └── globals.css        # Global styles
├── components/
│   ├── WalletConnect.tsx  # Component kết nối ví
│   ├── BalanceDisplay.tsx # Component hiển thị số dư
│   └── ChainSwitcher.tsx  # Component chuyển đổi chain
└── lib/
    └── providers.tsx      # Web3 providers configuration
```

## Dependencies chính

- **Next.js 15.5.3**: React framework
- **RainbowKit 2.2.8**: UI components cho Web3
- **Wagmi 2.16.9**: React hooks cho Ethereum
- **Viem 2.37.5**: TypeScript interface cho Ethereum
- **Tailwind CSS 4**: Styling framework
- **@tanstack/react-query**: Data fetching và caching

## Lưu ý quan trọng

1. **Project ID**: Bắt buộc phải có WalletConnect Project ID để kết nối ví
2. **Testnet**: Sepolia testnet được bao gồm để test
3. **Security**: Không bao giờ commit Project ID vào git repository
4. **Environment**: Có thể sử dụng environment variables để quản lý Project ID

## Troubleshooting

### Lỗi kết nối ví

- Kiểm tra Project ID đã được cấu hình đúng
- Đảm bảo ví đã được cài đặt và unlock
- Kiểm tra network connection

### Lỗi hiển thị số dư

- Kiểm tra chain hiện tại có hỗ trợ không
- Đảm bảo ví đã kết nối thành công
- Kiểm tra console để xem error messages
