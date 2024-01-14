#include <Arduino.h>
#include <ESP32Encoder.h>

ESP32Encoder encoder;


void setup() {
	Serial.begin(9600);
encoder.attachHalfQuad(32, 33);
encoder.setCount(37);

}

void loop() {
Serial.println(encoder.getCount());
delay(1000);
}

