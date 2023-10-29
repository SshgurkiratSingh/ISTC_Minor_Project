/*
Date: oct 26
Description:
Updated ersion of OLED_ROOM1
This code establish connection as control panel to mqtt server to control nodes over wifi.

- PushButton attached to pin 32,33,27
- OLED attached to pin 21 (sda),22
- DHT22 attached to pin 15
- Fan 1 attached to pin 18
- Fan 2 attached to pin 4
- Light 1 attached to pin 23
- Ambient Led attached to pin 2
- Plug attached to pin 5
- Brightness Led attached to pin 19
*/

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <PubSubClient.h>
// #include <Adafruit_SH1106.h>
#include <Adafruit_SSD1306.h>
#include <DHTesp.h>
#include <WiFi.h>
#define OLED_RESET 4
// OUTPUT CONFIGS

// BUTTON CONFIG
#define MODE_BUTTON_CAP 1

Adafruit_SSD1306 display(128, 64, &Wire, -1);
// Adafruit_SH1106 display(22, 21);
DHTesp dht;

WiFiClient wifi;
PubSubClient client(wifi);
/* CONFIGURATION Parameters */
bool needUpdate = true;

#define DEBUG_MODE true
/* OLED */
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
// Button Config
#define NEXT_BUTTON 32
#define PREV_BUTTON 33
#define SELECT_BUTTON 27
// 'New Project', 16x16px
const unsigned char light[] PROGMEM = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x04, 0x80, 0x08, 0x40, 0x10, 0x20, 0x10, 0x20,
    0x10, 0x20, 0x08, 0x40, 0x07, 0x80, 0x04, 0x80, 0x04, 0x80, 0x07, 0x80, 0x00, 0x00, 0x00, 0x00};
// 'brightness', 16x16px
const unsigned char brightness[] PROGMEM = {
    0xff, 0xff, 0x80, 0x01, 0xbf, 0xfd, 0x80, 0x01, 0x80, 0x01, 0x8f, 0xf1, 0x80, 0x01, 0x80, 0x01,
    0x83, 0xc1, 0x80, 0x01, 0x80, 0x01, 0x81, 0x81, 0x80, 0x01, 0x80, 0x01, 0x80, 0x01, 0xff, 0xff};
// 'fan', 16x16px
const unsigned char fan[] PROGMEM = {
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x03, 0x80, 0x04, 0x40, 0x7d, 0x7c,
    0x04, 0x40, 0x03, 0x80, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00};
// 'plug', 16x16px
const unsigned char plug[] PROGMEM = {
    0x00, 0x00, 0x7f, 0xfe, 0x40, 0x02, 0x41, 0x82, 0x41, 0x82, 0x40, 0x02, 0x40, 0x02, 0x48, 0x12,
    0x40, 0x02, 0x40, 0x02, 0x48, 0x12, 0x40, 0x02, 0x40, 0x02, 0x40, 0x02, 0x7f, 0xfe, 0x00, 0x00};
// 'wifi', 16x16px
const unsigned char epd_bitmap_wifi[] PROGMEM = {
    0x00, 0x00, 0x07, 0xe0, 0x08, 0x10, 0x09, 0x90, 0x12, 0x48, 0x12, 0x48, 0x24, 0x24, 0x25, 0xa4,
    0x00, 0x00, 0x41, 0x5d, 0x41, 0x51, 0x2a, 0x59, 0x3e, 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
const unsigned char Ambient[] PROGMEM = {
    0xff, 0xff, 0x9f, 0xf9, 0xa0, 0x05, 0xc0, 0x03, 0x81, 0x01, 0x83, 0x81, 0x93, 0x91, 0x9b, 0xb1,
    0x9f, 0xf1, 0x9f, 0xf1, 0x87, 0xc1, 0x8d, 0x61, 0x81, 0x01, 0x80, 0x01, 0x80, 0x01, 0xff, 0xff};

// Array of all bitmaps for convenience. (Total bytes used to store images in PROGMEM = 240)

unsigned long debounceDelay = 300;
unsigned long lastDebounceTime = 0;
bool inItem = false;
uint8_t selectedItem = 0;
uint8_t upItem;
uint8_t downItem;
const char *mqtt_server = "ec2-3-88-49-62.compute-1.amazonaws.com";
float temp = 0;
float hum = 0;
// Items Configuration starts here

/**
 * Returns the bottom text to be displayed on the screen.
 *
 * @return The bottom text as a string.
 *
 * @throws None
 */
String BottomText()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        return "Not Connected To WiFi";
    }
    else if (client.connected() == false)
    {
        return "Not Connected To MQTT";
    }
    else
    {
        return "T:" + String(temp) + " Aux " + "H:" + String(hum);
    }
}
/**
 * Callback function that handles incoming messages.
 *
 * @param topic The topic of the message.
 * @param payload The payload of the message.
 * @param length The length of the payload.
 *
 * @throws None
 */
void callback(char *topic, byte *payload, unsigned int length)
{

    String message;

    for (int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }
#if DEBUG_MODE
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    Serial.println(message);
#endif
}

/**
 * Initializes the setup for the program.
 *
 * @return void
 *
 * @throws None
 */
void setup()
{
    Serial.begin(115200);
    delay(1000);
    dht.setup(15, DHTesp::DHT22);
    Serial.println(dht.getTemperature());
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    // display.begin(SH1106_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    // WiFi Name Here:______
    WiFi.begin("Wokwi-GUEST", "");
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
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
        display.setCursor(60, 50);
        display.print(i);
        display.display();
        delay(1000);
        i++;
        if (i > 12)
        {
            break;
        }
    }

    if (client.connect("auxillaryNode"))
    {
#if DEBUG_MODE
        Serial.println("connected");
#endif
    }
    else
    {
#if DEBUG_MODE
        Serial.println("failed, rc=" + client.state());
#endif
    }
#if MODE_BUTTON_CAP
#else
    pinMode(NEXT_BUTTON, INPUT_PULLUP);
    pinMode(PREV_BUTTON, INPUT_PULLUP);
    pinMode(SELECT_BUTTON, INPUT_PULLUP);
#endif
}
/**
 * Displays a progress bar on the display with the given heading and percentage.
 *
 * @param Heading the heading to be displayed
 * @param percentage the percentage of the progress bar to be filled
 *
 * @throws None
 */
void ShowPercentBar(String Heading, uint8_t percentage)
{
    display.clearDisplay();
    display.setTextSize(1);
    display.drawRect(0, 0, 128, 64, WHITE);
    display.setCursor(5, 20);
    display.print(Heading);
    display.print(" at ");
    display.print(percentage);
    display.print("%");
    display.drawRect(0, 36, 128, 16, WHITE);
    display.fillRect(0, 36, (128 * percentage) / 100, 16, WHITE);
    display.display();
}
void showValue(String ItemName, int *value, const unsigned char *icon, bool toogleButton = true)
{
    if (needUpdate)
    {
        display.clearDisplay();
        display.drawRect(0, 0, 128, 64, WHITE);
        display.drawBitmap(58, 14, epd_bitmap_wifi, 16, 16, WHITE);
        display.setCursor(5, 30);
        display.print(ItemName);
        display.setCursor(5, 36);
        if (toogleButton)
        {
            display.print(*value == 1 ? "ON" : "OFF");
        }
        else
        {
            display.print(*value);
        }
        display.display();
    }
}
/**
 * Performs the main loop of the program.
 *
 * @return void
 */
void loop()
{
    client.loop();
    for (int i = 0; i < 101; i++)
    {
        ShowPercentBar("Tank Level", i);
        delay(100);
    }
    int value = 0;
    needUpdate = true;
    showValue("Light 1", &value, light);

    delay(3000);
    needUpdate = true;
    showValue("Light 2", &value, light);
    delay(3000);
    for (int i = 0; i < 101; i++)
    {
        ShowPercentBar("Tank Level", i);
        delay(10);
    }
}