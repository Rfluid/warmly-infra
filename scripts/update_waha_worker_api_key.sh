#!/bin/bash
set -e

WAHA_URL="http://waha:3000"
SESSION_ID="default"

# WAHA_API_KEY_PLAIN and WORKER_ID must be declared in environment variables

echo "⏳ Waiting for Waha to become available..."
until curl -s "$WAHA_URL/api/sessions" --header "X-Api-Key: $WAHA_API_KEY_PLAIN" >/dev/null; do
    sleep 2
done

echo "✅ Waha is up. Updating the default worker '$WORKER_ID'..."

# Assuming there's an endpoint to update the worker's API key or related configuration, e.g., /api/workers/{worker_id}
curl -X PUT "$WAHA_URL/api/workers/$WORKER_ID" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: $WAHA_API_KEY_PLAIN" \
    -d '{
    "config": {
      "apiKey": "'"$WAHA_API_KEY_PLAIN"'",
      "otherConfigurations": {}  # Add any other necessary configurations for the worker
    }
  }'

echo "✅ Default worker '$WORKER_ID' updated successfully."
