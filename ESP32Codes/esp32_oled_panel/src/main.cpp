#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>

#include "./Adafruit_SH1106.h"
#define OLED_RESET 4
Adafruit_SH1106 display(OLED_RESET);
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

// Items Configuration starts here
const char selectableItems[MAX_ITEMS][15] = {
    "Light 1",
    "Light 2",
    "Brightness",
    "Fan",
    "Plug 1",
};
const bool toggleItems[MAX_ITEMS] = {true, true, false, false, true};
const uint8_t maxValues[MAX_ITEMS] = {1, 1, 10, 10, 1};

void setup()
{
    Serial.begin(115200);
    delay(1000);

    display.begin(SH1106_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    pinMode(NEXT_BUTTON, INPUT_PULLUP);
    pinMode(PREV_BUTTON, INPUT_PULLUP);
    pinMode(SELECT_BUTTON, INPUT_PULLUP);
    delay(2000);
}

void displayItems()
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
        display.setTextColor(WHITE);
        // Center Item
        display.drawLine(5, 16, 122, 16, WHITE);
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
            if (!inItem)
            {
                selectedItem = (selectedItem + 1) % MAX_ITEMS;
            }
            else
            {
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
            lastDebounceTime = currentTime;
            if (!inItem)
            {
                selectedItem = (selectedItem == 0) ? (MAX_ITEMS - 1) : (selectedItem - 1);
            }
            else
            {
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
            lastDebounceTime = currentTime;
            inItem = !inItem;
        }
    }
}

void loop()
{
    fixNumbering();
    displayItems();
    checkButtons();

    delay(100); // Adjust the delay as needed
}
