const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nextDir = path.join(__dirname, '..', '.next');

try {
  console.log('Cleaning Next.js cache...');
  
  // Stop any running Next.js processes
  try {
    console.log('Stopping Next.js processes...');
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
  } catch (e) {
    // It's okay if this fails
  }
  
  // Wait a moment for processes to terminate
  setTimeout(() => {
    try {
      // Remove the .next directory
      if (fs.existsSync(nextDir)) {
        console.log('Removing .next directory...');
        fs.rmSync(nextDir, { recursive: true, force: true });
      }
      
      console.log('Cache cleaned successfully!');
      console.log('You can now run "npm run dev" or "npm run build" again.');
    } catch (err) {
      console.error('Error cleaning cache:', err);
    }
  }, 1000);
} catch (error) {
  console.error('Failed to clean cache:', error);
}
