/*
Author: Gurkirat Singh
Date: 05/11/2023
Implementing Functions to update WiFi Config with ESP32 using UART

*/
#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <LittleFS.h>

// Little FS config starts here
#define DBUG_MODE 1
const char *configFilePath = "/config.json";
char SSID[15] = "ConForNode1";
char PASSWORD[15] = "12345678";

/**
 * Loads the configuration from a file.
 *
 * @return true if the configuration is successfully loaded, false otherwise.
 *
 * @throws ErrorType if there is an error opening the config file or parsing the JSON.
 */
bool loadConfiguration()
{
  File configFile = LittleFS.open(configFilePath, "r");
  if (!configFile)
  {
    Serial.println("Failed to open config file for reading");

    return false;
  }

  size_t size = configFile.size();
  if (size == 0)
  {
    Serial.println("Config file is empty");
    configFile.close();
    return false;
  }

  std::unique_ptr<char[]> buf(new char[size]);
  configFile.readBytes(buf.get(), size);
  configFile.close();

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, buf.get());
  if (error)
  {
    Serial.println("Failed to parse config file");
    return false;
  }

  const char *ssid = doc["ssid"];
  const char *password = doc["password"];
#if DBUG_MODE
  Serial.print("Loaded SSID: ");
  Serial.println(ssid);
  Serial.print("Loaded password: ");
  Serial.println(password);
#endif
  strcpy(SSID, ssid);
  strcpy(PASSWORD, password);

  return true;
}
/**
 * Saves the given WiFi configuration to a file in LittleFS.
 *
 * @param ssid the SSID of the WiFi network
 * @param password the password of the WiFi network
 *
 * @throws ErrorType if there is an error opening or writing to the config file
 */
void saveConfiguration(const char *ssid, const char *password)
{
  StaticJsonDocument<512> doc;
  doc["ssid"] = ssid;
  doc["password"] = password;
  strcpy(SSID, ssid);
  strcpy(PASSWORD, password);
  File configFile = LittleFS.open(configFilePath, "w");
  if (!configFile)
  {
    Serial.println("Failed to open config file for writing");
    return;
  }

  serializeJson(doc, configFile);
  configFile.close();
  Serial.println("Configuration saved");
  ESP.restart();
}
void checkForConfigThroughUART()
{
  if (Serial.available())
  {
    String config = Serial.readString();
    Serial.println(config);
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, config);
    if (error)
    {
      Serial.println("Failed to parse config file");
      return;
    }
    const char *ssid = doc["ssid"];
    const char *password = doc["password"];
    saveConfiguration(ssid, password);
  }
}
/**
 * Initializes the setup of the program.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void setup()
{
  LittleFS.begin();
  Serial.begin(115200);
  loadConfiguration();
}

void loop()
{
  delay(100);
  checkForConfigThroughUART();
  // put your main code here, to run repeatedly:
}
