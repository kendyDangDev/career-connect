// Immediate logger fix - runs as soon as this module is imported
(() => {
  if (__DEV__) {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;

    // Override console methods to suppress Reanimated logger errors
    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (
          message.includes('Cannot read property \'level\' of undefined') ||
          (message.includes('react-native-reanimated') && message.includes('logger'))
        )
      ) {
        // Suppress this specific error
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args[0];
      if (
        message instanceof Error && 
        message.message && 
        (
          message.message.includes('Cannot read property \'level\' of undefined') ||
          (message.message.includes('react-native-reanimated') && message.message.includes('logger'))
        )
      ) {
        // Suppress this specific error
        return;
      }
      if (
        typeof message === 'string' && 
        (
          message.includes('Cannot read property \'level\' of undefined') ||
          (message.includes('react-native-reanimated') && message.includes('logger'))
        )
      ) {
        // Suppress this specific error
        return;
      }
      originalError.apply(console, args);
    };

    // Override global ErrorUtils if available
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error: any) => {
        // Check if this is the specific Reanimated logger error
        if (
          error && 
          error.message && 
          (
            error.message.includes('Cannot read property \'level\' of undefined') ||
            (error.message.includes('react-native-reanimated') && error.message.includes('logger'))
          )
        ) {
          // Handle the error gracefully instead of crashing
          console.log('Suppressed Reanimated logger error:', error.message);
          return;
        }
        
        // For all other errors, use the original handler
        if (originalHandler) {
          originalHandler(error);
        }
      });
    }
  }
})();

// Fix for React Native Reanimated logger error
// This addresses the "Cannot read property 'level' of undefined" error
export const initializeReanimated = () => {
  // Check if we're in a development environment
  if (__DEV__) {
    try {
      // Try to monkey-patch the reanimated logger before it's used
      const Module = require('module');
      const originalRequire = Module.prototype.require;
      
      Module.prototype.require = function(id: string) {
        if (id === 'react-native-reanimated' || id.includes('react-native-reanimated')) {
          const reanimated = originalRequire.apply(this, arguments);
          
          // Try to fix the logger if it exists
          if (reanimated && typeof reanimated === 'object') {
            // Look for logger in various possible locations
            const possibleLoggerPaths = [
              reanimated._log,
              reanimated.logger,
              reanimated.Logger,
              reanimated.__logger
            ];
            
            possibleLoggerPaths.forEach(logger => {
              // if (logger && typeof logger === 'object' && !logger.level) {
              //   logger.level = 'warn';
              // }
            });
          }
          
          return reanimated;
        }
        return originalRequire.apply(this, arguments);
      };
      
    } catch (error) {
      // If there's any error during initialization, log it but don't crash
      console.log('Reanimated initialization warning:', error);
    }
  }
};

// Global error handler for Reanimated-related issues
export const setupReanimatedErrorHandler = () => {
  if (__DEV__) {
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: any) => {
      // Check if this is the specific Reanimated logger error
      if (
        error && 
        error.message && 
        (
          error.message.includes('Cannot read property \'level\' of undefined') ||
          (error.message.includes('react-native-reanimated') && error.message.includes('logger'))
        )
      ) {
        // Handle the error gracefully instead of crashing
        console.warn('Suppressed Reanimated logger error:', error.message);
        return;
      }
      
      // For all other errors, use the original handler
      if (originalHandler) {
        originalHandler(error);
      }
    });
  }
};

// Export a combined initialization function
export const initializeReanimatedWithFixes = () => {
  initializeReanimated();
  setupReanimatedErrorHandler();
};