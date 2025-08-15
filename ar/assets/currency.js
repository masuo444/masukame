/**
 * MASUKAME Currency System
 * USD-anchored pricing with approximate conversions
 */

class MASUKAMECurrency {
  constructor() {
    this.baseCurrency = 'USD';
    this.basePrice = 3000; // Classic edition base price in USD
    
    // Fixed exchange rates (update as needed or replace with API)
    this.exchangeRates = {
      USD: 1.0,
      EUR: 0.92,
      AED: 3.67,
      JPY: 148.5
    };
    
    this.currencySymbols = {
      USD: '$',
      EUR: '€',
      AED: 'د.إ',
      JPY: '¥'
    };
    
    this.currentCurrency = this.getSavedCurrency() || 'USD';
    this.init();
  }
  
  init() {
    this.updateCurrencySelector();
    this.bindEvents();
    this.updateAllPrices();
  }
  
  getSavedCurrency() {
    return localStorage.getItem('masukame_currency');
  }
  
  saveCurrency(currency) {
    localStorage.setItem('masukame_currency', currency);
  }
  
  bindEvents() {
    // Currency selector change
    const selector = document.querySelector('.currency-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.changeCurrency(e.target.value);
      });
    }
    
    // Listen for dynamic content updates
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (
            node.classList?.contains('price') || 
            node.querySelector?.('.price')
          )) {
            shouldUpdate = true;
          }
        });
      });
      if (shouldUpdate) {
        this.updateAllPrices();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  changeCurrency(newCurrency) {
    if (!this.exchangeRates[newCurrency]) return;
    
    this.currentCurrency = newCurrency;
    this.saveCurrency(newCurrency);
    this.updateCurrencySelector();
    this.updateAllPrices();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { currency: newCurrency }
    }));
  }
  
  updateCurrencySelector() {
    const selector = document.querySelector('.currency-selector');
    if (selector) {
      selector.value = this.currentCurrency;
    }
  }
  
  convertPrice(usdPrice, toCurrency) {
    const rate = this.exchangeRates[toCurrency];
    if (!rate) return usdPrice;
    
    const converted = usdPrice * rate;
    return Math.round(converted);
  }
  
  formatPrice(price, currency, options = {}) {
    const {
      showFrom = false,
      showApprox = false,
      className = ''
    } = options;
    
    const symbol = this.currencySymbols[currency];
    const isApprox = currency !== 'USD' && showApprox;
    
    let formatted = '';
    
    if (showFrom) {
      formatted += 'From ';
    }
    
    if (isApprox) {
      formatted += 'Approx. ';
    }
    
    // Format number with commas for readability
    const formattedNumber = price.toLocaleString();
    
    if (currency === 'JPY' || currency === 'AED') {
      formatted += `${symbol}${formattedNumber}`;
    } else {
      formatted += `${symbol}${formattedNumber}`;
    }
    
    return `<span class="price-value ${className}" data-currency="${currency}" data-base-price="${price}">${formatted}</span>`;
  }
  
  updateAllPrices() {
    // Update price elements with data-usd-price attribute
    document.querySelectorAll('[data-usd-price]').forEach(element => {
      const usdPrice = parseFloat(element.dataset.usdPrice);
      const showFrom = element.dataset.showFrom === 'true';
      const showApprox = element.dataset.showApprox !== 'false'; // default true for non-USD
      
      const convertedPrice = this.convertPrice(usdPrice, this.currentCurrency);
      
      element.innerHTML = this.formatPrice(convertedPrice, this.currentCurrency, {
        showFrom,
        showApprox: showApprox && this.currentCurrency !== 'USD'
      });
    });
    
    // Update edition pricing
    this.updateEditionPricing();
  }
  
  updateEditionPricing() {
    const editions = {
      classic: { usd: 2000 },
      collaboration: { usd: 4000 },
      monumental: null // POA
    };
    
    Object.entries(editions).forEach(([edition, pricing]) => {
      const elements = document.querySelectorAll(`[data-edition="${edition}"]`);
      
      elements.forEach(element => {
        if (!pricing) {
          element.innerHTML = 'POA';
          return;
        }
        
        const convertedPrice = this.convertPrice(pricing.usd, this.currentCurrency);
        const showFrom = element.dataset.showFrom !== 'false';
        const showApprox = this.currentCurrency !== 'USD';
        
        element.innerHTML = this.formatPrice(convertedPrice, this.currentCurrency, {
          showFrom,
          showApprox
        });
      });
    });
  }
  
  // Utility method to get current exchange rate
  getExchangeRate(currency) {
    return this.exchangeRates[currency] || 1;
  }
  
  // Method to update exchange rates (for future API integration)
  updateExchangeRates(newRates) {
    this.exchangeRates = { ...this.exchangeRates, ...newRates };
    this.updateAllPrices();
  }
}

// Initialize currency system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.MASUKAMECurrency = new MASUKAMECurrency();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MASUKAMECurrency;
}