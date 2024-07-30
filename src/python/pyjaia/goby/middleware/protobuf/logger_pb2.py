# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: goby/middleware/protobuf/logger.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from dccl import option_extensions_pb2 as dccl_dot_option__extensions__pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='goby/middleware/protobuf/logger.proto',
  package='goby.middleware.protobuf',
  syntax='proto2',
  serialized_options=None,
  serialized_pb=_b('\n%goby/middleware/protobuf/logger.proto\x12\x18goby.middleware.protobuf\x1a\x1c\x64\x63\x63l/option_extensions.proto\"\xaf\x01\n\rLoggerRequest\x12\x46\n\x0frequested_state\x18\x01 \x02(\x0e\x32-.goby.middleware.protobuf.LoggerRequest.State\x12\x18\n\tclose_log\x18\x02 \x01(\x08:\x05\x66\x61lse\"<\n\x05State\x12\x11\n\rSTART_LOGGING\x10\x01\x12\x10\n\x0cSTOP_LOGGING\x10\x02\x12\x0e\n\nROTATE_LOG\x10\x03')
  ,
  dependencies=[dccl_dot_option__extensions__pb2.DESCRIPTOR,])



_LOGGERREQUEST_STATE = _descriptor.EnumDescriptor(
  name='State',
  full_name='goby.middleware.protobuf.LoggerRequest.State',
  filename=None,
  file=DESCRIPTOR,
  values=[
    _descriptor.EnumValueDescriptor(
      name='START_LOGGING', index=0, number=1,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='STOP_LOGGING', index=1, number=2,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='ROTATE_LOG', index=2, number=3,
      serialized_options=None,
      type=None),
  ],
  containing_type=None,
  serialized_options=None,
  serialized_start=213,
  serialized_end=273,
)
_sym_db.RegisterEnumDescriptor(_LOGGERREQUEST_STATE)


_LOGGERREQUEST = _descriptor.Descriptor(
  name='LoggerRequest',
  full_name='goby.middleware.protobuf.LoggerRequest',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='requested_state', full_name='goby.middleware.protobuf.LoggerRequest.requested_state', index=0,
      number=1, type=14, cpp_type=8, label=2,
      has_default_value=False, default_value=1,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='close_log', full_name='goby.middleware.protobuf.LoggerRequest.close_log', index=1,
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
    _LOGGERREQUEST_STATE,
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=98,
  serialized_end=273,
)

_LOGGERREQUEST.fields_by_name['requested_state'].enum_type = _LOGGERREQUEST_STATE
_LOGGERREQUEST_STATE.containing_type = _LOGGERREQUEST
DESCRIPTOR.message_types_by_name['LoggerRequest'] = _LOGGERREQUEST
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

LoggerRequest = _reflection.GeneratedProtocolMessageType('LoggerRequest', (_message.Message,), dict(
  DESCRIPTOR = _LOGGERREQUEST,
  __module__ = 'goby.middleware.protobuf.logger_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.LoggerRequest)
  ))
_sym_db.RegisterMessage(LoggerRequest)


# @@protoc_insertion_point(module_scope)