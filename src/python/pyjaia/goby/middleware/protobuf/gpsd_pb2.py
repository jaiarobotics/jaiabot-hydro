# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: goby/middleware/protobuf/gpsd.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from goby.middleware.protobuf import geographic_pb2 as goby_dot_middleware_dot_protobuf_dot_geographic__pb2
from dccl import option_extensions_pb2 as dccl_dot_option__extensions__pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='goby/middleware/protobuf/gpsd.proto',
  package='goby.middleware.protobuf.gpsd',
  syntax='proto2',
  serialized_options=None,
  serialized_pb=_b('\n#goby/middleware/protobuf/gpsd.proto\x12\x1dgoby.middleware.protobuf.gpsd\x1a)goby/middleware/protobuf/geographic.proto\x1a\x1c\x64\x63\x63l/option_extensions.proto\"\xe9\x01\n\tSatellite\x12\x0b\n\x03prn\x18\x01 \x02(\x05\x12.\n\x02\x61z\x18\x02 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12.\n\x02\x65l\x18\x03 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12\n\n\x02ss\x18\x04 \x01(\x01\x12\x0c\n\x04used\x18\x05 \x01(\x08\x12\x0e\n\x06gnssid\x18\x06 \x01(\x05\x12\x0c\n\x04svid\x18\x07 \x01(\x05\x12\r\n\x05sigid\x18\x08 \x01(\x05\x12\x0e\n\x06\x66reqid\x18\t \x01(\x05\x12\x0e\n\x06health\x18\n \x01(\x05:\x08\xa2?\x05\xf2\x01\x02si\"\xfa\x01\n\x07SkyView\x12\x0e\n\x06\x64\x65vice\x18\x01 \x01(\t\x12\x1a\n\x04time\x18\x02 \x01(\x01\x42\x0c\xa2?\t\xf2\x01\x06\x12\x04time\x12\x0c\n\x04gdop\x18\x03 \x01(\x01\x12\x0c\n\x04hdop\x18\x04 \x01(\x01\x12\x0c\n\x04pdop\x18\x05 \x01(\x01\x12\x0c\n\x04tdop\x18\x06 \x01(\x01\x12\x0c\n\x04vdop\x18\x07 \x01(\x01\x12\x0c\n\x04xdop\x18\x08 \x01(\x01\x12\x0c\n\x04ydop\x18\t \x01(\x01\x12\x0c\n\x04nsat\x18\n \x01(\x01\x12\x0c\n\x04usat\x18\x0b \x01(\x01\x12;\n\tsatellite\x18\x0c \x03(\x0b\x32(.goby.middleware.protobuf.gpsd.Satellite:\x08\xa2?\x05\xf2\x01\x02si\"\x8b\x02\n\x08\x41ttitude\x12\x0e\n\x06\x64\x65vice\x18\x01 \x01(\t\x12\x1a\n\x04time\x18\x02 \x01(\x01\x42\x0c\xa2?\t\xf2\x01\x06\x12\x04time\x12\x33\n\x07heading\x18\x03 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12\x31\n\x05pitch\x18\x04 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12/\n\x03yaw\x18\x05 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12\x30\n\x04roll\x18\x06 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree:\x08\xa2?\x05\xf2\x01\x02si\"\x91\x05\n\x14TimePositionVelocity\x12\x0e\n\x06\x64\x65vice\x18\x01 \x01(\t\x12\x1a\n\x04time\x18\x02 \x01(\x01\x42\x0c\xa2?\t\xf2\x01\x06\x12\x04time\x12\x46\n\x04mode\x18\x03 \x01(\x0e\x32\x38.goby.middleware.protobuf.gpsd.TimePositionVelocity.Mode\x12\x37\n\x08location\x18\x04 \x01(\x0b\x32%.goby.middleware.protobuf.LatLonPoint\x12 \n\x08\x61ltitude\x18\x05 \x01(\x01\x42\x0e\xa2?\x0b\xf2\x01\x08\x12\x06length\x12\x31\n\x05track\x18\x06 \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12\"\n\x05speed\x18\x07 \x01(\x01\x42\x13\xa2?\x10\xf2\x01\r\x12\x0blength/time\x12\"\n\x05\x63limb\x18\x08 \x01(\x01\x42\x13\xa2?\x10\xf2\x01\r\x12\x0blength/time\x12 \n\x03\x65pc\x18\n \x01(\x01\x42\x13\xa2?\x10\xf2\x01\r\x12\x0blength/time\x12/\n\x03\x65pd\x18\x0b \x01(\x01\x42\"\xa2?\x1f\xf2\x01\x1c\x12\x0bplane_angle\x1a\rangle::degree\x12 \n\x03\x65ps\x18\x0c \x01(\x01\x42\x13\xa2?\x10\xf2\x01\r\x12\x0blength/time\x12\x19\n\x03\x65pt\x18\r \x01(\x01\x42\x0c\xa2?\t\xf2\x01\x06\x12\x04time\x12\x1b\n\x03\x65pv\x18\x0e \x01(\x01\x42\x0e\xa2?\x0b\xf2\x01\x08\x12\x06length\x12\x1b\n\x03\x65px\x18\x0f \x01(\x01\x42\x0e\xa2?\x0b\xf2\x01\x08\x12\x06length\x12\x1b\n\x03\x65py\x18\x10 \x01(\x01\x42\x0e\xa2?\x0b\xf2\x01\x08\x12\x06length\">\n\x04Mode\x12\x0f\n\x0bModeNotSeen\x10\x00\x12\r\n\tModeNoFix\x10\x01\x12\n\n\x06Mode2D\x10\x02\x12\n\n\x06Mode3D\x10\x03:\x08\xa2?\x05\xf2\x01\x02si')
  ,
  dependencies=[goby_dot_middleware_dot_protobuf_dot_geographic__pb2.DESCRIPTOR,dccl_dot_option__extensions__pb2.DESCRIPTOR,])



_TIMEPOSITIONVELOCITY_MODE = _descriptor.EnumDescriptor(
  name='Mode',
  full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.Mode',
  filename=None,
  file=DESCRIPTOR,
  values=[
    _descriptor.EnumValueDescriptor(
      name='ModeNotSeen', index=0, number=0,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='ModeNoFix', index=1, number=1,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='Mode2D', index=2, number=2,
      serialized_options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='Mode3D', index=3, number=3,
      serialized_options=None,
      type=None),
  ],
  containing_type=None,
  serialized_options=None,
  serialized_start=1488,
  serialized_end=1550,
)
_sym_db.RegisterEnumDescriptor(_TIMEPOSITIONVELOCITY_MODE)


_SATELLITE = _descriptor.Descriptor(
  name='Satellite',
  full_name='goby.middleware.protobuf.gpsd.Satellite',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='prn', full_name='goby.middleware.protobuf.gpsd.Satellite.prn', index=0,
      number=1, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='az', full_name='goby.middleware.protobuf.gpsd.Satellite.az', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='el', full_name='goby.middleware.protobuf.gpsd.Satellite.el', index=2,
      number=3, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='ss', full_name='goby.middleware.protobuf.gpsd.Satellite.ss', index=3,
      number=4, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='used', full_name='goby.middleware.protobuf.gpsd.Satellite.used', index=4,
      number=5, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='gnssid', full_name='goby.middleware.protobuf.gpsd.Satellite.gnssid', index=5,
      number=6, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='svid', full_name='goby.middleware.protobuf.gpsd.Satellite.svid', index=6,
      number=7, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='sigid', full_name='goby.middleware.protobuf.gpsd.Satellite.sigid', index=7,
      number=8, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='freqid', full_name='goby.middleware.protobuf.gpsd.Satellite.freqid', index=8,
      number=9, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='health', full_name='goby.middleware.protobuf.gpsd.Satellite.health', index=9,
      number=10, type=5, cpp_type=1, label=1,
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
  serialized_options=_b('\242?\005\362\001\002si'),
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=144,
  serialized_end=377,
)


_SKYVIEW = _descriptor.Descriptor(
  name='SkyView',
  full_name='goby.middleware.protobuf.gpsd.SkyView',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='device', full_name='goby.middleware.protobuf.gpsd.SkyView.device', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='time', full_name='goby.middleware.protobuf.gpsd.SkyView.time', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\t\362\001\006\022\004time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='gdop', full_name='goby.middleware.protobuf.gpsd.SkyView.gdop', index=2,
      number=3, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='hdop', full_name='goby.middleware.protobuf.gpsd.SkyView.hdop', index=3,
      number=4, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='pdop', full_name='goby.middleware.protobuf.gpsd.SkyView.pdop', index=4,
      number=5, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='tdop', full_name='goby.middleware.protobuf.gpsd.SkyView.tdop', index=5,
      number=6, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='vdop', full_name='goby.middleware.protobuf.gpsd.SkyView.vdop', index=6,
      number=7, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='xdop', full_name='goby.middleware.protobuf.gpsd.SkyView.xdop', index=7,
      number=8, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='ydop', full_name='goby.middleware.protobuf.gpsd.SkyView.ydop', index=8,
      number=9, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='nsat', full_name='goby.middleware.protobuf.gpsd.SkyView.nsat', index=9,
      number=10, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='usat', full_name='goby.middleware.protobuf.gpsd.SkyView.usat', index=10,
      number=11, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='satellite', full_name='goby.middleware.protobuf.gpsd.SkyView.satellite', index=11,
      number=12, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=_b('\242?\005\362\001\002si'),
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=380,
  serialized_end=630,
)


_ATTITUDE = _descriptor.Descriptor(
  name='Attitude',
  full_name='goby.middleware.protobuf.gpsd.Attitude',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='device', full_name='goby.middleware.protobuf.gpsd.Attitude.device', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='time', full_name='goby.middleware.protobuf.gpsd.Attitude.time', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\t\362\001\006\022\004time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='heading', full_name='goby.middleware.protobuf.gpsd.Attitude.heading', index=2,
      number=3, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='pitch', full_name='goby.middleware.protobuf.gpsd.Attitude.pitch', index=3,
      number=4, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='yaw', full_name='goby.middleware.protobuf.gpsd.Attitude.yaw', index=4,
      number=5, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='roll', full_name='goby.middleware.protobuf.gpsd.Attitude.roll', index=5,
      number=6, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=_b('\242?\005\362\001\002si'),
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=633,
  serialized_end=900,
)


_TIMEPOSITIONVELOCITY = _descriptor.Descriptor(
  name='TimePositionVelocity',
  full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='device', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.device', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='time', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.time', index=1,
      number=2, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\t\362\001\006\022\004time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='mode', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.mode', index=2,
      number=3, type=14, cpp_type=8, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='location', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.location', index=3,
      number=4, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='altitude', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.altitude', index=4,
      number=5, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\013\362\001\010\022\006length'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='track', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.track', index=5,
      number=6, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='speed', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.speed', index=6,
      number=7, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\020\362\001\r\022\013length/time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='climb', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.climb', index=7,
      number=8, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\020\362\001\r\022\013length/time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='epc', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.epc', index=8,
      number=10, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\020\362\001\r\022\013length/time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='epd', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.epd', index=9,
      number=11, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\037\362\001\034\022\013plane_angle\032\rangle::degree'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='eps', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.eps', index=10,
      number=12, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\020\362\001\r\022\013length/time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='ept', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.ept', index=11,
      number=13, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\t\362\001\006\022\004time'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='epv', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.epv', index=12,
      number=14, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\013\362\001\010\022\006length'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='epx', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.epx', index=13,
      number=15, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\013\362\001\010\022\006length'), file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='epy', full_name='goby.middleware.protobuf.gpsd.TimePositionVelocity.epy', index=14,
      number=16, type=1, cpp_type=5, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=_b('\242?\013\362\001\010\022\006length'), file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
    _TIMEPOSITIONVELOCITY_MODE,
  ],
  serialized_options=_b('\242?\005\362\001\002si'),
  is_extendable=False,
  syntax='proto2',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=903,
  serialized_end=1560,
)

_SKYVIEW.fields_by_name['satellite'].message_type = _SATELLITE
_TIMEPOSITIONVELOCITY.fields_by_name['mode'].enum_type = _TIMEPOSITIONVELOCITY_MODE
_TIMEPOSITIONVELOCITY.fields_by_name['location'].message_type = goby_dot_middleware_dot_protobuf_dot_geographic__pb2._LATLONPOINT
_TIMEPOSITIONVELOCITY_MODE.containing_type = _TIMEPOSITIONVELOCITY
DESCRIPTOR.message_types_by_name['Satellite'] = _SATELLITE
DESCRIPTOR.message_types_by_name['SkyView'] = _SKYVIEW
DESCRIPTOR.message_types_by_name['Attitude'] = _ATTITUDE
DESCRIPTOR.message_types_by_name['TimePositionVelocity'] = _TIMEPOSITIONVELOCITY
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

Satellite = _reflection.GeneratedProtocolMessageType('Satellite', (_message.Message,), dict(
  DESCRIPTOR = _SATELLITE,
  __module__ = 'goby.middleware.protobuf.gpsd_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.gpsd.Satellite)
  ))
_sym_db.RegisterMessage(Satellite)

SkyView = _reflection.GeneratedProtocolMessageType('SkyView', (_message.Message,), dict(
  DESCRIPTOR = _SKYVIEW,
  __module__ = 'goby.middleware.protobuf.gpsd_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.gpsd.SkyView)
  ))
_sym_db.RegisterMessage(SkyView)

Attitude = _reflection.GeneratedProtocolMessageType('Attitude', (_message.Message,), dict(
  DESCRIPTOR = _ATTITUDE,
  __module__ = 'goby.middleware.protobuf.gpsd_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.gpsd.Attitude)
  ))
_sym_db.RegisterMessage(Attitude)

TimePositionVelocity = _reflection.GeneratedProtocolMessageType('TimePositionVelocity', (_message.Message,), dict(
  DESCRIPTOR = _TIMEPOSITIONVELOCITY,
  __module__ = 'goby.middleware.protobuf.gpsd_pb2'
  # @@protoc_insertion_point(class_scope:goby.middleware.protobuf.gpsd.TimePositionVelocity)
  ))
_sym_db.RegisterMessage(TimePositionVelocity)


_SATELLITE.fields_by_name['az']._options = None
_SATELLITE.fields_by_name['el']._options = None
_SATELLITE._options = None
_SKYVIEW.fields_by_name['time']._options = None
_SKYVIEW._options = None
_ATTITUDE.fields_by_name['time']._options = None
_ATTITUDE.fields_by_name['heading']._options = None
_ATTITUDE.fields_by_name['pitch']._options = None
_ATTITUDE.fields_by_name['yaw']._options = None
_ATTITUDE.fields_by_name['roll']._options = None
_ATTITUDE._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['time']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['altitude']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['track']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['speed']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['climb']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['epc']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['epd']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['eps']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['ept']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['epv']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['epx']._options = None
_TIMEPOSITIONVELOCITY.fields_by_name['epy']._options = None
_TIMEPOSITIONVELOCITY._options = None
# @@protoc_insertion_point(module_scope)