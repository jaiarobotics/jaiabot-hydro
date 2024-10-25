#!/bin/bash
set -u -e

while ! ping6 -c 1 "fd0f:77ac:4fdf:3::1e" &> /dev/null
do
    echo ">>>>>> Waiting for CloudHub (${CLOUDHUB_VPN_SERVER_IPV6}) to respond (this may take several minutes)..."
    sleep 1
done
echo ">>>>>> Ping successful!"
echo -e ">>>>>> Now you can log in with\n\tssh jaia@${CLOUDHUB_VPN_SERVER_IPV6}"
