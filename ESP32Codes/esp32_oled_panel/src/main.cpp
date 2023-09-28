#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <PubSubClient.h>
#include <Adafruit_SH1106.h>
#include <WiFi.h>
#define OLED_RESET 4
Adafruit_SH1106 display(22, 21);
WiFiClient wifi;
PubSubClient client(wifi);
/* CONFIGURATION Parameters */
#define MAX_ITEMS 5
#define DEBUG_MODE true

/* OLED */
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define NEXT_BUTTON 27
#define PREV_BUTTON 14
#define SELECT_BUTTON 12
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

// Array of all bitmaps for convenience. (Total bytes used to store images in PROGMEM = 240)
const int epd_bitmap_allArray_LEN = 5;
const unsigned char *logoArray[5] = {
    light,
    light,
    brightness,
    fan,
    plug};

unsigned long debounceDelay = 300;
unsigned long lastDebounceTime = 0;
bool inItem = false;
uint8_t selectedItem = 0;
uint8_t upItem;
uint8_t downItem;
const char *mqtt_server = "mqtt://broker.hivemq.com";

// Items Configuration starts here
const char selectableItems[MAX_ITEMS][15] = {
    "Light 1",
    "Light 2",
    "Brightness",
    "Fan",
    "Plug 1",
};
const bool toggleItems[MAX_ITEMS] = {true, true, false, false, true};
int currentValue[MAX_ITEMS] = {0, 0, 0, 0, 0};
const char topics[MAX_ITEMS][30] = {"IoT/room1/light1", "IoT/room1/light2", "IoT/room1/brightness1", "IoT/room1/fan1", "IoT/room1/switchBoard1"};
const uint8_t maxValues[MAX_ITEMS] = {1, 1, 10, 10, 1};
bool needUpdate = true;
void callback(char *topic, byte *payload, unsigned int length)
{
    String message;
    for (int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }

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

void setup()
{
    Serial.begin(115200);
    delay(1000);

    display.begin(SH1106_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    WiFi.begin("Node ", "whyitellyou");
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
    while (WiFi.status() != WL_CONNECTED)
    {

#if DEBUG_MODE
        Serial.println("Connecting to WiFi..");
#endif
        display.setTextSize(1);
        display.setCursor(5, 32);
        display.print("Connecting to WiFi..");
        display.display();
        delay(1000);
    }

    if (client.connect("ESP8266Client"))
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

    pinMode(NEXT_BUTTON, INPUT_PULLUP);
    pinMode(PREV_BUTTON, INPUT_PULLUP);
    pinMode(SELECT_BUTTON, INPUT_PULLUP);
    delay(2000);
}

void displayItems()
{
    if (needUpdate)
    {
        if (!inItem)
        {
            display.clearDisplay();
            display.setTextSize(1);
            display.setTextColor(WHITE);
            // Up Item
            display.setCursor(24, 4);
            display.print(selectableItems[upItem]);
            display.drawBitmap(5, 0, logoArray[upItem], 16, 16, WHITE);

            // Center Item
            display.drawLine(5, 16, 122, 16, WHITE);
            display.drawLine(122, 16, 122, 31, WHITE);
            display.drawLine(5, 31, 122, 31, WHITE);
            display.drawLine(5, 16, 5, 31, WHITE);
            display.setCursor(24, 20);
            display.print(selectableItems[selectedItem]);
            display.drawBitmap(5, 16, logoArray[selectedItem], 16, 16, WHITE);

            // Down Item
            display.setCursor(24, 36);
            display.print(selectableItems[downItem]);
            display.drawBitmap(5, 32, logoArray[downItem], 16, 16, WHITE);

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
}

void fixNumbering()
{
    upItem = (selectedItem == 0) ? (MAX_ITEMS - 1) : (selectedItem - 1);
    downItem = (selectedItem == (MAX_ITEMS - 1)) ? 0 : (selectedItem + 1);
}

void checkButtons()
{
    unsigned long currentTime = millis();

    // Check the next button
    if (digitalRead(NEXT_BUTTON) == LOW)
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
                currentValue[selectedItem] = (currentValue[selectedItem] + 1) % maxValues[selectedItem];
            }
        }
    }

    // Check the previous button
    if (digitalRead(PREV_BUTTON) == LOW)
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
                currentValue[selectedItem] = (currentValue[selectedItem] == 0) ? maxValues[selectedItem] : (currentValue[selectedItem] - 1);
            }
        }
    }

    // Check the select button
    if (digitalRead(SELECT_BUTTON) == LOW)
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
        if (inItem)
        {
            String payload = String(currentValue[selectedItem]);
            client.publish(topics[selectedItem], payload.c_str());
#if DEBUG_MODE
            Serial.print("Published to ");
            Serial.print(topics[selectedItem]);
            Serial.print(": ");
            Serial.println(payload);
#endif
        }
    }

    void loop()
    {
        client.loop();
        fixNumbering();
        displayItems();
        checkButtons();
        delay(100);
    }