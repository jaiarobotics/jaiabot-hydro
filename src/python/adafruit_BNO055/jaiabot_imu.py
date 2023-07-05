#!/usr/bin/env python3
from time import sleep
from datetime import datetime
import random
import sys
import argparse
import socket
import logging
import time
from math import *
from dataclasses import dataclass
from jaiabot.messages.imu_pb2 import IMUData, IMUCommand

parser = argparse.ArgumentParser(description='Read orientation, linear acceleration, and gravity from an AdaFruit BNO055 sensor, and publish them over UDP port')
parser.add_argument('port', metavar='port', type=int, help='port to publish orientation data')
parser.add_argument('-l', dest='logging_level', default='WARNING', type=str, help='Logging level (CRITICAL, ERROR, WARNING, INFO, DEBUG), default is WARNING')
parser.add_argument('--simulator', action='store_true')
parser.add_argument('--interactive', action='store_true')
args = parser.parse_args()

logging.basicConfig(format='%(asctime)s %(levelname)10s %(message)s')
log = logging.getLogger('jaiabot_imu')
log.setLevel(args.logging_level)

try:
    import adafruit_bno055
    import board
except ModuleNotFoundError:
    log.warning('ModuleNotFoundError, so physical device not available')
except NotImplementedError:
    log.warning('NotImplementedError, so physical device not available')

@dataclass
class Orientation:
    heading: float
    pitch: float
    roll: float

def quaternion_to_euler_angles(q: tuple):
    DEG = pi / 180

    # roll (x-axis rotation)
    sinr_cosp = 2 * (q[0] * q[1] + q[2] * q[3])
    cosr_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2])
    roll = atan2(sinr_cosp, cosr_cosp)

    # pitch (y-axis rotation)
    sinp = sqrt(1 + 2 * (q[0] * q[2] - q[1] * q[3]))
    cosp = sqrt(1 - 2 * (q[0] * q[2] - q[1] * q[3]))
    pitch = -2 * atan2(sinp, cosp) + pi / 2

    # yaw (z-axis rotation)
    siny_cosp = 2 * (q[0] * q[3] + q[1] * q[2])
    cosy_cosp = 1 - 2 * (q[2] * q[2] + q[3] * q[3])
    yaw = -atan2(siny_cosp, cosy_cosp)

    if yaw < 0:
        yaw += (2 * pi)

    return Orientation(yaw / DEG, pitch / DEG, roll / DEG)


class AdafruitSimulator:
    is_data_good = True,
    euler = (0.0, 0.0, 0.0)
    linear_acceleration = (0, 0, 0)
    gravity = (0, 0, -9.8)
    calibration_status = (3, 3, 3, 3)
    quaternion = (1, 0, 0, 0)


class IMU:

    # Vars used to reset IMU if we are receiving no data
    reset_count = 0
    max_reset_count = 15

    def __init__(self, simulator=False):
        if simulator:
            self.sensor = AdafruitSimulator()
            self.is_setup = True
        else:
            self.is_setup = False

    def setup(self):
        if not self.is_setup:
            self.i2c = board.I2C()
            try:
                self.sensor = adafruit_bno055.BNO055_I2C(self.i2c, address=0x28)
            except ValueError: # From I2CDevice if not on 0x28: ValueError("No I2C device at address: 0x%x" % self.device_address)
                self.sensor = adafruit_bno055.BNO055_I2C(self.i2c, address=0x29)
            
            self.sensor.mode = adafruit_bno055.NDOF_MODE
            self.is_setup = True

            # Remap the axes of the IMU to match the physical placement in the JaiaBot (P2 in section 3.4 of the datasheet)
            self.sensor.axis_remap = (0, 1, 2, 1, 1, 0)

    def getData(self):
        if not self.is_setup:
            self.setup()
            
        imu_data = IMUData()

        euler = quaternion_to_euler_angles(self.sensor.quaternion)
        # There is a 90 degree offset, even after reading and implementing the docs as well as we could, sorry! -- Ed & Jason
        imu_data.euler_angles.heading = euler.heading + 90.0
        imu_data.euler_angles.pitch = euler.pitch
        imu_data.euler_angles.roll = euler.roll

        linear_acceleration = self.sensor.linear_acceleration
        imu_data.linear_acceleration.x = linear_acceleration[0]
        imu_data.linear_acceleration.y = linear_acceleration[1]
        imu_data.linear_acceleration.z = linear_acceleration[2]

        gravity = self.sensor.gravity
        imu_data.gravity.x = gravity[0]
        imu_data.gravity.y = gravity[1]
        imu_data.gravity.z = gravity[2]

        calibration_status = self.sensor.calibration_status
        imu_data.calibration_status.sys = calibration_status[0]
        imu_data.calibration_status.gyro = calibration_status[1]
        imu_data.calibration_status.accel = calibration_status[2]
        imu_data.calibration_status.mag = calibration_status[3]

        imu_data.bot_rolled_over = int(abs(euler.roll) > 90)

        return imu_data


# Setup the sensor
imu = IMU(simulator=args.simulator)


def do_port_loop():
    # Create socket
    port = args.port

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('', port))

    while True:

        data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes

        try:
            # Deserialize the message
            command = IMUCommand()
            command.ParseFromString(data)
            log.debug(f'Received command:\n{command}')

            # Execute the command
            if command.type == IMUCommand.TAKE_READING:
                imu_data = imu.getData()
                log.debug(imu_data)
                sock.sendto(imu_data.SerializeToString(), addr)

        except Exception as e:
            log.warning(e)


def do_interactive_loop():
    while True:
        input()
        print(imu.getData())



if __name__ == '__main__':
    if args.interactive:
        do_interactive_loop()
    else:
        do_port_loop()

