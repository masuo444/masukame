/**
 * MASUKAME Registry API Integration
 * Handles blockchain verification and ownership tracking
 */

class MASUKAMERegistryAPI {
  constructor() {
    this.config = window.MASUKAME_CONFIG?.registry || {};
    this.cache = new Map();
    this.initializeAPI();
  }
  
  async initializeAPI() {
    // Check if we should use fallback data
    if (this.config.useFallback || window.MASUKAME_ENV?.isDevelopment) {
      console.log('📦 Using fallback registry data');
      await this.loadFallbackData();
    } else {
      // Set up real API connection
      this.setupAPIConnection();
    }
  }
  
  async loadFallbackData() {
    try {
      const response = await fetch(this.config.fallbackData || '/en/data/registry.sample.json');
      const data = await response.json();
      this.fallbackData = data;
      
      if (window.MASUKAME_CONFIG?.analytics?.debugMode) {
        console.log('📊 Registry fallback data loaded:', data.registry_info);
      }
    } catch (error) {
      console.error('Failed to load fallback registry data:', error);
    }
  }
  
  setupAPIConnection() {
    // Real API connection setup
    this.apiHeaders = {
      'Content-Type': 'application/json'
    };
    
    if (this.config.apiKey) {
      this.apiHeaders['X-API-Key'] = this.config.apiKey;
    }
  }
  
  /**
   * Search for a sculpture by serial number or token ID
   */
  async searchSculpture(query) {
    // Check cache first
    const cacheKey = `search_${query}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTime) {
        return cached.data;
      }
    }
    
    try {
      let result;
      
      if (this.config.useFallback || window.MASUKAME_ENV?.isDevelopment) {
        // Use fallback data
        result = await this.searchFallback(query);
      } else {
        // Use real API
        result = await this.searchAPI(query);
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      console.error('Registry search error:', error);
      
      // Fall back to local data if API fails
      if (!this.config.useFallback && this.fallbackData) {
        return this.searchFallback(query);
      }
      
      return null;
    }
  }
  
  /**
   * Search in fallback data
   */
  async searchFallback(query) {
    if (!this.fallbackData) {
      await this.loadFallbackData();
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search by serial (pad with zeros if needed)
    if (/^\d+$/.test(normalizedQuery)) {
      const paddedSerial = normalizedQuery.padStart(3, '0');
      return this.fallbackData.sculptures.find(s => s.serial === paddedSerial);
    }
    
    // Search by token ID
    return this.fallbackData.sculptures.find(s => 
      s.token_id.toLowerCase() === normalizedQuery
    );
  }
  
  /**
   * Search using real API
   */
  async searchAPI(query) {
    const endpoint = `${this.config.apiEndpoint}/search`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.apiHeaders,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.sculpture || null;
  }
  
  /**
   * Get registry statistics
   */
  async getStatistics() {
    const cacheKey = 'statistics';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTime) {
        return cached.data;
      }
    }
    
    try {
      let stats;
      
      if (this.config.useFallback || window.MASUKAME_ENV?.isDevelopment) {
        stats = this.getFallbackStatistics();
      } else {
        stats = await this.fetchStatistics();
      }
      
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });
      
      return stats;
      
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return this.getFallbackStatistics();
    }
  }
  
  /**
   * Get statistics from fallback data
   */
  getFallbackStatistics() {
    if (!this.fallbackData) {
      return {
        totalMinted: 0,
        totalTransfers: 0,
        separatedOwnership: 0,
        countries: 0
      };
    }
    
    const sculptures = this.fallbackData.sculptures || [];
    const countries = new Set(sculptures.map(s => s.location).filter(Boolean));
    
    return {
      totalMinted: this.fallbackData.registry_info?.total_minted || sculptures.length,
      totalTransfers: this.fallbackData.registry_info?.total_transferred || 0,
      separatedOwnership: sculptures.filter(s => s.physical_owner !== 'Same').length,
      countries: countries.size
    };
  }
  
  /**
   * Fetch statistics from API
   */
  async fetchStatistics() {
    const endpoint = `${this.config.apiEndpoint}/statistics`;
    
    const response = await fetch(endpoint, {
      headers: this.apiHeaders
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  }
  
  /**
   * Verify ownership on blockchain
   */
  async verifyOwnership(tokenId, walletAddress) {
    // This would connect to actual blockchain
    // For now, mock verification
    
    if (window.MASUKAME_ENV?.isDevelopment) {
      console.log('🔐 Mock ownership verification:', { tokenId, walletAddress });
      return {
        verified: true,
        owner: walletAddress,
        tokenId: tokenId,
        timestamp: Date.now()
      };
    }
    
    // In production, this would use web3.js or ethers.js
    // to verify actual on-chain ownership
    try {
      const endpoint = `${this.config.apiEndpoint}/verify`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.apiHeaders,
        body: JSON.stringify({ tokenId, walletAddress })
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Ownership verification error:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }
  
  /**
   * Track transfer history
   */
  async getTransferHistory(tokenId) {
    try {
      if (this.config.useFallback || window.MASUKAME_ENV?.isDevelopment) {
        // Mock transfer history
        return [
          {
            from: '0x0000...0000',
            to: '0xAb5e...3491',
            timestamp: '2024-03-15T14:30:00Z',
            type: 'Mint'
          }
        ];
      }
      
      const endpoint = `${this.config.apiEndpoint}/transfers/${tokenId}`;
      
      const response = await fetch(endpoint, {
        headers: this.apiHeaders
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Failed to get transfer history:', error);
      return [];
    }
  }
  
  /**
   * Subscribe to real-time updates (WebSocket)
   */
  subscribeToUpdates(callback) {
    if (window.MASUKAME_ENV?.isDevelopment) {
      // Mock real-time updates in development
      setInterval(() => {
        callback({
          type: 'status_update',
          data: {
            serial: '001',
            status: 'Delivered',
            timestamp: Date.now()
          }
        });
      }, 30000);
      return;
    }
    
    // Production WebSocket connection
    if (this.config.websocketEndpoint) {
      this.ws = new WebSocket(this.config.websocketEndpoint);
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.ws) {
      this.ws.close();
    }
    this.cache.clear();
  }
}

// Initialize API when ready
document.addEventListener('DOMContentLoaded', () => {
  window.MASUKAMERegistryAPI = new MASUKAMERegistryAPI();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MASUKAMERegistryAPI;
}