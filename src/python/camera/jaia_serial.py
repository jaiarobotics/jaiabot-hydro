from typing import *
from google.protobuf.message import *
import serial
import logging
import time
from binascii import crc32


log = logging.getLogger('jaia_serial')


class JaiaProtobufOverSerial:

    def __init__(self, device: str):
        self.device = device
        self.port = serial.Serial(device)
    
    def read(self, message_type: Callable[[], Message], timeout=0.1):
        start_time = time.time()

        magic = b'JAIA'

        # JAIA {length, 2 bytes} {crc-16, 2 bytes} {data}

        while True:

            # Skip to next magic
            magic_done = False
            self.port.timeout=timeout

            while not magic_done:
                magic_done = True
                for magic_index in range(0, 4):
                    if time.time() - start_time > timeout:
                        return None

                    data = self.port.read(1)
                    if len(data) > 0:
                        if data[0] != magic[magic_index]:
                            magic_done = False
                            break

            self.port.timeout = None

            # Read length
            data_length = int.from_bytes(self.port.read(2), 'big')

            # Read crc32
            crc = int.from_bytes(self.port.read(4), 'big')

            # Read data
            data = self.port.read(data_length)

            if crc != crc32(data):
                log.warning(f'crc32 mismatch: {crc} != {crc32(data)}')
                return None

            try:
                # Deserialize the message
                msg = message_type()
                msg.ParseFromString(data)
                log.debug(f'Received message:\n{msg}')
                return msg

            except Exception as e:
                log.warning(e)

    def write(self, message: Message):
        data: bytes = message.SerializeToString()

        self.port.write(b'JAIA')
        self.port.write(len(data).to_bytes(2, 'big'))
        self.port.write(crc32(data).to_bytes(4, 'big'))
        self.port.write(data)

