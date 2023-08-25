import { Device } from "@nativescript/core";
import * as geolocation from "@nativescript/geolocation";

import { GeofenceManager } from "nativescript-geofence-manager";
import * as permissions from "nativescript-permissions";

const GEOFENCE_ID = "Apple HQ";

export async function onRequestPermissions() {
    try {
        if (global.isIOS) {
            await geolocation.enableLocationRequest(false, true);
            await geolocation.enableLocationRequest(true, true);
        }

        if (global.isAndroid) {
            if (+Device.sdkVersion <= 29) {
                await geolocation.enableLocationRequest(true, true);
            }
            else {
                // For Android 30+ we need to first reuqest standard location tracking permission and only then the always location tracking permission
                await geolocation.enableLocationRequest(false, true);

                if (!permissions.hasPermission(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION)) {
                    await geolocation.enableLocationRequest(true, true);
                }
            }
        }
    }
    catch (e) {
        console.error(e);
        return;
    }
}

export function onStartMonitoring() {
    GeofenceManager.startMonitoringRegion({
        identifier: GEOFENCE_ID,
        center: { latitude: 37.330551, longitude: -122.030583 },
        radius: 30,
        notifyOnEntry: true,
        notifyOnExit: true,
    });
}

export function onStopMonitoring() {
    GeofenceManager.stopMonitoringRegion(GEOFENCE_ID);
}
