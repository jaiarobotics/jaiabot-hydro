# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: goby/middleware/protobuf/serial_config.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from goby.protobuf import option_extensions_pb2 as goby_dot_protobuf_dot_option__extensions__pb2
from dccl import option_extensions_pb2 as dccl_dot_option__extensions__pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='goby/middleware/protobuf/serial_config.proto',
  package='goby.middleware.protobuf',
  syntax='proto2',
  serialized_options=None,
  serialized_pb=_b('\n,goby/middleware/protobuf/serial_config.proto\x12\x18goby.middleware.protobuf\x1a%goby/protobuf/option_extensions.proto\x1a\x1c\x64\x63\x63l/option_extensions.proto\"\x93\x03\n\x0cSerialConfig\x12\x33\n\x04port\x18\x01 \x02(\tB%\x8a?\"\xa2\x06\x10Serial port path\xaa\x06\x0c/dev/ttyUSB0\x12\'\n\x04\x62\x61ud\x18\x02 \x02(\rB\x19\x8a?\x16\xa2\x06\x0bSerial baud\xaa\x06\x05\x35\x37\x36\x30\x30\x12J\n\x0b\x65nd_of_line\x18\x03 \x01(\t:\x01\nB2\x8a?/\xa2\x06,End of line string. Can also be a std::regex\x12\x99\x01\n\x0c\x66low_control\x18\x04 \x01(\x0e\x32\x32.goby.middleware.protobuf.SerialConfig.FlowControl:\x04NONEBI\x8a?F\xa2\x06\x43\x46low control: NONE, SOFTWARE (aka XON/XOFF), HARDWARE (aka RTS/CTS)\"3\n\x0b\x46lowControl\x12\x08\n\x04NONE\x10\x00\x12\x0c\n\x08SOFTWARE\x10\x01\x12\x0c\n\x08HARDWARE\x10\x02:\x08\xa2?\x05\xf2\x01\x02si')
  ,
  dependencies=[goby_dot_protobuf_dot_option__extensions__pb2.DESCRIPTOR,dccl_dot_option__extensions__pb2.DESCRIPTOR,])



_SERIALCONFIG_FLOWCONTROL = _descriptor.EnumDescriptor(
  name='FlowControl',
  full_name='goby.middleware.protobuf.SerialConfig.FlowControl',
  filename=None,
  file=DESCRIPTOR,
  values=[
    _descriptor.EnumValueDescriptor(
      name='NONE', index=0, number=0,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='SOFTWARE', index=1, number=1,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='HARDWARE', index=2, number=2,
      serialized_options=None,
      type=None),
  ],
  containing_type=None,
  serialized_options=None,
  serialized_start=486,
  serialized_end=537,
)
_sym_db.RegisterEnumDescriptor(_SERIALCONFIG_FLOWCONTROL)


_SERIALCONFIG = _descriptor.Descriptor(
  name='SerialConfig',
  full_name='goby.middleware.protobuf.SerialConfig',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='port', full_name='goby.middleware.protobuf.SerialConfig.port', index=0,
      number=1, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?\"\242\006\020Serial port path\252\006\014/dev/ttyUSB0'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='baud', full_name='goby.middleware.protobuf.SerialConfig.baud', index=1,
      number=2, type=13, cpp_type=3, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?\026\242\006\013Serial baud\252\006\00557600'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='end_of_line', full_name='goby.middleware.protobuf.SerialConfig.end_of_line', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=True, default_value=_b("\n").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?/\242\006,End of line string. Can also be a std::regex'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='flow_control', full_name='goby.middleware.protobuf.SerialConfig.flow_control', index=3,
      number=4, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?F\242\006CFlow control: NONE, SOFTWARE (aka XON/XOFF), HARDWARE (aka RTS/CTS)'), file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
    _SERIALCONFIG_FLOWCONTROL,
  ],
  serialized_options=_b('\242?\005\362\001\002si'),
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=144,
  serialized_end=547,
)

_SERIALCONFIG.fields_by_name['flow_control'].enum_type = _SERIALCONFIG_FLOWCONTROL
_SERIALCONFIG_FLOWCONTROL.containing_type = _SERIALCONFIG
DESCRIPTOR.message_types_by_name['SerialConfig'] = _SERIALCONFIG
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

SerialConfig = _reflection.GeneratedProtocolMessageType('SerialConfig', (_message.Message,), dict(
  DESCRIPTOR = _SERIALCONFIG,
  __module__ = 'goby.middleware.protobuf.serial_config_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.SerialConfig)
  ))
_sym_db.RegisterMessage(SerialConfig)


_SERIALCONFIG.fields_by_name['port']._options = None
_SERIALCONFIG.fields_by_name['baud']._options = None
_SERIALCONFIG.fields_by_name['end_of_line']._options = None
_SERIALCONFIG.fields_by_name['flow_control']._options = None
_SERIALCONFIG._options = None
# @@protoc_insertion_point(module_scope)