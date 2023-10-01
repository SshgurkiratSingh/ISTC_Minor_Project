#!/bin/bash

# MQTT broker address
MQTT_BROKER="ec2-3-88-49-62.compute-1.amazonaws.com"

# List of topics
TOPICS=(
    "IoT/room1/light1"
    "IoT/room1/light2"
    "IoT/room1/temperature"
    "IoT/room1/humidity"
    "IoT/room1/fan1"
    "IoT/room1/fan2"
    "IoT/room1/brightness"
    "IoT/room2/light1"
    "IoT/room2/light2"
    "IoT/room2/temperature"
    "IoT/room2/humidity"
    "IoT/room2/fan1"
    "IoT/room2/brigtness1"
    "IoT/garage/light1"
    "IoT/garage/light2"
    "IoT/garage/door"
    "IoT/garage/occupancy"
    "IoT/kitchen/light1"
    "IoT/kitchen/light2"
    "IoT/kitchen/temperature"
    "IoT/kitchen/humidity"
    "IoT/kitchen/fan1"
    "IoT/kitchen/airQuality"
    "IoT/entrance/door"
    "IoT/entrance/light1"
    "IoT/entrance/light2"
    "IoT/entrance/rainCheck"
    "IoT/entrance/lightIntensity"
    "IoT/entrance/temperature"
    "IoT/hall/light1"
    "IoT/hall/light2"
    "IoT/hall/ambientLight"
    "IoT/hall/TV"
    "IoT/hall/fan1"
    "IoT/hall/light3"
    "IoT/hall/light4"
    "IoT/hall/temperature"
    "IoT/hall/humidity"
    "IoT/room2/brigtness1"
    "IoT/auxiliary/tankLevel"
    "IoT/lawn/soilMoisture"
    "IoT/lawn/light1"
    "IoT/lawn/light2"
    "IoT/lawn/light3"
    "IoT/lawn/light4"
    "IoT/lawn/ambientLight"
    "IoT/hall/switchBoard1"
    "IoT/hall/switchBoard2"
    "IoT/kitchen/switchBoard1"
    "IoT/lawn/disengageIndruderDetector"
    "IoT/lawn/autonomousMode"
    "IoT/lawn/autonomousLighting"
    "IoT/lawn/airQuality"
    "IoT/lawn/temperature"
    "IoT/lawn/humidity"
    "IoT/washroom/light1"
    "IoT/store/light1"
    "IoT/store/fireIndicator"
    "IoT/store/light2"
    "IoT/garage/light1"
    "IoT/garage/light2"
    "IoT/garage/door"
    "IoT/garage/occupancy"
    "IoT/washroom/gyser"

)

# Loop through topics and publish random values
for topic in "${TOPICS[@]}"; do
    case "$topic" in
    *"light"*)
        random_value=$(shuf -i 0-1 -n 1) # Generate random 0 or 1 for lights
        ;;
    *"temperature"*)
        random_value=$(shuf -i 0-50 -n 1) # Generate random value between 0 and 100 for temperature
        ;;
    *"fan"*)
        random_value=$(shuf -i 0-10 -n 1) # Generate random value between 0 and 10 for fans
        ;;
    *"humidity"*)
        random_value=$(shuf -i 0-100 -n 1) # Generate random value between 0 and 100 for humidity
        ;;
    *"brightness"*)
        random_value=$(shuf -i 0-100 -n 1) # Generate random value between 0 and 100 for brightness
        ;;

    *)
        random_value=$(shuf -i 0-1 -n 1) # Default to 0 for other topics
        ;;

    esac

    mosquitto_pub -h "$MQTT_BROKER" -t "$topic" -m "$random_value" -r
    echo "Published to $topic: $random_value"
done
