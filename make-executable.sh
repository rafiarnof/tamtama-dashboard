#!/bin/bash

# Make all shell scripts executable

echo "🔧 Making scripts executable..."
echo ""

chmod +x hidrotower.sh
chmod +x check-deployment.sh
chmod +x enable-dev-mode.sh
chmod +x disable-dev-mode.sh
chmod +x setup-all.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Available commands:"
echo ""
echo "  ./hidrotower.sh          - Interactive command center"
echo "  ./setup-all.sh           - One-click setup (deploy everything)"
echo "  ./check-deployment.sh    - Check deployment status"
echo "  ./enable-dev-mode.sh     - Enable development mode (mock data)"
echo "  ./disable-dev-mode.sh    - Disable development mode (use database)"
echo ""
