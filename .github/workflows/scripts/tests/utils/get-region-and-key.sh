#!/usr/bin/bash -e

# Enable debug logging
set -x

# Make curl request to authenticate
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medusa-test.com","password":"supersecret"}')
echo "Response: $RESPONSE"

# Extract HTTP status code (last line of response)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
# Extract JSON body (remove status code)
JSON_BODY=$(echo "$RESPONSE" | sed '$d')

# Check if HTTP status is 200
if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "Error: HTTP status $HTTP_STATUS"
  exit 1
fi

# Extract JWT token from response
TOKEN=$(echo "$JSON_BODY" | jq -r '.token // empty')
if [ -z "$TOKEN" ]; then
  echo "Error: No token found in response"
  exit 1
fi

echo "Token: $TOKEN"

# Store token in GITHUB_OUTPUT if available
if [ -n "$GITHUB_OUTPUT" ]; then
  echo "JWT_TOKEN=$TOKEN" >> "$GITHUB_OUTPUT"
fi