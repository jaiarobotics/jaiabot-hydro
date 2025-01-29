#!/bin/bash

# Exit immediately if a command exits with non-zero status
set -e

# Variables
BUILD_DIR="/Users/nickmarshall/jaia/jaiabot/src/payload/JAIA_BIO-PAYLOAD/Debug"
TARGET="JAIA_BIO-PAYLOAD"
ELF="$BUILD_DIR/$TARGET.elf"
BIN="$BUILD_DIR/$TARGET.bin"
FLASH_ADDR="0x08000000"
JOBS=9

# Remove old build files
echo "Removing old build files..."
rm -f "$BUILD_DIR/$TARGET."*
echo "Done."

# Build STM32 project
echo "Building STM32 project..."
make -j"$JOBS" all
echo "Done."

# Convert elf to bin for STM32 deployment
echo "Conerting .elf to .bin..." 
arm-none-eabi-objcopy -O binary "$ELF" "$BIN"
echo "Done."

# Flash the firmware to the STM32
echo "Flashing new firmware to STM32..."
sudo st-flash write "$BIN" "$FLASH_ADDR"
echo "Done."

# Reset MCU so new firmware takes effect
echo "Resetting STM32..."
sudo st-flash reset
echo "Done."

echo "Flashing complete!"