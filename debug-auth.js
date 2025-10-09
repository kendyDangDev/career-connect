// Debug script to check authentication token storage
// Run this in the web console or as a node script to debug token issues

const checkAuthTokens = () => {
  console.log('=== Authentication Token Debug ===');
  
  // Check localStorage (for web)
  if (typeof localStorage !== 'undefined') {
    console.log('Platform: Web (localStorage)');
    console.log('authToken:', localStorage.getItem('authToken'));
    console.log('userData:', localStorage.getItem('userData'));
    console.log('chat_token:', localStorage.getItem('chat_token'));
    console.log('refreshToken:', localStorage.getItem('refreshToken'));
    
    // Also check old keys
    console.log('\n--- Old keys (should be empty) ---');
    console.log('user_token:', localStorage.getItem('user_token'));
    console.log('user_id:', localStorage.getItem('user_id'));
  }
  
  console.log('\n=== Storage Keys Summary ===');
  console.log('✅ Correct keys:');
  console.log('  - authToken (main authentication token)');
  console.log('  - userData (user information)');
  console.log('  - chat_token (chat authentication token)');
  console.log('  - refreshToken (refresh token)');
  
  console.log('\n❌ Incorrect keys (legacy):');
  console.log('  - user_token (should use authToken instead)');
  console.log('  - user_id (should use userData.id instead)');
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  checkAuthTokens();
  
  // Also provide a helper function to manually clear all tokens
  window.clearAllAuthTokens = () => {
    const keys = ['authToken', 'userData', 'chat_token', 'refreshToken', 'user_token', 'user_id'];
    keys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared: ${key}`);
    });
    console.log('All authentication tokens cleared. Please log in again.');
  };
  
  console.log('\nTo clear all tokens, run: clearAllAuthTokens()');
}

// For Node.js
if (typeof module !== 'undefined') {
  module.exports = { checkAuthTokens };
}