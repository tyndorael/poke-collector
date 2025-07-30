#!/bin/bash

# This script is designed to synchronize cards and sets with the backend API.

# --- Configuration ---
BACKEND_URL="http://localhost:3000/api/v1"
SYNC_ENDPOINT="/cards/sync-all"
SYNC_SETS_ENDPOINT="/sets/sync-all"

echo "--- Script for sync card started ---"
# Check if the backend URL is set
if [ -z "${BACKEND_URL}" ]; then
  echo "Error: BACKEND_URL is not set. Please set it to the backend API URL."
  exit 1
fi

echo "Calling the endpoint to synchronize sets..."
echo "This may take a while depending on the number of sets to synchronize."

SYNC_SETS_RESPONSE=$(curl -s -X POST "${BACKEND_URL}${SYNC_SETS_ENDPOINT}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
if echo "${SYNC_SETS_RESPONSE}" | grep -q "Sync set started. This may take a while"; then
  echo "Synchronization of sets started successfully."
  echo "Check the backend logs for progress."
else
  echo "Error during sets synchronization:"
  echo "${SYNC_SETS_RESPONSE}"
  exit 1
fi

echo "--- Sets synchronization completed ---"
echo "Now starting the synchronization of cards..."

echo "Calling the endpoint to synchronize cards..."
echo "This may take a while depending on the number of cards to synchronize."

SYNC_RESPONSE=$(curl -s -X POST "${BACKEND_URL}${SYNC_ENDPOINT}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "${SYNC_RESPONSE}" | grep -q "Sync card started"; then
  echo "Synchronization of cards started successfully."
  echo "Check the backend logs for progress."
else
  echo "Error during card synchronization:"
  echo "${SYNC_RESPONSE}"
  exit 1
fi

echo "--- Script for sync card finished ---"

echo "All synchronization tasks have been completed."
