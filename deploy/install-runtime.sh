#!/usr/bin/env bash
# Run manually as root during controlled production bring-up; this script does
# not enable or start the service.
set -euo pipefail
install -d -o root -g root -m 0750 /var/lib/marketplace-question-operator
install -d -o root -g root -m 0750 /var/lib/marketplace-question-operator/jobs
install -m 0644 deploy/marketplace-question-operator.service /etc/systemd/system/marketplace-question-operator.service
systemctl daemon-reload
printf '%s\n' 'Unit installed. Install secrets, then enable/start during controlled live bring-up.'
