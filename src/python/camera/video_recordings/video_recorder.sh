#!/bin/bash

# Base directory for recordings
BASE_DIR="video_recordings"
COUNTER_FILE="${BASE_DIR}/counter.txt"

# Ensure base directory exists
mkdir -p "$BASE_DIR"

# Function to get the next recording number
get_next_recording_number() {
    if [ ! -f "$COUNTER_FILE" ]; then
        echo 1 > "$COUNTER_FILE"
    fi
    NEXT_NUM=$(cat "$COUNTER_FILE")
    echo $((NEXT_NUM))
}

# Function to increment the recording number
increment_recording_number() {
    NEXT_NUM=$(get_next_recording_number)
    echo $((NEXT_NUM + 1)) > "$COUNTER_FILE"
}

# Parse the command argument
if [ "$1" == "start" ]; then
    # Get the next recording number
    RECORDING_NUM=$(get_next_recording_number)
    increment_recording_number

    # Create subdirectory for this recording
    RECORDING_DIR="${BASE_DIR}/recording_${RECORDING_NUM}"
    mkdir -p "$RECORDING_DIR"

    # Define file names
    VIDEO_FILE="${RECORDING_DIR}/video_${RECORDING_NUM}.h264"
    LOG_FILE="${RECORDING_DIR}/recording_${RECORDING_NUM}.log"

    # Start recording
    echo "Starting recording ${RECORDING_NUM}..."
    nohup libcamera-vid -o "$VIDEO_FILE" -t 0 > "$LOG_FILE" 2>&1 &  # Adjust the `-t` value (in ms) as needed
    echo $! > "${RECORDING_DIR}/recording.pid"
    echo "Recording started: $VIDEO_FILE"
    echo "Logs: $LOG_FILE"

elif [ "$1" == "stop" ]; then
    # Find the last recording directory
    RECORDING_NUM=$(cat "$COUNTER_FILE")
    RECORDING_NUM=$((RECORDING_NUM - 1))
    RECORDING_DIR="${BASE_DIR}/recording_${RECORDING_NUM}"

    if [ ! -f "${RECORDING_DIR}/recording.pid" ]; then
        echo "No active recording found to stop."
        exit 1
    fi

    # Stop the recording process
    echo "Stopping recording ${RECORDING_NUM}..."
    kill "$(cat ${RECORDING_DIR}/recording.pid)"
    rm "${RECORDING_DIR}/recording.pid"
    echo "Recording ${RECORDING_NUM} stopped."

    # Convert the .h264 file to .mp4
    VIDEO_FILE="${RECORDING_DIR}/video_${RECORDING_NUM}.h264"
    MP4_FILE="${RECORDING_DIR}/video_${RECORDING_NUM}.mp4"
    if [ -f "$VIDEO_FILE" ]; then
        echo "Converting $VIDEO_FILE to $MP4_FILE..."
        ffmpeg -i "$VIDEO_FILE" -c:v copy "$MP4_FILE" > /dev/null 2>&1
        echo "Conversion complete: $MP4_FILE"
    else
        echo "Error: Video file $VIDEO_FILE not found."
    fi
else
    echo "Usage: $0 {start|stop}"
    exit 1
fi
