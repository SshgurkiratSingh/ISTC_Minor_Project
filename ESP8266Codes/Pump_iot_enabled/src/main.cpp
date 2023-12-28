#include <Arduino.h>
#include <NewPing.h>

#define TRIGGER_PIN 5
#define ECHO_PIN 4
const uint8_t statusLedPin[4] = {7, 8, 9, 10};
NewPing sensor(TRIGGER_PIN, ECHO_PIN, 300);
const int RelayPin = 6;
int buttonPin = 2;

#define TANK_HEIGHT 300
int levelToFill = 30; // Distance from sensor to water when tank is full
int currentDistance = 0;

unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 1000;
bool pumpOn = false;
bool lastPumpState = false;
void displayTankLevel()
{
  int level = TANK_HEIGHT - currentDistance; // Convert distance to level
  for (int i = 0; i < 4; i++)
  {
    if (level > i * 75)
    { // Adjusted for correct level display
      digitalWrite(statusLedPin[i], HIGH);
    }
    else
    {
      digitalWrite(statusLedPin[i], LOW);
    }
  }
  Serial.print("Current Water Level: ");
  Serial.println(level);
}

void checkPumpStatus()
{
  if (currentDistance <= levelToFill)
  {
    pumpOn = false;
    digitalWrite(RelayPin, LOW);
    Serial.println("Pump turned off due to level limit reached.");
  }
  else
  {
    pumpOn = true;
  }
}

void setup()
{
  Serial.begin(9600);
  pinMode(RelayPin, OUTPUT);
  for (int i = 0; i < 4; i++)
  {
    pinMode(statusLedPin[i], OUTPUT);
    digitalWrite(statusLedPin[i], LOW);
  }
  pinMode(buttonPin, INPUT);
  digitalWrite(RelayPin, LOW);
  Serial.println("Setup complete.");
}

void loop()
{
  int buttonState = digitalRead(buttonPin);
  unsigned long currentTime = millis();

  currentDistance = sensor.ping_cm();
  displayTankLevel();
  checkPumpStatus();

  // Update the relay only if the pump state has changed
  if (pumpOn != lastPumpState)
  {
    digitalWrite(RelayPin, pumpOn ? HIGH : LOW);
    lastPumpState = pumpOn; // Update the last pump state
  }
}
