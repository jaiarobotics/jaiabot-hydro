# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: camera_driver.proto
# Protobuf Python Version: 4.25.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x13\x63\x61mera_driver.proto\x12\x10jaiabot.protobuf\"\xe7\x01\n\rCameraCommand\x12\n\n\x02id\x18\x01 \x02(\x05\x12?\n\x04type\x18\x02 \x02(\x0e\x32\x31.jaiabot.protobuf.CameraCommand.CameraCommandType\x12\x1e\n\x16image_capture_interval\x18\x03 \x01(\x01\"i\n\x11\x43\x61meraCommandType\x12\x10\n\x0cSTART_IMAGES\x10\x00\x12\x0f\n\x0bSTOP_IMAGES\x10\x01\x12\x0f\n\x0bSTART_VIDEO\x10\x02\x12\x0e\n\nSTOP_VIDEO\x10\x03\x12\x10\n\x0cGET_METADATA\x10\x04\"}\n\x0e\x43\x61meraResponse\x12\n\n\x02id\x18\x01 \x02(\x05\x12;\n\x08metadata\x18\x02 \x01(\x0b\x32).jaiabot.protobuf.CameraResponse.Metadata\x1a\"\n\x08Metadata\x12\x16\n\x0e\x64river_version\x18\x01 \x01(\x05')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'camera_driver_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
  DESCRIPTOR._options = None
  _globals['_CAMERACOMMAND']._serialized_start=42
  _globals['_CAMERACOMMAND']._serialized_end=273
  _globals['_CAMERACOMMAND_CAMERACOMMANDTYPE']._serialized_start=168
  _globals['_CAMERACOMMAND_CAMERACOMMANDTYPE']._serialized_end=273
  _globals['_CAMERARESPONSE']._serialized_start=275
  _globals['_CAMERARESPONSE']._serialized_end=400
  _globals['_CAMERARESPONSE_METADATA']._serialized_start=366
  _globals['_CAMERARESPONSE_METADATA']._serialized_end=400
# @@protoc_insertion_point(module_scope)
