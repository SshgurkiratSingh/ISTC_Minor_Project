#include "config.h"
#include <LittleFS.h>

ConfigManager::ConfigManager(const char *filePath) : configFilePath(filePath) {}

bool ConfigManager::loadConfiguration()
{
    // Your load logic here
}

void ConfigManager::saveConfiguration(const char *ssid, const char *password)
{
    // Your save logic here
}

void ConfigManager::checkForConfigThroughUART()
{
    // Your UART check logic here
}
