#!/bin/sh

# Start Node.js server in background
node build/index.js &

# Start nginx in foreground
nginx -g "daemon off;"
