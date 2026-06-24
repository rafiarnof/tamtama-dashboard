#!/bin/bash

# ============================================
# TEST SCRIPT - ESP32 PUMP CONTROL
# ============================================
# Script untuk test command queue system
# 
# Usage:
#   chmod +x test-pump-control.sh
#   ./test-pump-control.sh
# ============================================

# Configuration
PROJECT_ID="wgjudfgqjqorkhdlvlgc"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnanVkZmdxanFvcmtoZGx2bGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDA4MzEsImV4cCI6MjA5NDcxNjgzMX0.0VZJGMIVTn4jYoAAM5e-aZynmpoV7sboshPgREPrrog"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-5aa965b0"
SECTOR_ID="SEC-001"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║       TEST ESP32 PUMP CONTROL - COMMAND QUEUE             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# TEST 1: Health Check
# ============================================
echo "📡 TEST 1: Health Check"
echo "────────────────────────────────────────────────────────────"
curl -s "${BASE_URL}/health" | jq '.'
echo ""
echo "✅ Test 1 Complete"
echo ""

# ============================================
# TEST 2: Send Pump Control Command (Web → Server)
# ============================================
echo "🔧 TEST 2: Send Pump Control Command (ON)"
echo "────────────────────────────────────────────────────────────"
curl -s -X POST "${BASE_URL}/iot/pump-control" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "{
    \"sectorId\": \"${SECTOR_ID}\",
    \"pumpStatus\": \"ON\"
  }" | jq '.'
echo ""
echo "✅ Test 2 Complete"
echo ""

# Wait for command to be stored
echo "⏳ Waiting 2 seconds for command to be stored..."
sleep 2
echo ""

# ============================================
# TEST 3: ESP32 Poll Command
# ============================================
echo "🤖 TEST 3: ESP32 Poll Command (GET /pump-command)"
echo "────────────────────────────────────────────────────────────"
RESPONSE=$(curl -s "${BASE_URL}/pump-command/${SECTOR_ID}" \
  -H "Authorization: Bearer ${ANON_KEY}")
echo "$RESPONSE" | jq '.'

# Check if executed is false
EXECUTED=$(echo "$RESPONSE" | jq -r '.executed')
STATUS=$(echo "$RESPONSE" | jq -r '.status')

echo ""
if [ "$EXECUTED" = "false" ] && [ "$STATUS" = "ON" ]; then
  echo "✅ EXPECTED: Command found with executed=false, status=ON"
else
  echo "❌ UNEXPECTED: executed=${EXECUTED}, status=${STATUS}"
fi
echo ""
echo "✅ Test 3 Complete"
echo ""

# ============================================
# TEST 4: ESP32 Acknowledge Command
# ============================================
echo "✅ TEST 4: ESP32 Acknowledge Command"
echo "────────────────────────────────────────────────────────────"
curl -s -X POST "${BASE_URL}/pump-acknowledge/${SECTOR_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{}' | jq '.'
echo ""
echo "✅ Test 4 Complete"
echo ""

# Wait for acknowledgment to be processed
echo "⏳ Waiting 2 seconds for acknowledgment to be processed..."
sleep 2
echo ""

# ============================================
# TEST 5: Verify Command Executed
# ============================================
echo "🔍 TEST 5: Verify Command is Executed"
echo "────────────────────────────────────────────────────────────"
RESPONSE=$(curl -s "${BASE_URL}/pump-command/${SECTOR_ID}" \
  -H "Authorization: Bearer ${ANON_KEY}")
echo "$RESPONSE" | jq '.'

# Check if executed is true
EXECUTED=$(echo "$RESPONSE" | jq -r '.executed')
echo ""
if [ "$EXECUTED" = "true" ]; then
  echo "✅ EXPECTED: Command marked as executed=true"
else
  echo "❌ UNEXPECTED: Command still executed=false"
fi
echo ""
echo "✅ Test 5 Complete"
echo ""

# ============================================
# TEST 6: Send OFF Command
# ============================================
echo "🔧 TEST 6: Send Pump Control Command (OFF)"
echo "────────────────────────────────────────────────────────────"
curl -s -X POST "${BASE_URL}/iot/pump-control" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "{
    \"sectorId\": \"${SECTOR_ID}\",
    \"pumpStatus\": \"OFF\"
  }" | jq '.'
echo ""
echo "✅ Test 6 Complete"
echo ""

# ============================================
# SUMMARY
# ============================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║                   TEST SUMMARY                            ║"
echo "║                                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║  ✅ Test 1: Health Check                                 ║"
echo "║  ✅ Test 2: Send ON Command                              ║"
echo "║  ✅ Test 3: ESP32 Poll (should get executed=false)       ║"
echo "║  ✅ Test 4: ESP32 Acknowledge                            ║"
echo "║  ✅ Test 5: Verify Executed (should be executed=true)    ║"
echo "║  ✅ Test 6: Send OFF Command                             ║"
echo "║                                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║  📝 NEXT STEPS:                                          ║"
echo "║                                                           ║"
echo "║  1. Deploy Edge Function:                                ║"
echo "║     supabase functions deploy make-server-5aa965b0       ║"
echo "║                                                           ║"
echo "║  2. Upload ESP32 code ke board                           ║"
echo "║                                                           ║"
echo "║  3. Test dari web dashboard                              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
