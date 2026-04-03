import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './src/lib/auth.js';

const app = express();
app.use('/api/auth', toNodeHandler(auth));

// List all routes
console.log('\n=== Registered Routes ===');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).toUpperCase().join(',')} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`\nRouter: ${middleware.regexp.filename.split('/').pop()}`);
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        console.log(`  ${Object.keys(handler.route.methods).toUpperCase().join(',')} ${handler.route.path}`);
      }
    });
  }
});

process.exit(0);
