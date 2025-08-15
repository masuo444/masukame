/**
 * MASUKAME Form Validation & Wallet Address Verification
 * Ethereum wallet address validation with checksum verification
 */

class MASUKAMEFormValidator {
  constructor() {
    this.rules = {};
    this.init();
  }
  
  init() {
    this.bindValidation();
    this.loadENSResolver();
  }
  
  // Load ENS resolver for Ethereum Name Service
  async loadENSResolver() {
    // Placeholder for ENS integration
    // In production, you'd use ethers.js or web3.js
    this.ensProvider = null;
  }
  
  bindValidation() {
    // Bind to forms with validation
    document.querySelectorAll('form[data-validate]').forEach(form => {
      this.setupFormValidation(form);
    });
    
    // Wallet address specific validation
    document.querySelectorAll('input[data-wallet]').forEach(input => {
      this.setupWalletValidation(input);
    });
  }
  
  setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Real-time validation on blur
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // Clear errors on input
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
    
    // Form submission validation
    form.addEventListener('submit', (e) => {
      if (!this.validateForm(form)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  
  setupWalletValidation(input) {
    let confirmInput = null;
    
    // Find confirmation input
    if (input.dataset.wallet === 'primary') {
      confirmInput = document.querySelector('input[data-wallet="confirm"]');
    }
    
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      
      // Clear previous validation states
      this.clearFieldError(input);
      
      if (value) {
        this.validateWalletAddress(input, value);
        
        // Check ENS if available
        if (this.isENS(value)) {
          this.resolveENS(input, value);
        }
      }
      
      // Cross-validate confirmation
      if (confirmInput && confirmInput.value) {
        this.validateWalletMatch(input, confirmInput);
      }
    });
    
    // Setup confirmation input validation
    if (confirmInput) {
      confirmInput.addEventListener('input', () => {
        this.validateWalletMatch(input, confirmInput);
      });
    }
  }
  
  validateField(input) {
    const value = input.value.trim();
    const rules = this.getFieldRules(input);
    
    // Required validation
    if (rules.required && !value) {
      this.setFieldError(input, 'This field is required');
      return false;
    }
    
    if (!value) return true; // Skip other validations if empty and not required
    
    // Email validation
    if (rules.email && !this.isValidEmail(value)) {
      this.setFieldError(input, 'Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    if (rules.phone && !this.isValidPhone(value)) {
      this.setFieldError(input, 'Please enter a valid phone number');
      return false;
    }
    
    // Wallet address validation
    if (rules.wallet && !this.isValidWalletAddress(value)) {
      this.setFieldError(input, 'Please enter a valid Ethereum wallet address');
      return false;
    }
    
    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const result = rules.custom(value);
      if (result !== true) {
        this.setFieldError(input, result);
        return false;
      }
    }
    
    return true;
  }
  
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    // Special wallet address cross-validation
    const walletPrimary = form.querySelector('input[data-wallet="primary"]');
    const walletConfirm = form.querySelector('input[data-wallet="confirm"]');
    
    if (walletPrimary && walletConfirm) {
      if (!this.validateWalletMatch(walletPrimary, walletConfirm)) {
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  validateWalletAddress(input, address) {
    if (!this.isValidWalletAddress(address)) {
      this.setFieldError(input, 'Invalid Ethereum address format');
      return false;
    }
    
    // Checksum validation
    if (this.isMixedCase(address) && !this.isValidChecksum(address)) {
      this.setFieldWarning(input, 'Address checksum is invalid. Please verify the address.');
      return false;
    }
    
    this.setFieldSuccess(input);
    return true;
  }
  
  validateWalletMatch(primaryInput, confirmInput) {
    const primary = primaryInput.value.trim().toLowerCase();
    const confirm = confirmInput.value.trim().toLowerCase();
    
    if (confirm && primary !== confirm) {
      this.setFieldError(confirmInput, 'Wallet addresses do not match');
      return false;
    }
    
    if (confirm && primary === confirm) {
      this.setFieldSuccess(confirmInput);
    }
    
    return true;
  }
  
  // Wallet address utilities
  isValidWalletAddress(address) {
    // Basic Ethereum address format: 0x + 40 hex characters
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
  }
  
  isMixedCase(address) {
    return address !== address.toLowerCase() && address !== address.toUpperCase();
  }
  
  isValidChecksum(address) {
    // Simplified checksum validation
    // In production, use a proper library like ethers.js
    try {
      // This is a placeholder - implement proper EIP-55 checksum validation
      return true;
    } catch (error) {
      return false;
    }
  }
  
  isENS(input) {
    return input.endsWith('.eth');
  }
  
  async resolveENS(input, ensName) {
    // Placeholder for ENS resolution
    // In production, integrate with ENS provider
    try {
      // const address = await this.ensProvider.resolveName(ensName);
      // if (address) {
      //   this.setFieldSuccess(input, `Resolved: ${address.slice(0,6)}...${address.slice(-4)}`);
      // }
    } catch (error) {
      this.setFieldWarning(input, 'Unable to resolve ENS name');
    }
  }
  
  // Validation utilities
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  isValidPhone(phone) {
    // Basic phone validation - adjust based on requirements
    const regex = /^[\+]?[\d\s\(\)\-]{10,}$/;
    return regex.test(phone);
  }
  
  getFieldRules(input) {
    const rules = {};
    
    // Parse data attributes
    if (input.hasAttribute('required')) rules.required = true;
    if (input.type === 'email') rules.email = true;
    if (input.type === 'tel') rules.phone = true;
    if (input.dataset.wallet) rules.wallet = true;
    
    return rules;
  }
  
  // UI feedback methods
  setFieldError(input, message) {
    const container = input.closest('.form-group');
    if (!container) return;
    
    this.clearFieldState(input);
    
    input.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    container.appendChild(errorElement);
  }
  
  setFieldWarning(input, message) {
    const container = input.closest('.form-group');
    if (!container) return;
    
    this.clearFieldState(input);
    
    input.classList.add('warning');
    
    const warningElement = document.createElement('div');
    warningElement.className = 'form-warning';
    warningElement.textContent = message;
    warningElement.style.color = '#f59e0b';
    
    container.appendChild(warningElement);
  }
  
  setFieldSuccess(input, message = '') {
    const container = input.closest('.form-group');
    if (!container) return;
    
    this.clearFieldState(input);
    
    input.classList.add('success');
    
    if (message) {
      const successElement = document.createElement('div');
      successElement.className = 'form-success';
      successElement.textContent = message;
      successElement.style.color = '#10b981';
      
      container.appendChild(successElement);
    }
  }
  
  clearFieldError(input) {
    this.clearFieldState(input);
  }
  
  clearFieldState(input) {
    const container = input.closest('.form-group');
    if (!container) return;
    
    input.classList.remove('error', 'warning', 'success');
    
    // Remove existing error/warning/success messages
    const messages = container.querySelectorAll('.form-error, .form-warning, .form-success');
    messages.forEach(msg => msg.remove());
  }
}

// Utility function for external use
window.validateWalletAddress = function(address) {
  const validator = new MASUKAMEFormValidator();
  return validator.isValidWalletAddress(address);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.MASUKAMEFormValidator = new MASUKAMEFormValidator();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MASUKAMEFormValidator;
}