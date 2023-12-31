/*

Date:Sept 25,2023
Description:
** Server
The server responds with JSON data containing the following fields:
- "permissionToUnlock": A boolean indicating whether access is granted (true) or denied (false).
- "isValid": A boolean indicating whether the RFID card data is valid (true) or not (false).
- "nodeLocation": The location identifier where the RFID card was scanned.
- "UID": The unique identifier of the RFID card.
- "userName": The name associated with the RFID card (if valis).
- "timestamp": The timestamp of the server's response.
- "code": A numeric code indicating the status of the access request. Possible values:
  - 1: Entry approved
  - 2: Entry denied due to lack of permissions
  - 3: Entry denied due to an unknown card
*/
#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Wire.h>
#include <ESP32Servo.h>

#define SS_PIN 4  // MFRC522 SDA pin
#define RST_PIN 2 // MFRC522 RST pin
#define INSIDEBUTTON 32
// constexpr int LEFT_SERVO_PIN = 25;
// constexpr int RIGHT_SERVO_PIN = 26;

// Servo leftServo;
// Servo rightServo;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

MFRC522 mfrc522(SS_PIN, RST_PIN); // MFRC522 instance
const unsigned char epd_bitmap_wifi[] PROGMEM = {
    0x00, 0x00, 0x07, 0xe0, 0x08, 0x10, 0x09, 0x90, 0x12, 0x48, 0x12, 0x48, 0x24, 0x24, 0x25, 0xa4,
    0x00, 0x00, 0x41, 0x5d, 0x41, 0x51, 0x2a, 0x59, 0x3e, 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
const unsigned char denied[] PROGMEM = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x00, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xc7, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xc7, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xc7, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xef, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xef, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0xff, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x07, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x80,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0x04, 0x3f, 0xcc, 0x09, 0xff, 0x3f, 0x88, 0x02, 0x0f, 0xc3, 0xf9, 0x80, 0x93, 0xf9, 0xf0, 0x80,
    0x04, 0x20, 0x0a, 0x08, 0x10, 0x20, 0x44, 0x04, 0x08, 0x22, 0x01, 0x40, 0x92, 0x01, 0x08, 0x80,
    0x04, 0x20, 0x0a, 0x08, 0x10, 0x20, 0x42, 0x08, 0x08, 0x12, 0x01, 0x20, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x09, 0x08, 0x10, 0x20, 0x41, 0x10, 0x08, 0x12, 0x01, 0x20, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x09, 0x08, 0x10, 0x20, 0x40, 0xa0, 0x08, 0x12, 0x01, 0x10, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x08, 0x88, 0x10, 0x20, 0x40, 0x40, 0x08, 0x12, 0x01, 0x10, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x3e, 0x08, 0x88, 0x10, 0x3f, 0x80, 0x40, 0x08, 0x13, 0xc1, 0x08, 0x93, 0xc1, 0x04, 0x80,
    0x04, 0x20, 0x08, 0x88, 0x10, 0x30, 0x00, 0x40, 0x08, 0x12, 0x01, 0x08, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x08, 0x48, 0x10, 0x28, 0x00, 0x40, 0x08, 0x12, 0x01, 0x04, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x08, 0x48, 0x10, 0x24, 0x00, 0x40, 0x08, 0x12, 0x01, 0x04, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x08, 0x28, 0x10, 0x22, 0x00, 0x40, 0x08, 0x12, 0x01, 0x02, 0x92, 0x01, 0x04, 0x80,
    0x04, 0x20, 0x08, 0x28, 0x10, 0x21, 0x00, 0x40, 0x08, 0x22, 0x01, 0x02, 0x92, 0x01, 0x08, 0x80,
    0x04, 0x3f, 0xc8, 0x18, 0x10, 0x20, 0xc0, 0x40, 0x0f, 0xc3, 0xf9, 0x01, 0x93, 0xf9, 0xf0, 0x80,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
    0x07, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x80,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

const unsigned char lock[] PROGMEM = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1c, 0x00, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xe3, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xe3, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xe3, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xf7, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xf7, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x03, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0x3f, 0x07, 0xe6, 0x19, 0xfe, 0x7e, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xff, 0xcf, 0xe6, 0x11, 0xfe, 0x7f, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x06, 0x31, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x06, 0x61, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x06, 0xc1, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x07, 0x81, 0xf8, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x07, 0x01, 0xf8, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x07, 0x81, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x06, 0xc1, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x06, 0x61, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x06, 0x00, 0xc0, 0xcc, 0x06, 0x31, 0x80, 0x61, 0x80, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x07, 0xfc, 0xff, 0xcf, 0xe6, 0x11, 0xfe, 0x7f, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x07, 0xfc, 0x3f, 0x07, 0xe6, 0x19, 0xfe, 0x7e, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x03, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
#define DEBUG_MODE 1

/**
 * Opens the door.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void OpenDoor()
{
  // leftServo.write(90);
  // rightServo.write(90);
}
/**
 * Closes the door.
 *
 * @throws None
 */
void CloseDoor()
{
  // leftServo.write(0);
  // rightServo.write(0);
}

void setup()
{
  //  leftServo.attach(LEFT_SERVO_PIN);
  //   rightServo.attach(RIGHT_SERVO_PIN);
  CloseDoor();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  // display.begin(SH1106_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  Serial.begin(115200); // Initialize serial communications with the PC
  SPI.begin();          // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522 card

  WiFi.begin("ConForNode1", "12345678"); // WiFi connection
  int i = 0;
  while (WiFi.status() != WL_CONNECTED)
  {

#if DEBUG_MODE
    Serial.println("Connecting to WiFi..");
#endif
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(5, 32);
    display.print("Connecting to WiFi..");
    display.drawBitmap(58, 14, epd_bitmap_wifi, 16, 16, WHITE);
    display.display();
    delay(1000);

    i++;
    if (i > 12)
    {
      break;
    }
  }

  Serial.println("Connected to the WiFi network");
  display.clearDisplay();
  display.drawBitmap(0, 0, lock, 128, 64, WHITE);
  display.display();
}

/**
 * The loop function is called repeatedly in an Arduino sketch.
 *
 * @return void
 *
 * @throws None
 */
void loop()
{
  CloseDoor();
  if (touchRead(INSIDEBUTTON) < 30)
  {
    OpenDoor();
    Serial.print("unlock trigg");
    display.clearDisplay();
    display.setCursor(0, 16);
    display.print("Unlock Triggered from Inside");
    display.display();
    delay(5000);
    display.clearDisplay();
    display.drawBitmap(0, 0, lock, 128, 64, WHITE);
    display.display();
  }
  if (!mfrc522.PICC_IsNewCardPresent()) // Look for new cards
  {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial())
  {
    return;
  }

  String content = ""; // String for storing the UID
  byte letter;         // variable for storing the MFRC522 data

  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ")); // Concatenates the UID (a byte) with a space between
    content.concat(String(mfrc522.uid.uidByte[i], HEX));                // Converts the UID (a byte) to HEX
    // yes ,we are sending the UID in HEX format you can change it, no prob but remember to use decimal one in add user too
  }

  content.toUpperCase(); // Changes the letters in the UID to uppercase ,no need of now as sever is updated tp do it automaticlly

  Serial.println(); // Print UID
  Serial.print("Message: ");
  Serial.println(content); // Print UID
  Serial.println();
  Serial.println("Sending data to server");

  HTTPClient http;                                                                               // HTTPClient object instance
  http.begin("http://ec2-35-170-242-83.compute-1.amazonaws.com:2500/api/security/validateUser"); // Specifing request destination
  http.addHeader("Content-Type", "application/json");                                            // Specifing content type
  DynamicJsonDocument doc(1024);                                                                 // DynamicJsonDocument object instance
  doc["UID"] = content;                                                                          // Adding the UID to the JSON document
  doc["nodeLocation"] = "Entrance";                                                              // identify the location (ee will have multiple rfid .one at garage and one at entrance so it is needed to distinguish between them)
  String json;                                                                                   // String for storing the JSON document
  serializeJson(doc, json);                                                                      // Serializing the JSON document to a string
  int httpCode = http.POST(json);                                                                // Sending the request

  if (httpCode == HTTP_CODE_OK)
  {
    // The HTTP request was successful (status code 200)

    // Parse the JSON response from the server
    DynamicJsonDocument responseDoc(1024);                                       // work fine with 1024 mabye try a lower value
    DeserializationError error = deserializeJson(responseDoc, http.getString()); // Deserialize the JSON response

    // Successfully parsed the JSON response
    Serial.println("JSON response:");         // see below
    serializeJsonPretty(responseDoc, Serial); // extra step no need to do it but useful for testing

    // Now you can access and process the data from the JSON response
    bool permissionToUnlock = responseDoc["permissionToUnlock"]; // true or false
    bool isValid = responseDoc["isValid"];                       // true or false
    String nodeLocation = responseDoc["nodeLocation"];           // "Entrance" or "Garage" or "whatever idc" will be Deprecated soon

    String userName = responseDoc["userName"]; // "may exist" or may be null
    if (permissionToUnlock)                    // true
    {
      Serial.println(userName); // "printing the user name becuz now we are sure it exists"
      Serial.println("Unlocking");
      display.clearDisplay();
      display.setTextSize(2);
      display.setCursor(5, 16);
      display.println("Welcome,");
      display.println(userName);
      OpenDoor();
      display.setCursor(5, 32);
      // display.drawBitmap(0, 0, unlock, 128, 64, WHITE);
      display.display();
      delay(6000);
      uint8_t i = 0;
      // do something on oled
    }
    else
    {
      Serial.println("Denied");
      display.clearDisplay();
      display.drawBitmap(0, 0, denied, 128, 64, WHITE);
      display.display();
      delay(2000);
      CloseDoor();
      // do something on oled
    }
  }
  else
  {
    // The HTTP request was not successful
    Serial.print("HTTP code: "); // Print HTTP status code
    Serial.println(httpCode);    // Print HTTP status code
    Serial.println("HTTP request failed");
    CloseDoor();
    display.clearDisplay();
    display.println("Request failed");
    display.display();
    delay(2000);

    // do something on oled
  }

  http.end(); // Free resources

  delay(1000);
  display.clearDisplay();
  display.drawBitmap(0, 0, lock, 128, 64, WHITE);
  display.display();
}
