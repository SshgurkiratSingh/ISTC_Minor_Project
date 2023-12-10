#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>
// ---------------------------Pin Config----------------------------------------//
#define TRIGGER_PIN D5
#define ECHO_PIN D4
const uint8_t statusLedPin[4] = {D0, D1, D2, D3};
NewPing sensor(TRIGGER_PIN, ECHO_PIN, 300);
const int RelayPin = D6;
int buttonPin = D7;

// Tank Setup
#define TANK_HEIGHT 300
int levelToFill = TANK_HEIGHT - 30;
int currentLevel = 0;
bool pumpOn = false;

// -----------------------------Wifi Config-------------------------------------//
#define WIFI_SSID "ConForNode1"
#define WIFI_PASSWORD "12345678"
WiFiClient esp;

// -----------------------------MQTT Config-------------------------------------//
#define MQTT_SERVER "ec2-3-88-49-62.compute-1.amazonaws.com"
#define MQTT_PORT 1883
PubSubClient client(esp);
void displayTankLevel()
{
  // turn led on according to tank level
   for (int i = 0; i < 4; i++){
    if 
   }
}
void setup()
{
}

void loop()
{
}
