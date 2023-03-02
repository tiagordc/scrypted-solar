
# Scrypted Solar Plugin

This plugin provides solar power production and consumption data to HomeKit via the Scrypted.

I use a [custom script](https://github.com/tiagordc/hksun) to get data from my solar inverter over Modbus TCP.

In HomeKit, I have lights to indicate if I'm producing or consuming energy over the last 5 minutes.

## Installation

1. npm install
2. Open this plugin directory in VS Code.
3. npx scrypted login 192.168.50.89
4. Edit `.vscode/settings.json` to point to the IP address of your Scrypted server. 
5. Press Launch to start debugging

## References

 * [Scrypted](https://developer.scrypted.app/#creating-multiple-devices)
 * [Dummy Switch](https://github.com/koush/scrypted/blob/main/plugins/dummy-switch/src/main.ts)
 