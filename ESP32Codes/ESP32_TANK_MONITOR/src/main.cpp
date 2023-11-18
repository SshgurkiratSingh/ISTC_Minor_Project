/*,
Date : Nov 18,23
Description:
Program to monitor a water tank and fill it if it is below limit and limit can be configured using mqtt

*/
#include <Arduino.h>
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <PubSubClient.h>
// #include <Adafruit_SH1106.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <NewPing.h>
//---------------------------------WiFi Config-----------------------
#define SSID "Wokwi-GUEST"
#define PASSWORD ""
WiFiClient esp;
// ------------------------------MQTT Config-------------------------
const char *mqtt_server = "ec2-3-88-49-62.compute-1.amazonaws.com";
PubSubClient client(esp);
Adafruit_SSD1306 display(128, 64, &Wire, -1);
const unsigned char epd_bitmap_wifi[] PROGMEM = {
    0x00, 0x00, 0x07, 0xe0, 0x08, 0x10, 0x09, 0x90, 0x12, 0x48, 0x12, 0x48, 0x24, 0x24, 0x25, 0xa4,
    0x00, 0x00, 0x41, 0x5d, 0x41, 0x51, 0x2a, 0x59, 0x3e, 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
//--------------------- UltraSonic Cnfig--------------------------
NewPing tankMonitor(23, 19, 100);
int waterLevel = 0;
#define WaterTankSize 20
int tankToFill = 70;
// ----------------------------Buzzer and Relay Config-------------------------
#define BUZZER_PIN 27
#define RELAY_PIN 18
void callback(char *topic, byte *payload, unsigned int length)
{
  char msg[length + 1];
  strncpy(msg, (char *)payload, length);
  msg[length] = '\0';
  tankToFill = atoi(msg);
}

void connectToMQTT()
{
  while (!client.connected())
  {
    if (client.connect("ArduinoClient"))
    {
      client.subscribe("your/tankToFill/topic");
    }
    else
    {
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RELAY_PIN, LOW);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  WiFi.begin(SSID, PASSWORD);
  uint8_t i = 0;
  while (WiFi.status() != WL_CONNECTED)
  {

#if DEBUG_MODE
    Serial.println("Connecting to WiFi..");
#endif
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
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  connectToMQTT();
}
bool needUpdate = false;
bool lastStatus = false;
void updateDisplay()
{
  int levelPercentage = (waterLevel * 100) / WaterTankSize;
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("IoT Water Monitor");
  display.drawLine(0, 14, 128, 14, WHITE);
  display.setCursor(0, 16);
  display.setTextSize(1);
  display.print("Water Level: ");
  display.print(levelPercentage);
  display.println("%");
  display.setCursor(0, 32);
  display.print("Fill Target: ");
  display.print(tankToFill);
  display.println("%");
  display.setCursor(0, 48);
  if (waterLevel < (WaterTankSize * tankToFill / 100))
  {
    display.println("Pump is on");
  }
  else
  {
    display.println("Tank is filled to the requirement");
  }
  display.display();
}

void checkAndFill()
{
  if (waterLevel < (WaterTankSize * tankToFill / 100))
  {
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    if (!lastStatus)
    {
      needUpdate = true;
      lastStatus = true;
    }
  }
  else
  {
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    if (lastStatus)
    {
      needUpdate = true;
      lastStatus = false;
    }
  }
}

void loop()
{
  if (!client.connected())
  {
    connectToMQTT();
  }
  client.loop();

  waterLevel = tankMonitor.ping_cm();
  updateDisplay();
  checkAndFill();
  if (needUpdate)
  {
    client.publish("maninder/tank/status", String(tankToFill).c_str(), true);
  }
}