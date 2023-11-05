#include <Arduino.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <BluetoothSerial.h>

BluetoothSerial SerialBT;
StaticJsonDocument<256> config;
String getLineFromBT()
{
  String received;
  while (true)
  {
    if (SerialBT.available())
    {
      received = SerialBT.readStringUntil('\n');
      received.trim();
      if (received.length() > 0)
      {
        return received;
      }
      else
      {
        return "N/A";
      }
    }
  }
}
/**
 * Adds a new entry to the "pending" object in the JSON file.
 *
 * @param newEntry the new entry to be added
 *
 * @throws ErrorType if there is an error opening the config file for writing
 */
void addToPending(const String &newEntry)
{
  File configFile = LittleFS.open("/config.json", "r");

  // Parse existing JSON from file
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, configFile);
  configFile.close();

  // Access the "pending" object
  JsonObject root = doc.as<JsonObject>();
  JsonObject pending = root["pending"].as<JsonObject>();
  // if pending is null   create it
  if (pending.isNull())
  {
    pending = root.createNestedObject("pending");
  }
  // Generate a new unique key, assuming it's an integer
  int newKey = pending.size() + 1;

  // Add the new entry to the "pending" object
  pending[String(newKey)] = newEntry;

  // Serialize the modified JSON back to the file
  configFile = LittleFS.open("/config.json", "w");
  if (!configFile)
  {
    Serial.println("Failed to open config file for writing");
    return;
  }

  serializeJson(doc, configFile);
  configFile.close();
}
void checkPendingAndEraseOneByOne()
{
  File configFile = LittleFS.open("/config.json", "r");

  // Parse existing JSON from file
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, configFile);
  configFile.close();

  // Access the "pending" object
  JsonObject root = doc.as<JsonObject>();
  JsonObject pending = root["pending"].as<JsonObject>();

  // if pending is null, return
  if (pending.isNull())
  {
    return;
  }

  // Remove the first entry from "pending"
  for (JsonPair kv : pending)
  {
    pending.remove(kv.key().c_str());
    break; // Remove only one entry
  }

  // Serialize the modified JSON back to the file
  configFile = LittleFS.open("/config.json", "w");
  if (!configFile)
  {
    Serial.println("Failed to open config file for writing");
    return;
  }

  serializeJson(doc, configFile);
  configFile.close();
}

void setup()
{
  Serial.begin(115200);

  if (!LittleFS.begin())
  {
    Serial.println("initialization failed");
    return;
  }

  if (LittleFS.exists("/config.json"))
  {
    File configFile = LittleFS.open("/config.json", "r");
    deserializeJson(config, configFile);
    serializeJsonPretty(config, Serial);
    configFile.close();
  }
  else
  {
    SerialBT.begin("ESP32_BT_Config");
    Serial.println("Waiting for Bluetooth configuration");

    config["wifi_ssid"] = "default_ssid";
    config["wifi_pass"] = "default_pass";

    SerialBT.println("Please enter WiFi SSID:");
    config["wifi_ssid"] = getLineFromBT();

    SerialBT.println("Please enter WiFi Password:");
    config["wifi_pass"] = getLineFromBT();

    SerialBT.end();
    Serial.println("Configuration complete");
    File configFile = LittleFS.open("/config.json", "w");
    if (serializeJson(config, configFile) == 0)
    {
      Serial.println("Writing to file failed");
    }
    configFile.close();
  }
}

void loop()
{
  // Your main code here
  checkPendingAndEraseOneByOne();

  delay(100000);
}
