#!/usr/bin/env python3

# JaiaBot Camera Driver version 0.0.1 alpha


from camera_driver_pb2 import *
import logging, argparse, jaia_serial
from google.protobuf import text_format


def parse_args():
    parser = argparse.ArgumentParser(description='JaiaBot Camera Driver Tester')
    parser.add_argument('--device', required=True, help='Serial device to send camera commands')

    global args
    args = parser.parse_args()

    global log
    logging.basicConfig(level=logging.INFO)
    log = logging.getLogger('test_camera_driver')


def main():

    print(f'Using device {args.device}')
    port = jaia_serial.JaiaProtobufOverSerial(args.device)

    while True:
        command_string = input('Input command in protobuf string format >> ')
        try:
            command = text_format.Parse(command_string, CameraCommand())
            port.write(command)
        except Exception as e:
            print(e)

if __name__ == '__main__':
    parse_args()
    main()
