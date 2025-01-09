#cloud-config

# Bot/Hub information (debconf for jaiabot-embedded)
apt:
  debconf_selections:
    jaiabot_embedded_set: |
      jaiabot-embedded        jaiabot-embedded/warp                      select 1
      jaiabot-embedded        jaiabot-embedded/type                      select bot
      jaiabot-embedded        jaiabot-embedded/hub_id                    select 0
      jaiabot-embedded        jaiabot-embedded/bot_id                    select 0
      jaiabot-embedded        jaiabot-embedded/data_offload_ignore_type  select none
      jaiabot-embedded        jaiabot-embedded/user_role                 select user
      jaiabot-embedded        jaiabot-embedded/imu_type                  select bno085
      jaiabot-embedded        jaiabot-embedded/bot_type                  select hydro
      jaiabot-embedded        jaiabot-embedded/fleet_id                  select 0
      jaiabot-embedded        jaiabot-embedded/led_type                  select none
      jaiabot-embedded        jaiabot-embedded/mode                      select runtime
      jaiabot-embedded        jaiabot-embedded/imu_install_type          select embedded
      jaiabot-embedded        jaiabot-embedded/electronics_stack         select 2
      jaiabot-embedded        jaiabot-embedded/arduino_type              select usb
      jaiabot-embedded        jaiabot-embedded/motor_harness_type        select none

# SSH authorized keys
write_files:
  # temporary keys
  - path: /etc/jaiabot/ssh/tmp_authorized_keys
    content: |
      # ssh-rsa AAAA_B64_KEY username
  # hub keys
  - path: /etc/jaiabot/ssh/hub_authorized_keys
    content: |
      # ssh-rsa AAAA_B64_KEY username
  # permanent keys
  - path: /home/jaia/.ssh/authorized_keys
    content: |
      # ssh-rsa AAAA_B64_KEY username

# Wifi
write_files:
  # address and gateway XXX and YYY will be automatically updated by jaiabot-embedded postinst
  - path: /etc/network/interfaces.d/wlan0
    content: |
      wpa-essid <SSID>
      wpa-psk <PASSWORD>
      address 10.23.XXX.YYY
      netmask 255.255.255.0
      gateway 10.23.XXX.1
  - path: /etc/network/interfaces.d/eth0
    content: |
      # auto eth0
      # iface eth0 inet dhcp


# Allows this config to merge correctly with standard-user-data.yml
# Generally this section should not be changed
merge_how:
 - name: list
   settings: [append]
 - name: dict
   settings: [no_replace, recurse_list]
