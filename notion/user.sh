#!/bin/sh

SCRIPT_DIR=$(dirname "$(realpath "$0")")

# API KEY
NOTION_API_KEY=$(head -n 1 ${SCRIPT_DIR}/api_key.txt)

# ENDPOINT
NOTION_API_URL="https://api.notion.com/v1/users"

RESULT=$(
    curl -X 'GET' \
        "$NOTION_API_URL" \
        -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
        -H 'Notion-Version: 2022-06-28'
)

# PERSON
PERSON=$(echo "$RESULT" | jq -r '.results[] | select(.type == "person") | .id') >${SCRIPT_DIR}/user.txt
echo $PERSON >"${SCRIPT_DIR}/user.txt"

# BOT
BOT=$(echo "$RESULT" | jq -r '.results[] | select(.type == "bot") | .id') >${SCRIPT_DIR}/bot.txt
echo $BOT >"${SCRIPT_DIR}/bot.txt"
