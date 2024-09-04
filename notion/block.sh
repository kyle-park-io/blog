#!/bin/sh

SCRIPT_DIR=$(dirname "$(realpath "$0")")

# API KEY
PAGE="adb83a89bbae43ecb2a8c1e4a01a9e4b"
NOTION_API_KEY=$(head -n 1 ${SCRIPT_DIR}/api_key.txt)

# ENDPOINT
NOTION_API_URL="https://api.notion.com/v1/blocks/${PAGE}"

RESULT=$(
    curl -X 'GET' \
        "$NOTION_API_URL" \
        -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
        -H 'Notion-Version: 2022-06-28'
)
echo $RESULT
