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
- PIR attached to pin 14
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
#define FAN 1
#define PLUG 2
#define LIGHT 3
#define BRIGHTNESS 4
#define PIR 14
// BUTTON CONFIG
#define MODE_BUTTON_CAP 1

Adafruit_SSD1306 display(128, 64, &Wire, -1);
// Adafruit_SH1106 display(22, 21);
DHTesp dht;

WiFiClient wifi;
PubSubClient client(wifi);
/* CONFIGURATION Parameters */
#define MAX_ITEMS 7
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

const unsigned char TV[] PROGMEM = {
    0xff, 0xff, 0x80, 0x01, 0x80, 0x01, 0x9f, 0xf9, 0x90, 0x09, 0x90, 0x09, 0x90, 0x09, 0x90, 0x09,
    0x90, 0x09, 0x9f, 0xf9, 0x81, 0x81, 0x87, 0xe1, 0x80, 0x01, 0x80, 0x01, 0x80, 0x01, 0xff, 0xff};

// Array of all bitmaps for convenience. (Total bytes used to store images in PROGMEM = 240)
const int epd_bitmap_allArray_LEN = 7;
const unsigned char *logoArray[7] = {
    light,
    light,
    Ambient,
    TV,
    fan,
    fan,
    plug};

unsigned long debounceDelay = 300;
unsigned long lastDebounceTime = 0;
bool inItem = false;
uint8_t selectedItem = 0;
uint8_t upItem;
uint8_t downItem;
const char *mqtt_server = "ec2-35-170-242-83.compute-1.amazonaws.com";
float temp = 0;
float hum = 0;
// Items Configuration starts here
const char selectableItems[MAX_ITEMS][15] = {
    "Light 1",
    "Light 2",
    "Ambient Mode",
    "TV",
    "Fan 1",
    "Fan 2",
    "Switch Board",
};
const bool toggleItems[MAX_ITEMS] = {true, true, true, true, false, false, true};
int currentValue[MAX_ITEMS] = {
    0,
    0,
    0,
    0,
    0,
    0,
    0,
};
const char topics[MAX_ITEMS][30] = {"IoT/hall/light1", "IoT/hall/light2", "IoT/hall/ambientLight", "IoT/hall/TV", "IoT/hall/fan1", "IoT/hall/fan2", "IoT/hall/switchBoard1"};

const uint8_t itemPin[MAX_ITEMS - 1] = {23, 19, 18, 5, 4, 2};

const uint8_t maxValues[MAX_ITEMS] = {1, 1, 1, 1, 100, 100, 1};
bool needUpdate = true;

char SSID[32] = "ConForNode1"; // Increased size for SSID
char PASSWORD[64] = "12345678";       // Increased size for Password
unsigned long lastMotionTime = 0;


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
        return "T:" + String(temp) + " Hall " + "H:" + String(hum);
     
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
    for (int i = 0; i < MAX_ITEMS; i++)
    {
        if (String(topics[i]) == String(topic))
        {
            if (maxValues[i] == 1)
            {
                // For topics that can only have "0" or "1"
                if (message == "1" || message == "0")
                {
                    currentValue[i] = message.toInt();
                    needUpdate = true;
                }
            }
            else
            {
                // For topics that can have other values
                currentValue[i] = message.toInt();
                needUpdate = true;
            }
            break;
        }
    }
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
    pinMode(PIR, INPUT);
    dht.setup(15, DHTesp::DHT22);
    Serial.println(dht.getTemperature());
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    WiFi.begin(SSID, PASSWORD);
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
        display.display();
        delay(1000);
        i++;
        if (i > 12)
        {
            break;
        }
    }

    if (client.connect("hallNode"))
    {

#if DEBUG_MODE
        Serial.println("connected");
#endif
        for (int i = 0; i < MAX_ITEMS; i++)
        {
#if DEBUG_MODE
            Serial.print("Subscribing to: ");
            Serial.println(topics[i]);
#endif
            client.subscribe(topics[i]);
        }
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
    for (int i = 0; i < MAX_ITEMS - 1; i++)
    {
        pinMode(itemPin[i], OUTPUT);
    }
}

/**
 * Displays the items on the screen.
 *
 * @throws ErrorType description of error
 */
void displayItems()
{
    if (!needUpdate)
        return;

    if (!inItem)
    {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(WHITE);
        // Up Item
        display.setCursor(24, 4);
        display.print(selectableItems[upItem]);
        display.setCursor(100, 4);
        display.print(currentValue[upItem]);
        display.drawBitmap(5, 0, logoArray[upItem], 16, 16, WHITE);

        // Center Item
        display.drawLine(5, 16, 122, 16, WHITE);
        display.drawLine(122, 16, 122, 31, WHITE);
        display.drawLine(5, 31, 122, 31, WHITE);
        display.drawLine(5, 16, 5, 31, WHITE);
        display.setCursor(24, 20);
        display.print(selectableItems[selectedItem]);
        display.setCursor(100, 20);
        display.print(currentValue[selectedItem]);
        display.drawBitmap(5, 16, logoArray[selectedItem], 16, 16, WHITE);

        // Down Item
        display.setCursor(24, 36);
        display.print(selectableItems[downItem]);
        display.setCursor(100, 36);
        display.print(currentValue[downItem]);
        display.drawBitmap(5, 32, logoArray[downItem], 16, 16, WHITE);

        display.setCursor(2, 51);
        display.print(BottomText());

        display.display();
    }
    else
    {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(5, 32);
        display.print(selectableItems[selectedItem]);
        display.print(":");
        display.print(currentValue[selectedItem]);
        display.setTextColor(WHITE);

        display.drawLine(5, 16, 122, 16, WHITE);
        display.display();
    }
    needUpdate = false;
}

/**
 * Fixes the numbering of items.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void fixNumbering()
{
    upItem = (selectedItem == 0) ? (MAX_ITEMS - 1) : (selectedItem - 1);
    downItem = (selectedItem == (MAX_ITEMS - 1)) ? 0 : (selectedItem + 1);
}

/**
 * Checks the state of the buttons and performs corresponding actions.
 *
 * @return void
 *
 * @throws None
 */
void checkButtons()
{
    unsigned long currentTime = millis();

    // Check the next button
    // Check the next button
    if (
#if MODE_BUTTON_CAP
        touchRead(NEXT_BUTTON) < 30
#else
        (digitalRead(NEXT_BUTTON) == LOW)
#endif
    )
    {
#if DEBUG_MODE
        Serial.println("next");
#endif
        if ((currentTime - lastDebounceTime) >= debounceDelay)
        {
            lastDebounceTime = currentTime;
            needUpdate = true;
            if (!inItem)
            {
                selectedItem = (selectedItem + 1) % MAX_ITEMS;
            }
            else
            {
                if (maxValues[selectedItem] == 100)
                {
                    currentValue[selectedItem] = max(0, currentValue[selectedItem] - 10); // Decrement by 10, min 0
                }
                else
                {
                    currentValue[selectedItem] = (currentValue[selectedItem] == 0) ? maxValues[selectedItem] : (currentValue[selectedItem] - 1);
                }
            }
        }
    }

    // Check the previous button
    if (
#if MODE_BUTTON_CAP
        touchRead(PREV_BUTTON) < 30
#else
        (digitalRead(PREV_BUTTON) == LOW)
#endif
    )
    {
#if DEBUG_MODE
        Serial.println("prev");
#endif
        if ((currentTime - lastDebounceTime) >= debounceDelay)
        {
            needUpdate = true;
            lastDebounceTime = currentTime;
            if (!inItem)
            {
                selectedItem = (selectedItem == 0) ? (MAX_ITEMS - 1) : (selectedItem - 1);
            }
            else
            {

                if (maxValues[selectedItem] == 100)
                {
                    currentValue[selectedItem] = min(100, currentValue[selectedItem] + 10); // Increment by 10, max 100
                }
                else
                {
                    currentValue[selectedItem] = (currentValue[selectedItem] + 1) % maxValues[selectedItem];
                }
            }
        }
    }

    // Check the select button
    if (
#if MODE_BUTTON_CAP
        touchRead(SELECT_BUTTON) < 30
#else
        (digitalRead(SELECT_BUTTON) == LOW)
#endif
    )
    {
#if DEBUG_MODE
        Serial.println("select");
#endif
        if ((currentTime - lastDebounceTime) >= debounceDelay)
        {
            needUpdate = true;
            lastDebounceTime = currentTime;
            inItem = !inItem;
        }
        if (!inItem)
        {
            String payload = String(currentValue[selectedItem]);
            client.publish(topics[selectedItem], payload.c_str(), true);
#if DEBUG_MODE
            Serial.print("Published to ");
            Serial.print(topics[selectedItem]);
            Serial.print(": ");
            Serial.println(payload);
#endif
        }
    }
}

/**
 * Updates the temperature and humidity readings.
 *
 * @return void
 */
void updateTempHum()
{
    float t = dht.getTemperature();
    float h = dht.getHumidity();

    if (isnan(t) || isnan(h) || t == 0 || h == 0)
    {
        return;
    }
    else
    {

        if ((temp != t) || (hum != h))
        {
            temp = t;
            hum = h;
            Serial.println("updatte detected");
            needUpdate = true;
            client.publish("IoT/hall/temperature", String(temp).c_str(), true);
            client.publish("IoT/hall/humidity", String(hum).c_str(), true);
        }
    }
}

/**
 * Updates the output based on the current values.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void updateOutput()
{
    digitalWrite(itemPin[0], currentValue[0]);
    digitalWrite(itemPin[1], currentValue[1]);
    digitalWrite(itemPin[3], currentValue[6]);
    analogWrite(itemPin[2], currentValue[4] * 2.55);
    analogWrite(itemPin[5], currentValue[2 + 4] * 2.55);

    digitalWrite(itemPin[3], currentValue[3 + 1]);
}
/**
 * Reconnects to MQTT if not connected, and sets needUpdate to true.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void reconnectMQTT() {
    
    if (!client.connected()) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(WHITE);
        display.setCursor(0, 0);
        display.println("Attempting MQTT Reconnection...");
        display.drawBitmap(58, 14, epd_bitmap_wifi, 16, 16, WHITE);
        display.display();
        Serial.print("Attempting MQTT connection...");
        // Attempt to connect
        if (client.connect("hallNode")) {
            Serial.println("connected to MQTT");
            // Subscribe to topics again
            for (int i = 0; i < MAX_ITEMS; i++) {
                client.subscribe(topics[i]);
            }
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            // Wait 5 seconds before retrying
            delay(2000);

        }
    }
    needUpdate = true;
}

void reconnectWiFi() {
    // Loop until we're reconnected to WiFi
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print("Attempting WiFi connection...");
        // Attempt to connect to WiFi
        WiFi.begin(SSID, PASSWORD);
        // Wait 10 seconds for connection:
        delay(3000);
    }
    Serial.println("Connected to WiFi");
}
void CheckPIR() {
     if (digitalRead(PIR) == HIGH) {
    Serial.println("Motion detected!");
    client.publish(topics[1], "1", true);
    lastMotionTime = millis();
    client.publish(topics[0], "1", true);
  } else if (millis() - lastMotionTime > 30000) {
    client.publish("IoT/hall/automationTriggered", "1", true);
    Serial.println("Motion stopped!");
    client.publish(topics[0], "0", true);
    client.publish(topics[1], "0", true);
    client.publish(topics[4], "0", true);
    client.publish(topics[5], "0", true);

  }
}

/**
 * Performs the main loop of the program.
 *
 * @return void
 */
void loop()
{ 
    if (WiFi.status() == WL_CONNECTED) {
     if (!client.connected()) {
        reconnectMQTT();
    }
}
    CheckPIR();
    client.loop();
    fixNumbering();
    displayItems();
    checkButtons();
    updateOutput();
    updateTempHum();
}
