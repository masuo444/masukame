/**
 * MASUKAME Configuration File
 * Environment variables and API endpoints
 */

const MASUKAME_CONFIG = {
  // Form Submission Endpoints
  forms: {
    // Formspree endpoint for purchase applications
    // Sign up at https://formspree.io and create a form
    // Replace with your actual form ID
    purchase: 'https://formspree.io/f/xkgnjzqr', // Example: xkgnjzqr
    
    // Alternative: Tally Forms
    // tallyPurchase: 'https://tally.so/r/YOUR_FORM_ID',
    
    // Concierge contact form
    concierge: 'https://formspree.io/f/xabyqwrz',
    
    // Newsletter subscription
    newsletter: 'https://formspree.io/f/xnqkjwrp'
  },
  
  // Meta/Facebook Pixel Configuration
  analytics: {
    // Replace with your actual Meta Pixel ID
    // Get from Facebook Business Manager > Events Manager
    metaPixelId: '1234567890123456', // Example: 1234567890123456
    
    // Google Analytics ID (already in HTML)
    googleAnalyticsId: 'G-2VFDEPKDDW',
    
    // Enable debug mode for testing
    debugMode: false
  },
  
  // Registry API Configuration
  registry: {
    // API endpoint for registry data
    // In production, replace with your actual API endpoint
    apiEndpoint: process.env.REGISTRY_API || 'https://api.masukame.fomusglobal.com/v1/registry',
    
    // Fallback to local data if API is unavailable
    useFallback: true,
    fallbackData: '/en/data/registry.sample.json',
    
    // Cache duration in milliseconds (5 minutes)
    cacheTime: 300000,
    
    // API key (if required)
    apiKey: process.env.REGISTRY_API_KEY || null
  },
  
  // Ethereum/Web3 Configuration
  blockchain: {
    // Ethereum network (mainnet, goerli, polygon, etc.)
    network: 'mainnet',
    
    // Contract address for MASUKAME NFTs
    contractAddress: '0x0000000000000000000000000000000000000000', // Replace with actual
    
    // Etherscan API for verification
    etherscanApiKey: process.env.ETHERSCAN_API_KEY || null,
    
    // IPFS gateway for metadata
    ipfsGateway: 'https://ipfs.io/ipfs/',
    
    // ENS resolver endpoint
    ensResolver: 'https://api.ensideas.com/ens/resolve/'
  },
  
  // Currency API Configuration
  currency: {
    // API endpoint for live exchange rates
    // Free tier: https://api.exchangerate-api.com/v4/latest/USD
    apiEndpoint: 'https://api.exchangerate-api.com/v4/latest/USD',
    
    // Update interval in milliseconds (1 hour)
    updateInterval: 3600000,
    
    // Fallback exchange rates if API fails
    fallbackRates: {
      USD: 1.0,
      EUR: 0.92,
      AED: 3.67,
      JPY: 148.5
    }
  },
  
  // Email Configuration
  email: {
    // Concierge email address
    concierge: 'concierge@fomusglobal.com',
    
    // Support email
    support: 'support@masukame.fomusglobal.com',
    
    // Order notifications
    orders: 'orders@masukame.fomusglobal.com'
  },
  
  // Feature Flags
  features: {
    // Enable/disable features for gradual rollout
    enableNFTRegistry: true,
    enableLiveCurrency: true,
    enableWalletConnect: false,
    enableAR: false,
    enableSecondaryMarket: false,
    maintenance: false
  },
  
  // API Rate Limiting
  rateLimit: {
    // Max requests per minute
    maxRequests: 60,
    
    // Throttle delay in ms
    throttleDelay: 1000
  }
};

// Environment detection
const ENV = {
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  isStaging: window.location.hostname.includes('staging'),
  isProduction: window.location.hostname === 'masukame.fomusglobal.com'
};

// Override configurations based on environment
if (ENV.isDevelopment) {
  MASUKAME_CONFIG.analytics.debugMode = true;
  MASUKAME_CONFIG.registry.useFallback = true;
  console.log('🔧 MASUKAME Development Mode');
}

// Export for use in other scripts
window.MASUKAME_CONFIG = MASUKAME_CONFIG;
window.MASUKAME_ENV = ENV;

// Initialize Meta Pixel if configured
if (MASUKAME_CONFIG.analytics.metaPixelId && typeof fbq !== 'undefined') {
  fbq('init', MASUKAME_CONFIG.analytics.metaPixelId);
  
  if (MASUKAME_CONFIG.analytics.debugMode) {
    console.log('📊 Meta Pixel initialized:', MASUKAME_CONFIG.analytics.metaPixelId);
  }
}