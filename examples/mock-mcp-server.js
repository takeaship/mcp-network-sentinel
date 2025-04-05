#!/usr/bin/env node

console.log('Starting mock MCP server...');

// Simulate a server that makes some network requests
setTimeout(() => {
  console.log('Making HTTP request to example.com...');
  fetch('http://example.com')
    .then(response => response.text())
    .then(data => console.log('Received', data.length, 'bytes from example.com'));
}, 2000);

setTimeout(() => {
  console.log('Making HTTPS request to api.github.com...');
  fetch('https://api.github.com/users/octocat')
    .then(response => response.json())
    .then(data => console.log('GitHub API responded with user data for:', data.login));
}, 4000);

console.log('Mock MCP server started. Press Ctrl+C to exit.');

// Keep the process running
setInterval(() => {}, 1000); 