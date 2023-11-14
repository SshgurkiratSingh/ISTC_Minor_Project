#include <ArduinoJson.h>

class ConfigManager
{
public:
    ConfigManager(const char *filePath);
    bool loadConfiguration();
    void saveConfiguration(const char *ssid, const char *password);
    void checkForConfigThroughUART();

private:
    const char *configFilePath;
    char SSID[32];
    char PASSWORD[64];
};
