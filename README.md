# Ryder Partners Frontend

A React application with secure authentication and Shopify integration. This app features encrypted data transmission, JWT token management, and a complete authentication flow.

## Features

- 🔐 **Secure Authentication** - Encrypted login/signup with JWT tokens
- 🏪 **Shopify Integration** - Connect and manage Shopify stores
- 🔄 **Auto Token Refresh** - Automatic token renewal system
- 📱 **Responsive Design** - Modern UI built with Tailwind CSS
- ⚡ **Fast Development** - Built with Vite for optimal performance

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file with your encryption key
   VITE_ENCRYPTION_KEY=your-encryption-key-here
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

For detailed encryption setup, see [ENCRYPTION_SETUP.md](./ENCRYPTION_SETUP.md).

## Documentation

- [Encryption Setup Guide](./ENCRYPTION_SETUP.md) - Configure encryption keys and environment variables
- [Setup Instructions](./SETUP.md) - Complete setup and configuration guide
- [API Documentation](./STORES_API_DOCUMENTATION.md) - Backend API reference

## Tech Stack

- **Frontend**: React 18 + Vite
- **State Management**: Redux Toolkit  
- **Styling**: Tailwind CSS
- **Authentication**: JWT + Cookie management
- **Encryption**: CryptoJS with OpenSSL compatibility
- **HTTP Client**: Axios with request/response interceptors

## Security Features

- 🔐 OpenSSL-style AES encryption for all API data
- 🍪 Secure cookie storage for authentication tokens
- 🔄 Automatic token refresh with expiration handling
- 🛡️ Environment-based encryption key management
- 📱 Client-side form validation and error handling

## Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/       # Dashboard specific components
│   └── ...
├── store/              # Redux store setup
│   ├── signup/         # Signup state management
│   ├── login/          # Login state management
│   └── shopify/        # Shopify integration
├── utils/              # Utility functions
│   ├── encryption.js   # Encryption utilities
│   ├── axios.js        # HTTP client setup
│   └── tokenManager.js # Token management
└── hooks/              # Custom React hooks
```
