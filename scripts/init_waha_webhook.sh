#!/bin/bash
set -e

WAHA_URL="http://waha:3000"
SESSION_ID="default"

# WAHA_API_KEY_PLAIN and WEBHOOK_URL must be declared in environment variables

echo "⏳ Waiting for Waha to become available..."
until curl -s "$WAHA_URL/api/sessions" --header "X-Api-Key: $WAHA_API_KEY_PLAIN" >/dev/null; do
    sleep 2
done

echo "✅ Waha is up. Configuring webhook for session '$SESSION_ID'..."

curl -X PUT "$WAHA_URL/api/sessions/$SESSION_ID" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: $WAHA_API_KEY_PLAIN" \
    -d '{
    "config": {
      "webhooks": [
        {
          "url": "'"$WEBHOOK_URL"'",
          "events": ["message"],
          "hmac": { "key": null },
          "retries": {
            "delaySeconds": 2,
            "attempts": 3,
            "policy": "exponential"
          },
          "customHeaders": null
        }
      ],
      "metadata": {}
    }
  }'

echo "✅ Webhook registered successfully."
