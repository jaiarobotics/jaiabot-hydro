#!/bin/bash

# docker run -v /home/toby/opensource/jaiabot:/jaiabot -it ubuntu:jammy /jaiabot/config/fleet/debconf-fleet.sh

apt update
apt install -y debconf-utils whiptail
export DEBIAN_PRIORITY=low

cat <<EOF | debconf-set-selections
unknown jaiabot-embedded/type select hub
unknown jaiabot-embedded/fleet_id select 0
unknown jaiabot-embedded/hub_id select 0
unknown jaiabot-embedded/mode select runtime
EOF

/jaiabot/debian/jaiabot-embedded.config

cat <<EOF | debconf-set-selections
unknown jaiabot-embedded/type select bot
unknown jaiabot-embedded/bot_id select 0
EOF

/jaiabot/debian/jaiabot-embedded.config

debconf-get-selections | grep jaiabot-embedded | sed 's/^unknown/jaiabot-embedded/' > /jaiabot/config/fleet/selections.txt

