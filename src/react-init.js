/**
 * CRITICAL: React Initialization Module
 * 
 * This module MUST be imported before anything else that uses React.
 * It ensures React, ReactDOM, and all React utilities are available
 * at the module import time for all downstream consumers.
 * 
 * DO NOT use: Just import it first in index.jsx
 */

// Initialize React ecosystem FIRST
import React from 'react';
import ReactDOM from 'react-dom/client';

// Make sure React is globally available at import time
if (!React) {
  throw new Error('❌ CRITICAL: React failed to initialize!');
}

// Export React to make it available to downstream modules
export { React, ReactDOM };

console.log('✅ React initialization complete - React version:', React.version);
