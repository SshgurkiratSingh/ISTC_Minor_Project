#include <Arduino.h>
#include <DHTesp.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>


#define TRIGGER_PIN  4
#define ECHO_PIN     2
#define MAX_DISTANCE 20
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);
#define TANK_SIZE 18

const uint8_t touch_Pins[6] = {
  32,33,27,14,12,13
};
const String topics_To_Control[6]={
  "IoT/kitchen/light1","IoT/kitchen/light2","IoT/kitchen/switchBoard1","IoT/auxilary/pump1","IoT/washroom/light1","IoT/washroom/gyser"
};
const char *mqtt_server = "ec2-35-170-242-83.compute-1.amazonaws.com";

const u_int8_t pin_To_Control[6]={23,22,21,19,18,5};
bool status[6]={0,0,0,0,0,0};
WiFiClient wifi;
PubSubClient client(wifi);
DHTesp dht;
#define DEBUG_MODE 1
#define SSID "ConForNode1"
#define PASSWORD "12345678"
/**
 * A callback function that handles incoming messages.
 *
 * @param topic A pointer to the topic of the message.
 * @param payload A pointer to the payload of the message.
 * @param length The length of the payload.
 *
 * @return void
 *
 * @throws None
 */
int waterLevel = 0;
void updateWaterLevel() {
  int distanceToWater = sonar.ping_cm();
  int waterDepth = TANK_SIZE - distanceToWater;
  waterLevel = (waterDepth * 100) / TANK_SIZE;
}
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
    for (int i = 0; i < 6; i++)
    {
        if (String(topics_To_Control[i]) == String(topic))
        {
        
    
                status[i] = message.toInt();
                
            }
            break;
        }
    }
/**
 * Refreshes the output by setting the values of the pins to the corresponding status.
 *
 * @throws ErrorType description of error
 */
void refreshOutput(){
    for (int i = 0; i < 6; i++){
      digitalWrite(pin_To_Control[i], status[i]);
    }
}
void setup() {   
 Serial.begin(115200);
 dht.setup(15, DHTesp::DHT22);
     WiFi.begin(SSID, PASSWORD);
     client.setServer(mqtt_server, 1883);
    client.setCallback(callback);

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
        if (client.connect("xxmqtt"))
    {

#if DEBUG_MODE
        Serial.println("connected");
#endif
        for (int i = 0; i < 6; i++)
        {
#if DEBUG_MODE
            Serial.print("Subscribing to: ");
            Serial.println(topics_To_Control[i]);
#endif
            client.subscribe(topics_To_Control[i].c_str());
        }
    }
    else
    {
#if DEBUG_MODE
        Serial.println("failed, rc=" + client.state());
#endif
    }
for (int i = 0; i < 6; i++){
  pinMode(pin_To_Control[i], OUTPUT);
}
refreshOutput();

}
float temp = 0;
float hum = 0;
/**
 * Updates the temperature and humidity values.
 *
 * @return void
 *
 * @throws none
 */
void updateTempHum()
{
    float t = dht.getTemperature();
    float h = dht.getHumidity();

    if (isnan(t) || isnan(h) || t == 0 || h == 0)
    {
        return;
    }
    else
    {

        if ((temp != t) || (hum != h))
        {
            temp = t;
            hum = h;
            Serial.println("update detected");
            
            client.publish("IoT/kitchen/temperature", String(temp).c_str(), true);
            client.publish("IoT/kitchen/humidity", String(hum).c_str(), true);
            client.publish("IoT/auxiliary/tankLevel", String(waterLevel).c_str(), true);
        }
    }
}
/**
 * Checks and updates the button.
 *
 * @throws ErrorType description of error
 */
void checkAndUpdateButton(){
    for (int i = 0; i < 6; i++){
      if (touchRead(touch_Pins[i]) <30){
        status[i] = !status[i];
        client.publish(topics_To_Control[i].c_str(), String(status[i]).c_str(), true);
      }
    }
}

/**
 * The loop function is responsible for executing a continuous loop in the program.
 * It calls the checkAndUpdateButton function, which checks the status of a button and updates it accordingly.
 * It also calls the client.loop function, which handles the client's network communication and waits for incoming messages.
 * The delay function is used to pause the execution for 200 milliseconds.
 * Finally, the updateTempHum function is called to update the temperature and humidity readings.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void loop() {
checkAndUpdateButton();
    refreshOutput();
client.loop();
delay(200);
updateTempHum();
updateWaterLevel();

}

