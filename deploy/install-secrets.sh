#!/usr/bin/env bash
set -eu
install -d -m 700 /etc/marketplace-question-operator
umask 077
printf 'TELEGRAM_BOT_TOKEN='; read -r -s token; printf '\n'
printf 'TELEGRAM_OPERATOR_USER_ID='; read -r operator
printf 'WB_API_TOKEN='; read -r -s wb; printf '\n'
printf 'OZON_CLIENT_ID='; read -r oid
printf 'OZON_API_KEY='; read -r -s okey; printf '\n'
printf 'TELEGRAM_BOT_TOKEN=%s\nTELEGRAM_OPERATOR_USER_ID=%s\nWB_API_TOKEN=%s\nOZON_CLIENT_ID=%s\nOZON_API_KEY=%s\n' "$token" "$operator" "$wb" "$oid" "$okey" > /etc/marketplace-question-operator/secrets.env
chmod 600 /etc/marketplace-question-operator/secrets.env
chown root:root /etc/marketplace-question-operator/secrets.env
