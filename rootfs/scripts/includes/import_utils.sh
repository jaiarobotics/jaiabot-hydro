function find_uuid()
{
    local VMNAME="$1"
    local GROUP="$2"
    for uuid in `vboxmanage list vms | grep "\"${VMNAME}\"" | sed 's/.*{\(.*\)}.*/\1/'`; do vboxmanage showvminfo --machinereadable $uuid | grep -q "groups=\"${GROUP}\"" && UUID="$uuid"; done
}

function find_diskuuid()
{
    local UUID="$1"
    DISKUUID=$(vboxmanage showvminfo --machinereadable "$UUID" | grep "SATA Controller-ImageUUID-0-0" | sed 's/"SATA Controller-ImageUUID-0-0"="\(.*\)"/\1/')
}

function write_preseed()
{
    local DISKUUID="$1"
    local N="$2"
    local BOT_OR_HUB="$3"
    
    ### mount disks
    ## BOOT
    local VBOX_MOUNT_PATH="/tmp/vbox-jaia/${DISKUUID}"
    mkdir -p "${VBOX_MOUNT_PATH}"
    vboximg-mount -i "${DISKUUID}" --rw --root "${VBOX_MOUNT_PATH}"
    sudo mount "${VBOX_MOUNT_PATH}/vol0" /mnt

    # Add space to the front so we can use these later in the YAML file
    ssh_keys=$(cat $HOME/.ssh/*.pub | sed "s/^/      /")
    
    cat <<EOF | sudo tee /mnt/jaiabot/init/first-boot.preseed.yml
#cloud-config

# Bot/Hub information (debconf for jaiabot-embedded)
apt:
  debconf_selections:
    jaiabot_embedded_set: |
      jaiabot-embedded  jaiabot-embedded/led_type                 select none
      jaiabot-embedded  jaiabot-embedded/motor_harness_type       select none
      jaiabot-embedded  jaiabot-embedded/bot_type                 select hydro
      jaiabot-embedded  jaiabot-embedded/warp                     select 10
      jaiabot-embedded  jaiabot-embedded/arduino_type             select none
      jaiabot-embedded  jaiabot-embedded/pressure_sensor_type     select bar30
      jaiabot-embedded  jaiabot-embedded/fleet_id                 select ${FLEET}
      jaiabot-embedded  jaiabot-embedded/imu_install_type         select embedded
      jaiabot-embedded  jaiabot-embedded/imu_type                 select bno085
      jaiabot-embedded  jaiabot-embedded/type                     select ${BOT_OR_HUB}
      jaiabot-embedded  jaiabot-embedded/mode                     select simulation
      jaiabot-embedded  jaiabot-embedded/electronics_stack        select 2
      jaiabot-embedded  jaiabot-embedded/data_offload_ignore_type select none
      jaiabot-embedded  jaiabot-embedded/bot_id                   select ${N}
      jaiabot-embedded  jaiabot-embedded/temperature_sensor_type  select bar30
      jaiabot-embedded  jaiabot-embedded/user_role                select user
      jaiabot-embedded  jaiabot-embedded/hub_id                   select ${N}

write_files:
  ## SSH authorized keys
  # temporary keys
  - path: /etc/jaiabot/ssh/tmp_authorized_keys
    content: |
      # ssh-rsa AAAA_B64_KEY username
  # hub keys
  - path: /etc/jaiabot/ssh/hub_authorized_keys
    content: |
      # ssh-rsa AAAA_B64_KEY username
  # permanent keys - gets moved to /home/jaia/.ssh/authorized_keys after jaia user is created
  - path: /etc/jaiabot/ssh/jaia_authorized_keys
    content: |
${ssh_keys}

  ## Wifi
  # SSID, address and gateway XXX and YYY will be automatically updated by jaiabot-embedded postinst
  # Only <PASSWORD> needs to be manually updated
  - path: /etc/network/interfaces.d/wlan0
    content: |
      auto wlan0
      iface wlan0 inet static
      #  wpa-essid SSID
      #  wpa-psk dummy
        address 10.23.XXX.YYY
        netmask 255.255.255.0
        gateway 10.23.XXX.1
  - path: /etc/network/interfaces.d/eth0
    content: |
      # auto eth0
      # iface eth0 inet dhcp
EOF

    sudo umount /mnt
   
    sudo umount -l "${VBOX_MOUNT_PATH}"
}
