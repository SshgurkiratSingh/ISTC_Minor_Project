/*
Author:Gurkirat Singh <gurkiratsingh7092@yahoo.com>
Date:Oct 22,2023
Description:
** Server
The server responds with JSON data containing the following fields:
- "permissionToUnlock": A boolean indicating whether access is granted (true) or denied (false).
- "isValid": A boolean indicating whether the RFID card data is valid (true) or not (false).
- "userTeam":Indicating User Team (if valid).
- "UID": The unique identifier of the RFID card.
- "userName": The name associated with the RFID card (if valis).
- "timestamp": The timestamp of the server's response.
- "userType": The type of the user (if valid).
- "userRollNo": The roll number of the user (if valid).
- "email": The email address of the user (if valid).
- "code": A numeric code indicating the status of the access request. Possible values:
  - 1: Entry approved
  - 2: Entry denied due to lack of permissions
  - 3: Entry denied due to an unknown card

** Client
The client sends a JSON data containing the following fields:
- "UID": The unique identifier of the RFID card.
- "nodeLocation": The location identifier where the RFID card was scanned.

** Server and Client libraries

*/
#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>

#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x3F, 16, 2);
#define RST_PIN D3
#define SS_PIN D4
MFRC522 mfrc522(SS_PIN, RST_PIN);

// --------------------------WiFi Credentials--------------------------------//
#define WIFI_SSID "vivo Y21G"
#define WIFI_PASS "password"
WiFiClient wifi;

void setup()
{

  Serial.begin(115200); // Initialize serial communications with the PC
  Serial.print("Connecting to WiFi: " + String(WIFI_SSID) + " ... ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("connected");
  SPI.begin();                       // Init SPI bus
  mfrc522.PCD_Init();                // Init MFRC522
  delay(4);                          // Optional delay. Some boards may need more time after init to be ready,
  mfrc522.PCD_DumpVersionToSerial(); // Show details of PCD - MFRC522 Card Reader details
}
/**
 * This function is the main loop of the program. It checks if a new RFID card is present, reads the card's serial number, and sends a request to a server to validate the user. If the request is successful, it processes the response and performs actions based on the result. If the request fails, it handles the failure scenario. The function waits for 1 second before the next scan.
 *
 * @throws None
 */
void loop()
{
  lcd.print("Scan Your Card");

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

  http.begin(client, "https://iotclubbackend.gurkirat7092.repl.co/api/post/validateUser"); // Specify the request destination and give it wifi object

  http.addHeader("Content-Type", "application/json"); // Specify content type
  DynamicJsonDocument doc(1024);                      // DynamicJsonDocument object instance
  doc["UID"] = content;                               // Add the UID to the JSON document

  String json;                    // String for storing the JSON document
  serializeJson(doc, json);       // Serialize the JSON document to a string
  int httpCode = http.POST(json); // Send the request

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

    String userName = responseDoc["userName"];     // "may exist" or may be null
    String UID = responseDoc["UID"];               // "may exist" or may be null
    String userType = responseDoc["userType"];     // "may exist" or may be null
    String userRollNo = responseDoc["userRollNo"]; // "may exist" or may be null
    String email = responseDoc["email"];           // "may exist" or may be null
    String timestamp = responseDoc["timestamp"];   // "may exist" or may be null
    String code = responseDoc["code"];             // "may exist" or may be null
    String userTeam = responseDoc["userTeam"];     // "may exist" or may be null

    if (permissionToUnlock) // if permissionToUnlock is true
    {
      lcd.print(userName);
      Serial.println(userName); // Printing the user name because now we are sure it exists
      Serial.println("Unlocking");
      // Do something (oled ,button , unlock door,logic here )
    }
    else
    {
      lcd.print("Denied");
      Serial.println("Denied");
      // Handle the denied access scenario (print error on oled screen or whatever you want to do)
    }
    delay(5000);
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
