#!/bin/bash

#BOARD=adafruit:avr:feather32u4
#PORT=/dev/ttyACM0

BOARD=arduino:avr:leonardo
PORT=/dev/ttyACM0
BUILD_DIR=${PWD}/build/

arduino-cli compile --build-path ${BUILD_DIR} --libraries ../libraries -b ${BOARD}
arduino-cli upload -v -p ${PORT} -b ${BOARD}
