#!/usr/bin/env python3

# JaiaBot Camera Driver version 0.0.1 alpha


import time
import os
import argparse
from camera_driver_pb2 import *
import logging
import datetime
from typing import *
from jaia_serial import *


def parse_args():
    parser = argparse.ArgumentParser(description='JaiaBot Camera Driver')
    parser.add_argument('--device', required=True, help='Serial device to listen for camera commands')
    parser.add_argument('--simulate', action='store_true', help='Just print the commands, do not execute them')

    global args
    args = parser.parse_args()

    global log
        logging.basicConfig(level=logging.INFO)
    log = logging.getLogger('camera_driver')


def now_string():
    return datetime.datetime.now().isoformat()


class Camera:

    def __init__(self):
        from picamera2 import Picamera2
        from picamera2.encoders import H264Encoder

        self.cam = Picamera2()
        self.encoder = H264Encoder(10000000)

        self.image_capture_interval = None
        self.last_image_capture = 0.0

        self.output_dir = datetime.datetime.now().strftime('%Y-%b-%d')
        os.makedirs(self.output_dir, exist_ok=True)

    def do_command(self, command: CameraCommand):
        if args.debug:
            log.info(command)
            return

        if command.type == CameraCommand.CameraCommandType.START_IMAGES:
            self.image_capture_interval = command.image_capture_interval
            

        if command.type == CameraCommand.CameraCommandType.STOP_IMAGES:
            self.image_capture_interval = None
            

        if command.type == CameraCommand.CameraCommandType.START_VIDEO:
            video_config = self.cam.create_video_configuration()
            self.cam.configure(video_config)
            self.cam.start_recording(self.encoder, f'{self.output_dir}/video-{now_string()}.h264')

        
        if command.type == CameraCommand.CameraCommandType.STOP_VIDEO:
            self.cam.stop_recording()


    def loop(self):
        if self.image_capture_interval is not None:
            t = time.time()
            if t - self.last_image_capture > self.image_capture_interval:
                self.last_image_capture = t

                capture_config = self.cam.create_still_configuration()
                self.cam.start(show_preview=False)
                self.cam.switch_mode_and_capture_file(capture_config, f'{self.output_dir}/image-{now_string()}.jpg')


def main():
    if args.debug:
        cam = None
    else:
        cam = Camera()

    port = JaiaProtobufOverSerial(args.device)

    while True:
        msg = port.read(CameraCommand, timeout=0.1)

        if msg is not None:
            if not args.debug:
                cam.do_command(msg)

        cam.loop()


if __name__ == '__main__':
    parse_args()
    main()
