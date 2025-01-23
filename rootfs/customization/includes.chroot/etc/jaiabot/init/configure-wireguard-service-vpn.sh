#!/bin/bash

set -u -e

script_dir=$(dirname $0)
PRESEED_DIR="/boot/firmware/jaiabot/init"
PRIVATE_KEY=${PRESEED_DIR}/id_vpn_tmp

if [ ! -e "${PRIVATE_KEY}" ]; then
    echo "No ${PRIVATE_KEY} private key provided, not configuring Wireguard service VPN"
    exit 0
fi

if ! timeout 10 bash -c "until ping -c1 1.1.1.1 >/dev/null 2>&1; do :; done"; then
    echo "No network after 10 seconds, not configuring Wireguard server VPN"
    exit 1
fi

sudo mount -o remount,rw /boot/firmware
sudo mv ${PRIVATE_KEY} /home/jaia/.ssh/
sudo mount -o remount,ro /boot/firmware
PRIVATE_KEY="/home/jaia/.ssh/id_vpn_tmp"
sudo chown jaia:jaia ${PRIVATE_KEY}
chmod 700 ${PRIVATE_KEY}

type=$(debconf-get-selections | grep jaiabot-embedded/type | cut -f 4)
fleet=$(debconf-get-selections | grep jaiabot-embedded/fleet_id | cut -f 4)
id=""

if [ "$type" = "bot" ]; then
    id=$(debconf-get-selections | grep jaiabot-embedded/bot_id | cut -f 4)
fi

if [ "$type" = "hub" ]; then
    id=$(debconf-get-selections | grep jaiabot-embedded/hub_id | cut -f 4)
fi

SSH="ssh -o StrictHostKeyChecking=accept-new -i ${PRIVATE_KEY}"
# Extra path entry to /etc/jaiabot can be removed once vpn.jaia.tech has jaia-vpn.gen.sh from the jaiabot-apps package
$SSH ubuntu@vpn.jaia.tech "PATH=\$PATH:/etc/jaiabot; jaia-vpn-gen.sh fleet_vpn $type $id $fleet" 
$SSH ubuntu@vpn.jaia.tech "sudo systemctl restart wg-quick@wg_fleet$fleet"
sudo rsync --rsh="$SSH" ubuntu@vpn.jaia.tech:/tmp/${type}${id}/wg_jaia_sf${fleet}.conf /etc/wireguard/wg_jaia.conf

rm -f ${PRIVATE_KEY}