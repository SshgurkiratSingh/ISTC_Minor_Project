#include <Arduino.h>
#include <NewPing.h>
#include <PubSubClient.h>
#include <WiFi.h>
/*
## ESP32 ULTRASONIC DISTANCE RANGE CONTROL 
Path Will be named in this format
1. Alpha Avenue,
2. Rangers Route,
3. Bravo Boulevard,
4. Charlie Lane,
*/
// -----------# For direction Alpha Avenue #----------- //
NewPing Alpha(23,22, 200);
#define ALPHA_TOTAL_SIZE 200

// -----------# For direction Rangers Route #----------- //
NewPing Rangers(18,5, 200);
#define RANGERS_TOTAL_SIZE 200

// -----------# For direction Bravo Boulevard #----------- //
NewPing Bravo(34,35, 200);
#define BRAVO_TOTAL_SIZE 200

// -----------# For direction Charlie Lane #----------- //
NewPing Charlie(25,26, 200);
#define CHARLIE_TOTAL_SIZE 200

// -----------# LED CONFIGURATION #----------- //
uint8_t currentValue[8] = {0,0,0,0,0,0,0,0};
uint8_t ledPins[8] = {21,19,4,2,32,33,27,14};
uint8_t DISTANCE_TO_TRIGGER[8] = {ALPHA_TOTAL_SIZE,ALPHA_TOTAL_SIZE/2,RANGERS_TOTAL_SIZE,RANGERS_TOTAL_SIZE/2,BRAVO_TOTAL_SIZE,BRAVO_TOTAL_SIZE/2,CHARLIE_TOTAL_SIZE,CHARLIE_TOTAL_SIZE/2};
u_int8_t CURRENT_DISTANCE[8] = {0,0,0,0,0,0,0,0};

//--------------------- MQTT CONFIGURATION -----------------------//
#define MAX_TOPIC 7
const String Topic_TO_Subscribe[MAX_TOPIC] = {
    "IoT/lawn/light1",
    "IoT/lawn/light2",
    "IoT/lawn/light3",
    "IoT/lawn/light4",
    "IoT/lawn/brightness1",
    "IoT/lawn/brightness2",
    "IoT/lawn/autonomousLighting",
};
int ValueOfSubScribedTopic[MAX_TOPIC] = {1, 1, 1, 1, 100, 50, 1};
const char *mqtt_server = "ec2-35-170-242-83.compute-1.amazonaws.com";
//----------------------------Wifi Config --------------------------------
char SSID[15] = "ConForNode1";
char PASSWORD[15] = "12345678";
// --------------------------Instances ------------------------------------
WiFiClient wifi;
PubSubClient client(wifi);
#define DEBUG_MODE 1


/**
 * Refreshes the current distance measurements from multiple sensors and updates the CURRENT_DISTANCE array. 
 * 
 * No parameters.
 * 
 * No return value.
 * 
 * No potential errors.
 */
void RefreshCurrentDistance(){
CURRENT_DISTANCE[0] = Alpha.ping_cm();
CURRENT_DISTANCE[1] = Alpha.ping_cm();
Serial.printf("Alpha Distance %d \n" ,CURRENT_DISTANCE[0]);
CURRENT_DISTANCE[2] = Rangers.ping_cm();
CURRENT_DISTANCE[3] = Rangers.ping_cm();
Serial.printf("Rangers Distance %d \n",CURRENT_DISTANCE[2]);
CURRENT_DISTANCE[4] = Bravo.ping_cm();
CURRENT_DISTANCE[5] = Bravo.ping_cm();
Serial.printf("Bravo Distance %d \n",CURRENT_DISTANCE[4]);
CURRENT_DISTANCE[6] = Charlie.ping_cm();
CURRENT_DISTANCE[7] = Charlie.ping_cm();
Serial.printf("Charlie Distance %d \n",CURRENT_DISTANCE[6]);
}
/**
 * Refreshes the output by writing current values to the LED pins.
 *
 */
void RefreshOutput(){
  for (int i = 0; i < 8; i++) {
    analogWrite(ledPins[i],currentValue[i]);
  }
}
/**
 * A callback function that handles incoming messages from a subscribed topic.
 *
 * @param topic The topic of the incoming message.
 * @param payload The payload of the incoming message.
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
  for (int i = 0; i < MAX_TOPIC; i++)
  {
    if (String(Topic_TO_Subscribe[i]) == String(topic))
    {

      // For topics that can have other values
      ValueOfSubScribedTopic[i] = message.toInt();
      break;
    }
  }
}


/**
 * Initializes the setup for the program, including connecting to WiFi, setting up the MQTT client,
 * and declaring LED pins as outputs.
 *
 */
void setup() {
Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
 uint8_t i = 0;
    while (WiFi.status() != WL_CONNECTED)
    {

#if DEBUG_MODE
        Serial.println("Connecting to WiFi..");
#endif
     
        delay(1000);
        i++;
        if (i > 12)
        {
            break;
        }
    }

  // Serial.println("Connected to the WiFi network");
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  if (client.connect("lawnNode"))
  {

#if DEBUG_MODE
    Serial.println("connected");
#endif
    for (int i = 0; i < MAX_TOPIC; i++)
    {
#if DEBUG_MODE
      Serial.print("Subscribing to: ");
      Serial.println(Topic_TO_Subscribe[i]);
#endif
      client.subscribe((Topic_TO_Subscribe[i]).c_str());
    }
  }
  // declare led pins as outputs
  for (int i = 0; i < 3; i++)
  {
    pinMode(ledPins[i], OUTPUT);
  }
}
void MakeDecision(){
  if (CURRENT_DISTANCE[0]
}

void loop() {
 
}

