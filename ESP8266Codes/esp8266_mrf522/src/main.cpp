/*
Author:Gurkirat Singh <gurkiratsingh7092@yahoo.com> & Tarun Kotyan <tarunkotyan@gmail.com>
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
** RFID code modified from Tarun Kotyan's code of door lock/unlock security

** Client
The client sends a JSON data containing the following fields:
- "UID": The unique identifier of the RFID card.
- "nodeLocation": The location identifier where the RFID card was scanned.

** Server and Client libraries

*/
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#define RST_PIN D3
#define SS_PIN D4
MFRC522 mfrc522(SS_PIN, RST_PIN);
#define WIFI_SSID "Node "
#define WIFI_PASS "whyitellyou"
WiFiClient wifi;

void setup()
{
  Serial.begin(115200); // Initialize serial communications with the PC
  Serial.print("Connecting to WiFi: " + String(WIFI_SSID) + " ... ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  // Wait until WiFi is connected
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("connected");
  SPI.begin();                       // Init SPI bus
  mfrc522.PCD_Init();                // Init MFRC522
  delay(4);                          // Optional delay. Some boards may need more time after init to be ready, see Readme
  mfrc522.PCD_DumpVersionToSerial(); // Show details of PCD - MFRC522 Card Reader details
}
void loop()
{
  if (!mfrc522.PICC_IsNewCardPresent())
  {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial())
  {
    return;
  }
  Serial.println();
  Serial.print(" UID tag :");
  String content = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
    content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
    content.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  content.toUpperCase();
  Serial.println(content); // Print UID content
  WiFiClientSecure client; // Create a client object
  HTTPClient http;         // create the http client object

  client.setInsecure(); // Ignore SSL certificate verification if self-signed without it is returning 400 error
  // and server doesnot get any req

  http.begin(client, "https://nodejs.gurkirat7092.repl.co/api/security/validateUser"); // Specify the request destination and give it wifi object

  http.addHeader("Content-Type", "application/json"); // Specify content type
  DynamicJsonDocument doc(1024);                      // DynamicJsonDocument object instance
  doc["UID"] = content;                               // Add the UID to the JSON document
  doc["nodeLocation"] = "Entrance";                   // Identify the location (we will have multiple RFID readers)
  String json;                                        // String for storing the JSON document
  serializeJson(doc, json);                           // Serialize the JSON document to a string
  int httpCode = http.POST(json);                     // Send the request

  if (httpCode == HTTP_CODE_OK)
  {
    // The HTTP request was successful (status code 200)

    // Parse the JSON response from the server
    DynamicJsonDocument responseDoc(1024);                                       // Work fine with 1024, you can try a lower value
    DeserializationError error = deserializeJson(responseDoc, http.getString()); // Deserialize the JSON response

    // Successfully parsed the JSON response
    Serial.println("JSON response:");
    serializeJsonPretty(responseDoc, Serial); // Useful for testing

    // Now you can access and process the data from the JSON response
    bool permissionToUnlock = responseDoc["permissionToUnlock"]; // true or false
    bool isValid = responseDoc["isValid"];                       // true or false
    String nodeLocation = responseDoc["nodeLocation"];           // "Entrance" or "Garage" or "whatever "

    String userName = responseDoc["userName"]; // "may exist" or may be null
    if (permissionToUnlock)                    // if permissionToUnlock is true
    {
      Serial.println(userName); // Printing the user name because now we are sure it exists
      Serial.println("Unlocking");
      // Do something (oled ,button , unlock door,logic here )
    }
    else
    {
      Serial.println("Denied");
      // Handle the denied access scenario 
    }
  }
  else
  {
    // The HTTP request was not successful
    Serial.print("HTTP code: "); // Print HTTP status code if not 200
    // do oled here tooo

    Serial.println(httpCode); // Print HTTP status code
    Serial.println("HTTP request failed");
    // Handle the failed request
  }

  http.end();  // Free resources
  delay(1000); // Wait 1 second before the next scan
}
