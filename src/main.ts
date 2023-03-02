import sdk, { DeviceProvider, ScryptedDeviceBase, ScryptedDeviceType, ScryptedInterface, Setting, Settings, SettingValue, OnOff } from '@scrypted/sdk';
import axios from 'axios';

class StatusDevice extends ScryptedDeviceBase implements OnOff {

    constructor(nativeId: string) {
        super(nativeId);
        this.on = this.on || false;        
    }

    async turnOff(): Promise<void> {
        this.on = false;
    }

    async turnOn(): Promise<void> {
        this.on = true;
    }

}

class SolarDeviceProvider extends ScryptedDeviceBase implements Settings, DeviceProvider {

    devices = new Map<string, StatusDevice>();
    timer: NodeJS.Timer;

    constructor(nativeId?: string) {
        super(nativeId);
        this.prepareDevices();
        this.timer = setInterval(() => this.update(), 10000);
    }

    async update() {
        const avg = await axios.get('http://192.168.50.89:5000/average/5');
        if (avg.status !== 200) return;
        const last = await axios.get('http://192.168.50.89:5000/last');
        if (last.status !== 200) return;
        const exportDev = this.devices.get('export');
        if (!exportDev) return;
        if (exportDev.on) {
            if (!last.data.export || avg.data.meter < 500) {
                this.console.log('not exporting anymore');
                exportDev.turnOff();
            }
        }
        else {
            if (last.data.export && avg.data.meter > 500) {
                this.console.log('exporting more than 500W');
                exportDev.turnOn();
            }
        }
        const inportDev = this.devices.get('import');
        if (!inportDev) return;
        if (inportDev.on) {
            if (!last.data.import || avg.data.meter > -500) {
                this.console.log('not importing anymore');
                inportDev.turnOff();
            }
        }
        else {
            if (last.data.import && avg.data.meter < -500) {
                this.console.log('importing more than 500W');
                inportDev.turnOn();
            }
        }
    }

    async getSettings(): Promise<Setting[]> {
        return [
            {
                key: 'interval',
                title: 'Update Interval',
                description: 'Query interval in seconds',
                value: this.storage.getItem('interval') || '10',
                placeholder: '10',
            }
        ]
    }

    async putSetting(key: string, value: SettingValue): Promise<void> {
        this.storage.setItem(key, value.toString());
    }

    async prepareDevices() {
        await sdk.deviceManager.onDevicesChanged({
            devices: [
                {
                    nativeId: 'export',
                    name: 'Exporting',
                    type: ScryptedDeviceType.Switch,
                    interfaces: [ ScryptedInterface.OnOff ]
                },
                {
                    nativeId: 'import',
                    name: 'Importing',
                    type: ScryptedDeviceType.Switch,
                    interfaces: [ ScryptedInterface.OnOff ]
                }
            ]
        });
    }

    async getDevice(nativeId: string) {
        let ret = this.devices.get(nativeId);
        if (!ret) {
            if (nativeId === 'export' || nativeId === 'import')
                ret = new StatusDevice(nativeId);
            if (ret) this.devices.set(nativeId, ret);
        }
        return ret;
    }

    async releaseDevice(id: string, nativeId: string): Promise<void> {
        
    }

}

export default SolarDeviceProvider;
