# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: goby/middleware/protobuf/pty_config.proto

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
  name='goby/middleware/protobuf/pty_config.proto',
  package='goby.middleware.protobuf',
  syntax='proto2',
  serialized_options=None,
  serialized_pb=_b('\n)goby/middleware/protobuf/pty_config.proto\x12\x18goby.middleware.protobuf\x1a%goby/protobuf/option_extensions.proto\x1a\x1c\x64\x63\x63l/option_extensions.proto\"\xd9\x01\n\tPTYConfig\x12H\n\x04port\x18\x01 \x02(\tB:\x8a?7\xa2\x06$Name for created PTY device symlink.\xaa\x06\r/tmp/ttytest0\x12\x36\n\x04\x62\x61ud\x18\x02 \x01(\r:\x06\x31\x31\x35\x32\x30\x30\x42 \x8a?\x1d\xa2\x06\x1aSerial baud for PTY device\x12J\n\x0b\x65nd_of_line\x18\x03 \x01(\t:\x01\nB2\x8a?/\xa2\x06,End of line string. Can also be a std::regex')
  ,
  dependencies=[goby_dot_protobuf_dot_option__extensions__pb2.DESCRIPTOR,dccl_dot_option__extensions__pb2.DESCRIPTOR,])




_PTYCONFIG = _descriptor.Descriptor(
  name='PTYConfig',
  full_name='goby.middleware.protobuf.PTYConfig',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='port', full_name='goby.middleware.protobuf.PTYConfig.port', index=0,
      number=1, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?7\242\006$Name for created PTY device symlink.\252\006\r/tmp/ttytest0'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='baud', full_name='goby.middleware.protobuf.PTYConfig.baud', index=1,
      number=2, type=13, cpp_type=3, label=1,
      has_default_value=True, default_value=115200,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?\035\242\006\032Serial baud for PTY device'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='end_of_line', full_name='goby.middleware.protobuf.PTYConfig.end_of_line', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=True, default_value=_b("\n").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\212?/\242\006,End of line string. Can also be a std::regex'), file=DESCRIPTOR),
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
  serialized_start=141,
  serialized_end=358,
)

DESCRIPTOR.message_types_by_name['PTYConfig'] = _PTYCONFIG
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

PTYConfig = _reflection.GeneratedProtocolMessageType('PTYConfig', (_message.Message,), dict(
  DESCRIPTOR = _PTYCONFIG,
  __module__ = 'goby.middleware.protobuf.pty_config_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.PTYConfig)
  ))
_sym_db.RegisterMessage(PTYConfig)


_PTYCONFIG.fields_by_name['port']._options = None
_PTYCONFIG.fields_by_name['baud']._options = None
_PTYCONFIG.fields_by_name['end_of_line']._options = None
# @@protoc_insertion_point(module_scope)