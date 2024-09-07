#!/bin/bash

set -a
source <(grep -v '^#' .env | sed -E 's/[[:space:]]*=[[:space:]]*/=/g')
set +a