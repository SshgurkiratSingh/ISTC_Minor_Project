const mainPageConfig = [
    {
      "roomName": "Room 1",
      "roomId": 1,
      "roomTag": "room1",
      "noOfFans": 1,
      "noOfLights": 2,
      "noOfSwitchBoards": 1,
      "noOfBrightness": 1,
      "tempAndHum": true,
      "airQuality": false,
      "isTvPresent": false,
      "isCustomPresent": false,
      "customData": []
    },
    {
      "roomName": "Room 2",
      "roomId": 2,
      "roomTag": "room2",
      "noOfFans": 1,
      "noOfLights": 2,
      "noOfSwitchBoards": 1,
      "noOfBrightness": 1,
      "tempAndHum": true,
      "airQuality": false,
      "isTvPresent": false,
      "isCustomPresent": false,
      "customData": []
    },
    {
      "roomName": "Kitchen",
      "roomId": 2,
      "roomTag": "kitchen",
      "noOfFans": 1,
      "noOfLights": 2,
      "noOfSwitchBoards": 1,
      "noOfBrightness": 1,
      "tempAndHum": true,
      "airQuality": true,
      "isTvPresent": false,
      "isCustomPresent": false,
      "customData": []
    },
    {
      "roomName": "Hall",
      "roomId": 3,
      "roomTag": "hall",
      "noOfFans": 2,
      "noOfLights": 3,
      "noOfSwitchBoards": 1,
      "noOfBrightness": 0,
      "tempAndHum": true,
      "airQuality": false,
      "isTvPresent": true,
      "isCustomPresent": true,
      "customData": [{
        "topic": "IoT/hall/ambientLight",
        "subTitle": "Ambient Light",
        "identity": "Ambient Light",
        "slideVersion": true
      }]
    },
    {
      "roomName": "Lawn",
      "roomId": 5,
      "roomTag": "lawn",
      "noOfFans": 0,
      "noOfLights": 4,
      "noOfSwitchBoards": 0,
      "noOfBrightness": 2,
      "tempAndHum": true,
      "airQuality": true,
      "isTvPresent": false,
      "isCustomPresent": true,
      "customData": [
        {
          "topic": "IoT/lawn/pump1",
          "subTitle": "Lawn Pump 1",
          "identity": "Lawn Pump 1"
        },
        {
          "topic": "IoT/lawn/autonomousLighting",
          "subTitle": "AutoLumus",
          "identity": "Lawn Autonomous Lighting",
         
        }
      ]
    },
    {
      "roomName": "Garage Washroom Store",
      "roomId": 6,
      "roomTag": "garage",
      "noOfFans": 0,
      "noOfLights": 0,
      "noOfSwitchBoards": 0,
      "noOfBrightness": 1,
      "tempAndHum": false,
      "airQuality": false,
      "isTvPresent": false,
      "isCustomPresent": true,
      "customData": [
        {
          "topic": "IoT/garage/light1",
          "subTitle": "Garage Light 1",
          "identity": "Garage Light 1"
        },
        {
          "topic": "IoT/garage/light2",
          "subTitle": "Garage Light 2",
          "identity": "Garage Light 2"
        },
        {
          "topic": "IoT/store/light1",
          "subTitle": "Store Light 1",
          "identity": "Store Light 1"
        },
        {
          "topic": "IoT/store/light2",
          "subTitle": "Store Light 2",
          "identity": "Store Light 2"
        },
        {
          "topic": "IoT/washroom/light1",
          "subTitle": "Washroom Light 1",
          "identity": "Washroom Light 1"
        },
        {
          "topic": "IoT/washroom/gyser",
          "subTitle": "Washroom Gyser",
          "identity": "Washroom Gyser"
        }
      ]
    }
  ]
  export default mainPageConfig;