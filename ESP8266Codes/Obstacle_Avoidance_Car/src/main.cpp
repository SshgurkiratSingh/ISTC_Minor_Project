#include <Arduino.h>
#include <Servo.h>
#include <NewPing.h>

#define ServoPin 9
#define TrigPin 12
#define EchoPin 13
NewPing radar(TrigPin, EchoPin);
Servo servo;
void setup()
{
  Serial.begin(9600);
  servo.attach(ServoPin);
}

void loop()
{
  int distance = radar.ping_cm();
  Serial.println(distance);
  servo.write(180);
  delay(1000);
  servo.write(0);
  delay(1000);
}
