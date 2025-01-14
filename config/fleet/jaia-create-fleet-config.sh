#!/bin/bash
set -e -u

if [ ! $# -eq 1 ]; then
   echo "Usage $0 fleet.cfg"
   exit 1;
fi

out="$1"

script_dir=$(realpath `dirname $0`)
USING_PRESEED=false

source ${script_dir}/include/wt_tools.sh

FLEETS=($(seq 0 31))
run_wt_menu jaia_fleet_index "Fleet Configuration" "Which fleet to create?" "${FLEETS[@]}"
[ $? -eq 0 ] || exit 1
FLEET_ID="$WT_CHOICE"

HUBS=($(seq 1 30))
run_wt_checklist jaia_hubs "Fleet Configuration" "Which hubs are in the fleet?" "${HUBS[@]}"
[ $? -eq 0 ] || exit 1
HUB_IDS="$WT_CHOICE"

BOTS=($(seq 1 150))
run_wt_checklist jaia_bots "Fleet Configuration" "Which bots are in the fleet?" "${BOTS[@]}"
[ $? -eq 0 ] || exit 1
BOT_IDS="$WT_CHOICE"


# query for fleet composition

echo "fleet: ${FLEET_ID}" > $out
echo "hubs: [$(echo ${HUB_IDS[@]} | tr -d '"' | sed 's/ /,/g')]" >> $out
echo "bots: [$(echo ${BOT_IDS[@]} | tr -d '"' | sed 's/ /,/g')]" >> $out

echo "ssh {" >> $out
# generate hub ssh keys
for HUB_ID_QUOTED in ${HUB_IDS}
do    
    HUB_ID=$(eval echo ${HUB_ID_QUOTED})
    KEYNAME="hub${HUB_ID}_fleet${FLEET_ID}"
    PRIVKEY="/tmp/${KEYNAME}"
    PUBKEY="${PRIVKEY}.pub"
    ssh-keygen -f $PRIVKEY -t ed25519 -N "" -C "$KEYNAME"
    PRIVKEY_CONTENTS=$(awk '{print "\"" $0 "\\n\""}' ${PRIVKEY})    
    PUBKEY_CONTENTS="\"$(cat ${PUBKEY})\""
    echo "  hub { id: ${HUB_ID} private_key: ${PRIVKEY_CONTENTS} public_key: ${PUBKEY_CONTENTS} }" >> $out
    rm $PRIVKEY $PUBKEY
done
echo "}" >> $out

run_wt_inputbox jaia_wlan_password "Fleet Configuration" "Enter WIFI password"
WLAN_PASSWORD=$WT_TEXT
echo "wlan_password: \"${WLAN_PASSWORD}\"" >> $out

vpn_enabled="false"
run_wt_yesno jaia_service_vpn_enabled "Fleet Configuration" "Should the service Wireguard VPN be enabled at boot?" && vpn_enabled="true"
echo "service_vpn_enabled: $vpn_enabled" >> $out

jaiabot_root=$(realpath "${script_dir}/../..")
docker run -v ${jaiabot_root}:/jaiabot -it ubuntu:latest /jaiabot/config/fleet/debconf-fleet.sh

awk '
BEGIN {
    # Print opening of the debconf entries
    printf ""
}
{
    # Skip lines containing keys to be excluded
    if ($2 ~ /\/(bot_id|hub_id|type|fleet_id|mode|debconf_state_common|debconf_state_hub|debconf_state_bot|warp)/) next;

    # Print debconf entry
    printf "debconf {\n";
    printf "  key: \"%s\"\n", $2;
    printf "  type: %s\n", toupper($3);
    printf "  value: \"%s\"\n", $4;
    printf "}\n";
}' ${jaiabot_root}/config/fleet/selections.txt >> $out

jaia admin fleet validate -vv $out
