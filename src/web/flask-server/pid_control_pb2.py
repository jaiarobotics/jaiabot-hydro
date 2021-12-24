# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: pid_control.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from dccl import option_extensions_pb2 as dccl_dot_option__extensions__pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='pid_control.proto',
  package='jaiabot.protobuf.rest',
  syntax='proto2',
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_pb=b'\n\x11pid_control.proto\x12\x15jaiabot.protobuf.rest\x1a\x1c\x64\x63\x63l/option_extensions.proto\"A\n\x14GeographicCoordinate\x12\x0b\n\x03lat\x18\x01 \x02(\x01\x12\x0b\n\x03lon\x18\x02 \x02(\x01:\x0f\xa2?\x0c\x08Z\x10\xfa\x01(\x03\xf2\x01\x02si\"\x84\x03\n\tBotStatus\x12\x0e\n\x06\x62ot_id\x18\x01 \x02(\r\x12\x0c\n\x04time\x18\x02 \x02(\x04\x12=\n\x08location\x18\n \x01(\x0b\x32+.jaiabot.protobuf.rest.GeographicCoordinate\x12\r\n\x05\x64\x65pth\x18\x0b \x01(\x01\x12;\n\x08\x61ttitude\x18\x14 \x01(\x0b\x32).jaiabot.protobuf.rest.BotStatus.Attitude\x12\x35\n\x05speed\x18\x1e \x01(\x0b\x32&.jaiabot.protobuf.rest.BotStatus.Speed\x1aT\n\x08\x41ttitude\x12\x0c\n\x04roll\x18\x01 \x01(\x01\x12\r\n\x05pitch\x18\x02 \x01(\x01\x12\x0f\n\x07heading\x18\x03 \x01(\x01\x12\x1a\n\x12\x63ourse_over_ground\x18\x04 \x01(\x01\x1a\x30\n\x05Speed\x12\x13\n\x0bover_ground\x18\x01 \x01(\x01\x12\x12\n\nover_water\x18\x02 \x01(\x01:\x0f\xa2?\x0c\x08[\x10\xfa\x01(\x03\xf2\x01\x02si\"\xaa\x03\n\x07\x43ommand\x12)\n\x08throttle\x18\x03 \x01(\x01\x42\x17\xa2?\x14 \x00)\x00\x00\x00\x00\x00\x00Y\xc0\x31\x00\x00\x00\x00\x00\x00Y@\x12\x38\n\x05speed\x18\x04 \x01(\x0b\x32).jaiabot.protobuf.rest.Command.PIDControl\x12\'\n\x06rudder\x18\x01 \x01(\x01\x42\x17\xa2?\x14 \x00)\x00\x00\x00\x00\x00\x00Y\xc0\x31\x00\x00\x00\x00\x00\x00Y@\x12:\n\x07heading\x18\x02 \x01(\x0b\x32).jaiabot.protobuf.rest.Command.PIDControl\x1a\xc3\x01\n\nPIDControl\x12\x46\n\x06target\x18\x01 \x01(\x01\x42\x36\xa2?3 \x00)\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00\x00\x00\x00\x00\x80v@\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12#\n\x02Kp\x18\x02 \x01(\x01\x42\x17\xa2?\x14 \x02)\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00\x00\x00\x00\x00\x00Y@\x12#\n\x02Ki\x18\x03 \x01(\x01\x42\x17\xa2?\x14 \x02)\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00\x00\x00\x00\x00\x00Y@\x12#\n\x02Kd\x18\x04 \x01(\x01\x42\x17\xa2?\x14 \x02)\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00\x00\x00\x00\x00\x00Y@:\x0f\xa2?\x0c\x08\\\x10\xfa\x01(\x03\xf2\x01\x02si'
  ,
  dependencies=[dccl_dot_option__extensions__pb2.DESCRIPTOR,])




_GEOGRAPHICCOORDINATE = _descriptor.Descriptor(
  name='GeographicCoordinate',
  full_name='jaiabot.protobuf.rest.GeographicCoordinate',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='lat', full_name='jaiabot.protobuf.rest.GeographicCoordinate.lat', index=0,
      number=1, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='lon', full_name='jaiabot.protobuf.rest.GeographicCoordinate.lon', index=1,
      number=2, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=b'\242?\014\010Z\020\372\001(\003\362\001\002si',
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=74,
  serialized_end=139,
)


_BOTSTATUS_ATTITUDE = _descriptor.Descriptor(
  name='Attitude',
  full_name='jaiabot.protobuf.rest.BotStatus.Attitude',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='roll', full_name='jaiabot.protobuf.rest.BotStatus.Attitude.roll', index=0,
      number=1, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='pitch', full_name='jaiabot.protobuf.rest.BotStatus.Attitude.pitch', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='heading', full_name='jaiabot.protobuf.rest.BotStatus.Attitude.heading', index=2,
      number=3, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='course_over_ground', full_name='jaiabot.protobuf.rest.BotStatus.Attitude.course_over_ground', index=3,
      number=4, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
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
  serialized_start=379,
  serialized_end=463,
)

_BOTSTATUS_SPEED = _descriptor.Descriptor(
  name='Speed',
  full_name='jaiabot.protobuf.rest.BotStatus.Speed',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='over_ground', full_name='jaiabot.protobuf.rest.BotStatus.Speed.over_ground', index=0,
      number=1, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='over_water', full_name='jaiabot.protobuf.rest.BotStatus.Speed.over_water', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
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
  serialized_start=465,
  serialized_end=513,
)

_BOTSTATUS = _descriptor.Descriptor(
  name='BotStatus',
  full_name='jaiabot.protobuf.rest.BotStatus',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='bot_id', full_name='jaiabot.protobuf.rest.BotStatus.bot_id', index=0,
      number=1, type=13, cpp_type=3, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='time', full_name='jaiabot.protobuf.rest.BotStatus.time', index=1,
      number=2, type=4, cpp_type=4, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='location', full_name='jaiabot.protobuf.rest.BotStatus.location', index=2,
      number=10, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='depth', full_name='jaiabot.protobuf.rest.BotStatus.depth', index=3,
      number=11, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='attitude', full_name='jaiabot.protobuf.rest.BotStatus.attitude', index=4,
      number=20, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='speed', full_name='jaiabot.protobuf.rest.BotStatus.speed', index=5,
      number=30, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[_BOTSTATUS_ATTITUDE, _BOTSTATUS_SPEED, ],
  enum_types=[
  ],
  serialized_options=b'\242?\014\010[\020\372\001(\003\362\001\002si',
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=142,
  serialized_end=530,
)


_COMMAND_PIDCONTROL = _descriptor.Descriptor(
  name='PIDControl',
  full_name='jaiabot.protobuf.rest.Command.PIDControl',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='target', full_name='jaiabot.protobuf.rest.Command.PIDControl.target', index=0,
      number=1, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\242?3 \000)\000\000\000\000\000\000\000\0001\000\000\000\000\000\200v@\362\001\034\022\013plane_angle\032\rangle::degree', file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='Kp', full_name='jaiabot.protobuf.rest.Command.PIDControl.Kp', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\242?\024 \002)\000\000\000\000\000\000\000\0001\000\000\000\000\000\000Y@', file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='Ki', full_name='jaiabot.protobuf.rest.Command.PIDControl.Ki', index=2,
      number=3, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\242?\024 \002)\000\000\000\000\000\000\000\0001\000\000\000\000\000\000Y@', file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='Kd', full_name='jaiabot.protobuf.rest.Command.PIDControl.Kd', index=3,
      number=4, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\242?\024 \002)\000\000\000\000\000\000\000\0001\000\000\000\000\000\000Y@', file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
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
  serialized_start=747,
  serialized_end=942,
)

_COMMAND = _descriptor.Descriptor(
  name='Command',
  full_name='jaiabot.protobuf.rest.Command',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='throttle', full_name='jaiabot.protobuf.rest.Command.throttle', index=0,
      number=3, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\242?\024 \000)\000\000\000\000\000\000Y\3001\000\000\000\000\000\000Y@', file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='speed', full_name='jaiabot.protobuf.rest.Command.speed', index=1,
      number=4, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='rudder', full_name='jaiabot.protobuf.rest.Command.rudder', index=2,
      number=1, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\242?\024 \000)\000\000\000\000\000\000Y\3001\000\000\000\000\000\000Y@', file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='heading', full_name='jaiabot.protobuf.rest.Command.heading', index=3,
      number=2, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[_COMMAND_PIDCONTROL, ],
  enum_types=[
  ],
  serialized_options=b'\242?\014\010\\\020\372\001(\003\362\001\002si',
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=533,
  serialized_end=959,
)

_BOTSTATUS_ATTITUDE.containing_type = _BOTSTATUS
_BOTSTATUS_SPEED.containing_type = _BOTSTATUS
_BOTSTATUS.fields_by_name['location'].message_type = _GEOGRAPHICCOORDINATE
_BOTSTATUS.fields_by_name['attitude'].message_type = _BOTSTATUS_ATTITUDE
_BOTSTATUS.fields_by_name['speed'].message_type = _BOTSTATUS_SPEED
_COMMAND_PIDCONTROL.containing_type = _COMMAND
_COMMAND.fields_by_name['speed'].message_type = _COMMAND_PIDCONTROL
_COMMAND.fields_by_name['heading'].message_type = _COMMAND_PIDCONTROL
DESCRIPTOR.message_types_by_name['GeographicCoordinate'] = _GEOGRAPHICCOORDINATE
DESCRIPTOR.message_types_by_name['BotStatus'] = _BOTSTATUS
DESCRIPTOR.message_types_by_name['Command'] = _COMMAND
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

GeographicCoordinate = _reflection.GeneratedProtocolMessageType('GeographicCoordinate', (_message.Message,), {
  'DESCRIPTOR' : _GEOGRAPHICCOORDINATE,
  '__module__' : 'pid_control_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.rest.GeographicCoordinate)
  })
_sym_db.RegisterMessage(GeographicCoordinate)

BotStatus = _reflection.GeneratedProtocolMessageType('BotStatus', (_message.Message,), {

  'Attitude' : _reflection.GeneratedProtocolMessageType('Attitude', (_message.Message,), {
    'DESCRIPTOR' : _BOTSTATUS_ATTITUDE,
    '__module__' : 'pid_control_pb2'
    # @@protoc_insertion_point(class_scope:jaiabot.protobuf.rest.BotStatus.Attitude)
    })
  ,

  'Speed' : _reflection.GeneratedProtocolMessageType('Speed', (_message.Message,), {
    'DESCRIPTOR' : _BOTSTATUS_SPEED,
    '__module__' : 'pid_control_pb2'
    # @@protoc_insertion_point(class_scope:jaiabot.protobuf.rest.BotStatus.Speed)
    })
  ,
  'DESCRIPTOR' : _BOTSTATUS,
  '__module__' : 'pid_control_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.rest.BotStatus)
  })
_sym_db.RegisterMessage(BotStatus)
_sym_db.RegisterMessage(BotStatus.Attitude)
_sym_db.RegisterMessage(BotStatus.Speed)

Command = _reflection.GeneratedProtocolMessageType('Command', (_message.Message,), {

  'PIDControl' : _reflection.GeneratedProtocolMessageType('PIDControl', (_message.Message,), {
    'DESCRIPTOR' : _COMMAND_PIDCONTROL,
    '__module__' : 'pid_control_pb2'
    # @@protoc_insertion_point(class_scope:jaiabot.protobuf.rest.Command.PIDControl)
    })
  ,
  'DESCRIPTOR' : _COMMAND,
  '__module__' : 'pid_control_pb2'
  # @@protoc_insertion_point(class_scope:jaiabot.protobuf.rest.Command)
  })
_sym_db.RegisterMessage(Command)
_sym_db.RegisterMessage(Command.PIDControl)


_GEOGRAPHICCOORDINATE._options = None
_BOTSTATUS._options = None
_COMMAND_PIDCONTROL.fields_by_name['target']._options = None
_COMMAND_PIDCONTROL.fields_by_name['Kp']._options = None
_COMMAND_PIDCONTROL.fields_by_name['Ki']._options = None
_COMMAND_PIDCONTROL.fields_by_name['Kd']._options = None
_COMMAND.fields_by_name['throttle']._options = None
_COMMAND.fields_by_name['rudder']._options = None
_COMMAND._options = None
# @@protoc_insertion_point(module_scope)
