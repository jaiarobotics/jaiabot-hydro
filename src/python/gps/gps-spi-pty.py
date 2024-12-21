#!/usr/bin/env python3
import time
import spidev
import signal
import sys
import argparse
import os
import stat
import pty
import systemd.daemon
import termios

"""Create a PTY and send all the SPI GPS data to it"""

parser = argparse.ArgumentParser()
parser.add_argument('pty_path', help="Path to create the PTY symlink")
args = parser.parse_args()

# Create PTY and setup symlink
internal_pty, external_pty = pty.openpty()
try:
    os.remove(args.pty_path)
except FileNotFoundError:
    pass

external_pty_name = os.ttyname(external_pty)
os.symlink(external_pty_name, args.pty_path)
os.chmod(external_pty_name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)

output = os.fdopen(internal_pty, "wb")

# Notify systemd after we have set up the PTY
# to ensure that dependencies (e.g. GPSD) can see it when they start
systemd.daemon.notify("READY=1")

# Initialize SPI connection
SPI = spidev.SpiDev()
def connect_spi():
    SPI.open(1, 1)
    SPI.max_speed_hz = 5000000
    SPI.mode = 0

    # Enable the UBX protocol
    ubx_enable = [0xB5, 0x62, 0x06, 0x01, 0x03, 0x00, 0xF0, 0x00, 0xF9]
    SPI.xfer2(ubx_enable)

    time.sleep(0.1)

    # Request the GPS module to output all NMEA strings
    nmea_output_request = [0xB5, 0x62, 0x06, 0x01, 0x03, 0x00, 0xF0, 0x01, 0x00, 0xFA, 0x00]
    SPI.xfer2(nmea_output_request)

    time.sleep(0.1)

    # Set the navigation rate to 5Hz
    nav_rate = [0xB5, 0x62, 0x06, 0x08, 0x06, 0x00, 0xC8, 0x00, 0x01, 0x00, 0x01, 0x00, 0xDE, 0x6A]
    SPI.xfer2(nav_rate)
    time.sleep(0.1)

# Graceful shutdown on Ctrl-C
def handle_ctrl_c(signal, frame):
    output.close()
    SPI.close()
    sys.exit(0)

signal.signal(signal.SIGINT, handle_ctrl_c)

# Connect to SPI
connect_spi()

# Store last unique messages
last_message = None

# Main loop to read and forward NMEA messages
while True:
    try:
        # Flush PTY input buffer
        termios.tcflush(internal_pty, termios.TCIFLUSH)

        # Read NMEA messages
        nmea_data = SPI.readbytes(1024)
        nmea_message = bytes(nmea_data).decode('utf-8', errors='ignore').strip()

        # Write unique messages to the PTY
        if nmea_message and nmea_message != last_message:
            os.write(internal_pty, nmea_message.encode('utf-8'))
            last_message = nmea_message

        time.sleep(0.1)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        time.sleep(1)
    

