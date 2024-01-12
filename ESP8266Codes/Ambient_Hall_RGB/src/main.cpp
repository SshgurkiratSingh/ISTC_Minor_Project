#include <Arduino.h>
#include <RGBLed.h>

// Define three RGBLed objects for three LEDs
RGBLed led1(D0, D1, D2, RGBLed::COMMON_ANODE);
RGBLed led2(D3, D4, D5, RGBLed::COMMON_ANODE);
RGBLed led3(D6, D7, D8, RGBLed::COMMON_ANODE);

// Define arrays of colors for each LED
const int colorCount = 8;
int colors[colorCount][3] = {
  {255, 0, 0},    // Red
  {0, 255, 0},    // Green
  {0, 0, 255},    // Blue
  {255, 255, 0},  // Yellow
  {255, 0, 255},   // Magenta
    {0,255,255},
    {255,125,60},
    {125,68,21}
};

void setup() {
pinMode(A0,INPUT);
}

void loop() {
 if (analogRead(A0) > 500)
 { int fadeDuration = 1000;
  int steps = 15;

  for (int i = 0; i < colorCount; ++i) {
    // Apply the color pattern to each LED
    led1.fadeIn(colors[i][0], colors[i][1], colors[i][2], steps, fadeDuration);
    led2.fadeIn(colors[(i+1) % colorCount][0], colors[(i+1) % colorCount][1], colors[(i+1) % colorCount][2], steps, fadeDuration);
    led3.fadeIn(colors[(i+2) % colorCount][0], colors[(i+2) % colorCount][1], colors[(i+2) % colorCount][2], steps, fadeDuration);

    delay(fadeDuration);

    led1.fadeOut(colors[i][0], colors[i][1], colors[i][2], steps, fadeDuration);
    led2.fadeOut(colors[(i+1) % colorCount][0], colors[(i+1) % colorCount][1], colors[(i+1) % colorCount][2], steps, fadeDuration);
    led3.fadeOut(colors[(i+2) % colorCount][0], colors[(i+2) % colorCount][1], colors[(i+2) % colorCount][2], steps, fadeDuration);

    delay(fadeDuration);
  }}
  else {
    delay(100);
  }
}
