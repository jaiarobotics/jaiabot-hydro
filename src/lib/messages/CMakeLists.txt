set(SENSOR_MESSAGES
  sensor/pressure_temperature.proto
  sensor/salinity.proto
  sensor/sensor_core.proto
  sensor/configuration.proto
  sensor/metadata.proto
  sensor/catalog.proto
  sensor/atlas_scientific__ezo_ec.proto
  sensor/blue_robotics__bar30.proto
)

protobuf_generate_cpp_full(PROTO_SRCS PROTO_HDRS "jaiabot/messages" ${project_INC_DIR}
  example.proto
  geographic_coordinate.proto
  control_surfaces.proto
  high_control.proto
  control_surfaces.proto
  feather.proto
  lora_test.proto
  imu.proto
  mission.proto
  jaia_dccl.proto
  engineering.proto
  low_control.proto
  portal.proto
  metadata.proto
  moos.proto
  arduino.proto
  bounds.proto
  health.proto
  hub.proto
  dive_debug.proto
  xbee_extensions.proto
  modem_message_extensions.proto
  simulator.proto
  echo.proto
  rest_api.proto
  option_extensions.proto
  ${SENSOR_MESSAGES}
 )

add_library(jaiabot_messages SHARED ${PROTO_SRCS} ${PROTO_HDRS})
target_link_libraries(jaiabot_messages ${PROTOBUF_LIBRARIES} goby)

project_install_lib(jaiabot_messages)

# we need to generate a nanopb version of these external messages
configure_file(${DCCL_INCLUDE_DIR}/dccl/option_extensions.proto ${project_INC_DIR}/nanopb/dccl/option_extensions.proto COPYONLY)
protobuf_generate_nanopb_c_full(EXT_PROTO_C_SRCS EXT_PROTO_C_HDRS "dccl" ${project_INC_DIR}
  option_extensions.proto
  )

protobuf_generate_nanopb_c_full(PROTO_C_SRCS PROTO_C_HDRS "jaiabot/messages" ${project_INC_DIR}
  arduino.proto
  feather.proto
  ${SENSOR_MESSAGES}
  )

add_library(jaiabot_messages_c SHARED ${EXT_PROTO_C_SRCS} ${EXT_PROTO_C_HDRS} ${PROTO_C_SRCS} ${PROTO_C_HDRS})
target_link_libraries(jaiabot_messages_c nanopb::protobuf-nanopb-static)

# make sure we don't accidentally include C++ headers for generated protobufs by clearing and re-adding only desired include directories in the correct order (so nanopb generated headers come before others)
set_target_properties(jaiabot_messages_c PROPERTIES INCLUDE_DIRECTORIES "")
target_include_directories(jaiabot_messages_c
    PRIVATE ${project_INC_DIR}/nanopb
    PRIVATE ${project_INC_DIR}
)

project_install_lib(jaiabot_messages_c)


function(check_dccl_md5_hash DCCL_NAME EXPECTED_HASH)
  add_custom_command(
        TARGET jaiabot_messages
        POST_BUILD
        COMMAND ${CMAKE_COMMAND}
        -D "DCCL_NAME=${DCCL_NAME}"
        -D "EXPECTED_HASH=${EXPECTED_HASH}"
        -D "MESSAGES_LIB_PATH=$<TARGET_FILE:jaiabot_messages>"
        -P "${CMAKE_SOURCE_DIR}/cmake/CheckDCCLHASH.cmake"
    )
endfunction()


if(NOT CMAKE_CROSSCOMPILING)
  # This list of all DCCL messages used on intervehicle comms with the latest hash ("dccl -a -H") is simply
  # to ensure that CMake checks that we don't accidentally change the DCCL message without updating PROJECT_INTERVEHICLE_API_VERSION if necessary.

  # When updating a DCCL message, just make sure to increment PROJECT_INTERVEHICLE_API_VERSION in jaiabot/CMakeLists.txt
  # and update the hash here (dccl -f src/lib/messages/jaia_dccl.proto -I build/amd64/include -I /usr/include -a -m jaiabot.protobuf.BotStatus -H)

  # When adding a new DCCL message (for intervehicle comms), make sure to add it to this list
  check_dccl_md5_hash("jaiabot.protobuf.BotStatus" "0x5009342af1c991a8")
  check_dccl_md5_hash("jaiabot.protobuf.TaskPacket" "0xd6cdaf32db2fd089")
  check_dccl_md5_hash("jaiabot.protobuf.Command" "0x0e41dc88405ff2f1")
  check_dccl_md5_hash("jaiabot.protobuf.Engineering" "0x6694c32d91a8b1c7")
endif()
