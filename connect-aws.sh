#!/bin/bash

# Quick connect to your AWS instance
# Run: ./connect-aws.sh

KEY_FILE="$HOME/.ssh/OShea.pem"
AWS_IP="18.118.160.224"
AWS_USER="ec2-user"

# Find key if not in default location
if [ ! -f "$KEY_FILE" ]; then
    echo "Looking for OShea.pem..."
    KEY_FILE=$(find ~ -name "OShea.pem" 2>/dev/null | head -1)
    
    if [ -z "$KEY_FILE" ]; then
        echo "❌ Cannot find OShea.pem"
        echo "Please specify location:"
        read -p "Path to OShea.pem: " KEY_FILE
    fi
fi

chmod 400 "$KEY_FILE"

echo "🔗 Connecting to AWS EC2 (OShea)..."
echo "   IP: $AWS_IP"
echo "   User: $AWS_USER"
echo ""

ssh -i "$KEY_FILE" "$AWS_USER@$AWS_IP"
