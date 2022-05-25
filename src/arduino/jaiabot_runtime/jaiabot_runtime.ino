#include <SPI.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <Servo.h>
#include <stdio.h>

#ifdef UENUM
#undef UENUM
#endif
#include "jaiabot/messages/nanopb/arduino.pb.h"

// Binary serial protocol
// [JAIA][2-byte size - big endian][bytes][JAIA]...
// TODO: Add CRC32?
constexpr const char* SERIAL_MAGIC = "JAIA";
constexpr int SERIAL_MAGIC_BYTES = 4;
constexpr int SIZE_BYTES = 2;
using serial_size_type = uint16_t;

constexpr int BITS_IN_BYTE = 8;

Servo rudder_servo, port_elevator_servo, stbd_elevator_servo, motor_servo;

constexpr int STBD_ELEVATOR_PIN = 2;
constexpr int RUDDER_PIN = 3;
constexpr int PORT_ELEVATOR_PIN = 4;
constexpr int MOTOR_PIN = 6;

// The timeout
unsigned long t_last_command = 0;
int32_t command_timeout = -1; 
void handle_timeout();
void halt_all();

static_assert(jaiabot_protobuf_ArduinoCommand_size < (1ul << (SIZE_BYTES*BITS_IN_BYTE)), "ArduinoCommand is too large, must fit in SIZE_BYTES word");

bool data_to_send = false;
bool data_to_receive = false;

jaiabot_protobuf_ArduinoCommand command = jaiabot_protobuf_ArduinoCommand_init_default;

enum AckCode {
  STARTUP = 0,
  ACK = 1,
  TIMEOUT = 2,
  DEBUG=3
};

char ack_message[256] = {0};

bool write_string(pb_ostream_t *stream, const pb_field_t *field, void * const *arg)
{
    if (!pb_encode_tag_for_field(stream, field))
        return false;

    return pb_encode_string(stream, (uint8_t*)ack_message, strlen(ack_message));
}

void send_ack(AckCode code, char message[])
{
  const size_t max_ack_size = 256;

  bool status = true;
  uint8_t pb_binary_data[max_ack_size] = {0};
  serial_size_type message_length = 0;

  pb_ostream_t stream = pb_ostream_from_buffer(pb_binary_data, sizeof(pb_binary_data));

  // Copy code and message
  jaiabot_protobuf_ArduinoResponse ack = jaiabot_protobuf_ArduinoResponse_init_default;
  ack.code = code;

  pb_callback_t callback;
  callback.funcs.encode = write_string;
  callback.arg = NULL;
  ack.message = callback;

  if (message != NULL) {
    strncpy(ack_message, message, 250);
  }
  else {
    strncpy(ack_message, "", 250);
  }

  status = pb_encode(&stream, jaiabot_protobuf_ArduinoResponse_fields, &ack);
  message_length = stream.bytes_written;

  if (status)
  {
    Serial.write(SERIAL_MAGIC, SERIAL_MAGIC_BYTES);
    Serial.write((message_length >> BITS_IN_BYTE) & 0xFF);
    Serial.write(message_length & 0xFF);
    Serial.write(pb_binary_data, message_length);
  }
  delay(10);
}

void setup()
{

  Serial.begin(115200);
  while (!Serial) {
    delay(1);
  }

  delay(100);

  motor_servo.attach(MOTOR_PIN);
  rudder_servo.attach(RUDDER_PIN);
  stbd_elevator_servo.attach(STBD_ELEVATOR_PIN);
  port_elevator_servo.attach(PORT_ELEVATOR_PIN);

  // Send startup code
  send_ack(STARTUP, NULL);
}


int32_t clamp(int32_t v, int32_t min, int32_t max) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}


void loop()
{

  constexpr int prefix_size = SERIAL_MAGIC_BYTES + SIZE_BYTES;

  handle_timeout();

  while (Serial.available() >= prefix_size) {
    handle_timeout();
    
    // read bytes until the next magic word start (hopefully)
    while (Serial.available() > 0  && Serial.peek() != SERIAL_MAGIC[0]) {
      handle_timeout();
      Serial.read();
    }

    uint8_t prefix[prefix_size] = {0};
    if (Serial.readBytes(prefix, prefix_size) == prefix_size)
    {
      // If the magic is correct
      if (memcmp(SERIAL_MAGIC, prefix, SERIAL_MAGIC_BYTES) == 0)
      {
        // Read the message size
        serial_size_type size = 0;
        size |= prefix[SERIAL_MAGIC_BYTES];
        size << BITS_IN_BYTE;
        size |= prefix[SERIAL_MAGIC_BYTES + 1];

        if (size <= jaiabot_protobuf_ArduinoCommand_size)
        {
          uint8_t pb_binary_data[jaiabot_protobuf_ArduinoCommand_size] = {0};

          // Read the protobuf binary-encoded message
          if (Serial.readBytes(pb_binary_data, size) == size)
          {
            pb_istream_t stream = pb_istream_from_buffer(pb_binary_data, size);

            // Decode the protobuf command message
            bool status = pb_decode(&stream, jaiabot_protobuf_ArduinoCommand_fields, &command);
            if (!status)
            {
              send_ack(DEBUG, "Decoding ArduinoCommand protobuf failed:");
              send_ack(DEBUG, PB_GET_ERROR(&stream));
            }

            motor_servo.writeMicroseconds (command.motor);
            rudder_servo.writeMicroseconds(command.rudder);
            stbd_elevator_servo.writeMicroseconds(command.stbd_elevator);
            port_elevator_servo.writeMicroseconds(command.port_elevator);

            // Set the timeout vars
            t_last_command = millis();
            command_timeout = command.timeout * 1000;

            // char message[256];
            // sprintf(message, "%ld,%ld,%ld,%ld", command.motor, command.rudder, command.stbd_elevator, command.port_elevator);
            send_ack(ACK, NULL);
          }
          else
          {
            send_ack(DEBUG, "Read wrong number of bytes for PB data");
          }
        }
        else
        {
          send_ack(DEBUG, "Message size is wrong (too big)");
        }

      }
      else
      {
        send_ack(DEBUG, "Serial magic is wrong");
      }
    }
    else
    {
      send_ack(DEBUG, "Read wrong number of bytes for prefix");
    }
  }

}

void handle_timeout() {
  if (command_timeout < 0) return;
  
  unsigned long now = millis();
  if (now - t_last_command > command_timeout) {
    command_timeout = -1;
    halt_all();

    send_ack(TIMEOUT, NULL);
  }
}

void halt_all() {
  const int motor_off = 1500;
  const int rudder_off = 1500;
  const int stbd_elevator_off = 1500;
  const int port_elevator_off = 1500;
}

// from feather.pb.c - would be better to just add the file to the sketch
// but unclear how to do some from Arduino
PB_BIND(jaiabot_protobuf_ArduinoCommand, jaiabot_protobuf_ArduinoCommand, 2)
PB_BIND(jaiabot_protobuf_ArduinoResponse, jaiabot_protobuf_ArduinoResponse, 2)
