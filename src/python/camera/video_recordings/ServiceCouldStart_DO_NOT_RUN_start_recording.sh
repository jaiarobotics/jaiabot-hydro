#!/bin/bash

# Define the base directory for recordings
BASE_DIR="/home/pi/video_recordings"

# Find the highest numbered folder and increment it for the new folder
NEXT_DIR=$(find $BASE_DIR -maxdepth 1 -type d -name 'recording_*' | \
           sed 's|.*/recording_||' | sort -n | tail -n 1)
NEXT_DIR=$((NEXT_DIR + 1))
RECORD_DIR="${BASE_DIR}/recording_$NEXT_DIR"

# Create the new recording directory
mkdir -p "$RECORD_DIR"

# Define the output file paths
RAW_VIDEO="$RECORD_DIR/video.h264"
FINAL_VIDEO="$RECORD_DIR/video.mp4"

# Start recording with libcamera-vid and save raw .h264 video
libcamera-vid -t 0 --output "$RAW_VIDEO" &

## Wait a few seconds to ensure video recording starts
#sleep 5

## Convert the .h264 file to .mp4 using ffmpeg
# ffmpeg -i "$RAW_VIDEO" -c copy "$FINAL_VIDEO"

# (Optional) Cleanup: Uncomment this if you want to delete the raw .h264 file
# rm "$RAW_VIDEO"
