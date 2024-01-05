#include <Arduino.h>
#include <DHTesp.h>
#include <WiFi.h>

const uint8_t touch_Pins[6] = {
  32,33,27,14,12,13
};
const String topics_To_Control[6]={
  "IoT/kitchen/light1","IoT/kitchen/light2","IoT/kitchen/switchBoard1","IoT/auxilary/pump1","IoT/washroom/light1","IoT/washroom/gyser"
};
const u_int8_t pin_To_Control[6]={23,22,21,19,18,5};
bool status[6]={0,0,0,0,0,0};
DHTesp dht;

void setup() {
  // put your setup code here, to run once:
  
}

void loop() {
  // put your main code here, to run repeatedly:
}

// put function void updateTempHum()
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
            Serial.println("updatte detected");
            needUpdate = true;
            client.publish("IoT/hall/temperature", String(temp).c_str(), true);
            client.publish("IoT/hall/humidity", String(hum).c_str(), true);
        }
    }
}
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
            Serial.println("updatte detected");
            needUpdate = true;
            client.publish("IoT/kitchen/temperature", String(temp).c_str(), true);
            client.publish("IoT/kitchen/humidity", String(hum).c_str(), true);
        }
    }
}
