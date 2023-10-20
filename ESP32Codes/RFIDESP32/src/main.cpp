/*
Author:Gurkirat Singh <gurkiratsingh7092@yahoo.com>
Date:Sept 25,2023
Description:
** Server
The server responds with JSON data containing the following fields:
- "permissionToUnlock": A boolean indicating whether access is granted (true) or denied (false).
- "isValid": A boolean indicating whether the RFID card data is valid (true) or not (false).
- "nodeLocation": The location identifier where the RFID card was scanned.
- "UID": The unique identifier of the RFID card.
- "userName": The name associated with the RFID card (if valis).
- "timestamp": The timestamp of the server's response.
- "code": A numeric code indicating the status of the access request. Possible values:
  - 1: Entry approved
  - 2: Entry denied due to lack of permissions
  - 3: Entry denied due to an unknown card
*/
#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#define SS_PIN 21  // MFRC522 SDA pin
#define RST_PIN 22 // MFRC522 RST pin

MFRC522 mfrc522(SS_PIN, RST_PIN); // MFRC522 instance

void setup()
{

  Serial.begin(115200); // Initialize serial communications with the PC
  SPI.begin();          // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522 card

  WiFi.begin("Node ", "whyitellyou"); // WiFi connection
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  Serial.println("Connected to the WiFi network");
}

void loop()
{
  if (!mfrc522.PICC_IsNewCardPresent()) // Look for new cards
  {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial())
  {
    return;
  }

  String content = ""; // String for storing the UID
  byte letter;         // variable for storing the MFRC522 data

  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ")); // Concatenates the UID (a byte) with a space between
    content.concat(String(mfrc522.uid.uidByte[i], HEX));                // Converts the UID (a byte) to HEX
    // yes ,we are sending the UID in HEX format you can change it, no prob but remember to use decimal one in add user too
  }

  content.toUpperCase(); // Changes the letters in the UID to uppercase ,no need of now as sever is updated tp do it automaticlly

  Serial.println(); // Print UID
  Serial.print("Message: ");
  Serial.println(content); // Print UID
  Serial.println();
  Serial.println("Sending data to server");

  HTTPClient http;                                                   // HTTPClient object instance
  http.begin("http://192.168.1.100:2500/api/security/validateUser"); // Specifing request destination
  http.addHeader("Content-Type", "application/json");                // Specifing content type
  DynamicJsonDocument doc(1024);                                     // DynamicJsonDocument object instance
  doc["UID"] = content;                                              // Adding the UID to the JSON document
  doc["nodeLocation"] = "Entrance";                                  // identify the location (ee will have multiple rfid .one at garage and one at entrance so it is needed to distinguish between them)
  String json;                                                       // String for storing the JSON document
  serializeJson(doc, json);                                          // Serializing the JSON document to a string
  int httpCode = http.POST(json);                                    // Sending the request

  if (httpCode == HTTP_CODE_OK)
  {
    // The HTTP request was successful (status code 200)

    // Parse the JSON response from the server
    DynamicJsonDocument responseDoc(1024);                                       // work fine with 1024 mabye try a lower value
    DeserializationError error = deserializeJson(responseDoc, http.getString()); // Deserialize the JSON response

    // Successfully parsed the JSON response
    Serial.println("JSON response:");         // see below
    serializeJsonPretty(responseDoc, Serial); // extra step no need to do it but useful for testing

    // Now you can access and process the data from the JSON response
    bool permissionToUnlock = responseDoc["permissionToUnlock"]; // true or false
    bool isValid = responseDoc["isValid"];                       // true or false
    String nodeLocation = responseDoc["nodeLocation"];           // "Entrance" or "Garage" or "whatever idc" will be Deprecated soon 

    String userName = responseDoc["userName"]; // "may exist" or may be null
    if (permissionToUnlock)                    // true
    {
      Serial.println(userName); // "printing the user name becuz now we are sure it exists"
      Serial.println("Unlocking");
      // do something on oled
    }
    else
    {
      Serial.println("Denied");
      // do something on oled
    }
  }
  else
  {
    // The HTTP request was not successful
    Serial.print("HTTP code: "); // Print HTTP status code
    Serial.println(httpCode);    // Print HTTP status code
    Serial.println("HTTP request failed");
    // do something on oled
  }

  http.end();  // Free resources
  delay(1000); // Wait 1 second before next scan
}