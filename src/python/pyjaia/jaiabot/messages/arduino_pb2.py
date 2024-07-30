# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: jaiabot/messages/arduino.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf.internal import enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='jaiabot/messages/arduino.proto',
  package='jaiabot.protobuf',
  syntax='proto2',
  serialized_options=None,
  serialized_pb=_b('\n\x1ejaiabot/messages/arduino.proto\x12\x10jaiabot.protobuf\"?\n\x0f\x41rduinoSettings\x12\x15\n\rforward_start\x18\x01 \x02(\x11\x12\x15\n\rreverse_start\x18\x02 \x02(\x11\"\x87\x01\n\x10\x41rduinoActuators\x12\r\n\x05motor\x18\x01 \x02(\x11\x12\x15\n\rport_elevator\x18\x02 \x02(\x11\x12\x15\n\rstbd_elevator\x18\x03 \x02(\x11\x12\x0e\n\x06rudder\x18\x04 \x02(\x11\x12\x0f\n\x07timeout\x18\x05 \x02(\x11\x12\x15\n\rled_switch_on\x18\x06 \x02(\x08\"|\n\x0e\x41rduinoCommand\x12\x33\n\x08settings\x18\x01 \x01(\x0b\x32!.jaiabot.protobuf.ArduinoSettings\x12\x35\n\tactuators\x18\x02 \x01(\x0b\x32\".jaiabot.protobuf.ArduinoActuators\"\xf2\x01\n\x0f\x41rduinoResponse\x12\x38\n\x0bstatus_code\x18\x01 \x02(\x0e\x32#.jaiabot.protobuf.ArduinoStatusCode\x12\"\n\x1athermocouple_temperature_C\x18\x02 \x01(\x02\x12\x12\n\nvccvoltage\x18\x03 \x01(\x02\x12\x12\n\nvcccurrent\x18\x04 \x01(\x02\x12\x11\n\tvvcurrent\x18\x05 \x01(\x02\x12\r\n\x05motor\x18\x06 \x01(\x05\x12\x0b\n\x03\x63rc\x18\x32 \x01(\r\x12\x16\n\x0e\x63\x61lculated_crc\x18\x33 \x01(\r\x12\x12\n\x07version\x18\x34 \x02(\r:\x01\x30\"W\n\x0c\x41rduinoDebug\x12 \n\x11\x61rduino_restarted\x18\x01 \x01(\x08:\x05\x66\x61lse\x12%\n\x16\x61rduino_not_responding\x18\x02 \x01(\x08:\x05\x66\x61lse*\xc2\x01\n\x11\x41rduinoStatusCode\x12\x0b\n\x07STARTUP\x10\x00\x12\x07\n\x03\x41\x43K\x10\x01\x12\x0b\n\x07TIMEOUT\x10\x02\x12\x15\n\x11PREFIX_READ_ERROR\x10\x03\x12\x0f\n\x0bMAGIC_WRONG\x10\x04\x12\x13\n\x0fMESSAGE_TOO_BIG\x10\x05\x12\x16\n\x12MESSAGE_WRONG_SIZE\x10\x06\x12\x18\n\x14MESSAGE_DECODE_ERROR\x10\x07\x12\r\n\tCRC_ERROR\x10\x08\x12\x0c\n\x08SETTINGS\x10\t')
)

_ARDUINOSTATUSCODE = _descriptor.EnumDescriptor(
  name='ArduinoStatusCode',
  full_name='jaiabot.protobuf.ArduinoStatusCode',
  filename=None,
  file=DESCRIPTOR,
  values=[
    _descriptor.EnumValueDescriptor(
      name='STARTUP', index=0, number=0,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='ACK', index=1, number=1,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='TIMEOUT', index=2, number=2,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='PREFIX_READ_ERROR', index=3, number=3,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='MAGIC_WRONG', index=4, number=4,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='MESSAGE_TOO_BIG', index=5, number=5,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='MESSAGE_WRONG_SIZE', index=6, number=6,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='MESSAGE_DECODE_ERROR', index=7, number=7,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='CRC_ERROR', index=8, number=8,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='SETTINGS', index=9, number=9,
      serialized_options=None,
      type=None),
  ],
  containing_type=None,
  serialized_options=None,
  serialized_start=716,
  serialized_end=910,
)
_sym_db.RegisterEnumDescriptor(_ARDUINOSTATUSCODE)

ArduinoStatusCode = enum_type_wrapper.EnumTypeWrapper(_ARDUINOSTATUSCODE)
STARTUP = 0
ACK = 1
TIMEOUT = 2
PREFIX_READ_ERROR = 3
MAGIC_WRONG = 4
MESSAGE_TOO_BIG = 5
MESSAGE_WRONG_SIZE = 6
MESSAGE_DECODE_ERROR = 7
CRC_ERROR = 8
SETTINGS = 9



_ARDUINOSETTINGS = _descriptor.Descriptor(
  name='ArduinoSettings',
  full_name='jaiabot.protobuf.ArduinoSettings',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='forward_start', full_name='jaiabot.protobuf.ArduinoSettings.forward_start', index=0,
      number=1, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='reverse_start', full_name='jaiabot.protobuf.ArduinoSettings.reverse_start', index=1,
      number=2, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=52,
  serialized_end=115,
)


_ARDUINOACTUATORS = _descriptor.Descriptor(
  name='ArduinoActuators',
  full_name='jaiabot.protobuf.ArduinoActuators',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='motor', full_name='jaiabot.protobuf.ArduinoActuators.motor', index=0,
      number=1, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='port_elevator', full_name='jaiabot.protobuf.ArduinoActuators.port_elevator', index=1,
      number=2, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='stbd_elevator', full_name='jaiabot.protobuf.ArduinoActuators.stbd_elevator', index=2,
      number=3, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='rudder', full_name='jaiabot.protobuf.ArduinoActuators.rudder', index=3,
      number=4, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='timeout', full_name='jaiabot.protobuf.ArduinoActuators.timeout', index=4,
      number=5, type=17, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='led_switch_on', full_name='jaiabot.protobuf.ArduinoActuators.led_switch_on', index=5,
      number=6, type=8, cpp_type=7, label=2,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=118,
  serialized_end=253,
)


_ARDUINOCOMMAND = _descriptor.Descriptor(
  name='ArduinoCommand',
  full_name='jaiabot.protobuf.ArduinoCommand',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='settings', full_name='jaiabot.protobuf.ArduinoCommand.settings', index=0,
      number=1, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='actuators', full_name='jaiabot.protobuf.ArduinoCommand.actuators', index=1,
      number=2, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=255,
  serialized_end=379,
)


_ARDUINORESPONSE = _descriptor.Descriptor(
  name='ArduinoResponse',
  full_name='jaiabot.protobuf.ArduinoResponse',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='status_code', full_name='jaiabot.protobuf.ArduinoResponse.status_code', index=0,
      number=1, type=14, cpp_type=8, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='thermocouple_temperature_C', full_name='jaiabot.protobuf.ArduinoResponse.thermocouple_temperature_C', index=1,
      number=2, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='vccvoltage', full_name='jaiabot.protobuf.ArduinoResponse.vccvoltage', index=2,
      number=3, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='vcccurrent', full_name='jaiabot.protobuf.ArduinoResponse.vcccurrent', index=3,
      number=4, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='vvcurrent', full_name='jaiabot.protobuf.ArduinoResponse.vvcurrent', index=4,
      number=5, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='motor', full_name='jaiabot.protobuf.ArduinoResponse.motor', index=5,
      number=6, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='crc', full_name='jaiabot.protobuf.ArduinoResponse.crc', index=6,
      number=50, type=13, cpp_type=3, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='calculated_crc', full_name='jaiabot.protobuf.ArduinoResponse.calculated_crc', index=7,
      number=51, type=13, cpp_type=3, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='version', full_name='jaiabot.protobuf.ArduinoResponse.version', index=8,
      number=52, type=13, cpp_type=3, label=2,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=382,
  serialized_end=624,
)


_ARDUINODEBUG = _descriptor.Descriptor(
  name='ArduinoDebug',
  full_name='jaiabot.protobuf.ArduinoDebug',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='arduino_restarted', full_name='jaiabot.protobuf.ArduinoDebug.arduino_restarted', index=0,
      number=1, type=8, cpp_type=7, label=1,
      has_default_value=True, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='arduino_not_responding', full_name='jaiabot.protobuf.ArduinoDebug.arduino_not_responding', index=1,
      number=2, type=8, cpp_type=7, label=1,
      has_default_value=True, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=626,
  serialized_end=713,
)

_ARDUINOCOMMAND.fields_by_name['settings'].message_type = _ARDUINOSETTINGS
_ARDUINOCOMMAND.fields_by_name['actuators'].message_type = _ARDUINOACTUATORS
_ARDUINORESPONSE.fields_by_name['status_code'].enum_type = _ARDUINOSTATUSCODE
DESCRIPTOR.message_types_by_name['ArduinoSettings'] = _ARDUINOSETTINGS
DESCRIPTOR.message_types_by_name['ArduinoActuators'] = _ARDUINOACTUATORS
DESCRIPTOR.message_types_by_name['ArduinoCommand'] = _ARDUINOCOMMAND
DESCRIPTOR.message_types_by_name['ArduinoResponse'] = _ARDUINORESPONSE
DESCRIPTOR.message_types_by_name['ArduinoDebug'] = _ARDUINODEBUG
DESCRIPTOR.enum_types_by_name['ArduinoStatusCode'] = _ARDUINOSTATUSCODE
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

ArduinoSettings = _reflection.GeneratedProtocolMessageType('ArduinoSettings', (_message.Message,), dict(
  DESCRIPTOR = _ARDUINOSETTINGS,
  __module__ = 'jaiabot.messages.arduino_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.ArduinoSettings)
  ))
_sym_db.RegisterMessage(ArduinoSettings)

ArduinoActuators = _reflection.GeneratedProtocolMessageType('ArduinoActuators', (_message.Message,), dict(
  DESCRIPTOR = _ARDUINOACTUATORS,
  __module__ = 'jaiabot.messages.arduino_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.ArduinoActuators)
  ))
_sym_db.RegisterMessage(ArduinoActuators)

ArduinoCommand = _reflection.GeneratedProtocolMessageType('ArduinoCommand', (_message.Message,), dict(
  DESCRIPTOR = _ARDUINOCOMMAND,
  __module__ = 'jaiabot.messages.arduino_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.ArduinoCommand)
  ))
_sym_db.RegisterMessage(ArduinoCommand)

ArduinoResponse = _reflection.GeneratedProtocolMessageType('ArduinoResponse', (_message.Message,), dict(
  DESCRIPTOR = _ARDUINORESPONSE,
  __module__ = 'jaiabot.messages.arduino_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.ArduinoResponse)
  ))
_sym_db.RegisterMessage(ArduinoResponse)

ArduinoDebug = _reflection.GeneratedProtocolMessageType('ArduinoDebug', (_message.Message,), dict(
  DESCRIPTOR = _ARDUINODEBUG,
  __module__ = 'jaiabot.messages.arduino_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.ArduinoDebug)
  ))
_sym_db.RegisterMessage(ArduinoDebug)


# @@protoc_insertion_point(module_scope)