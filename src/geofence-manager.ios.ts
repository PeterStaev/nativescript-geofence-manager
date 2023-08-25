/* ! *****************************************************************************
Copyright (c) 2023 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
import { Application } from "@nativescript/core";

import { CircularRegion } from ".";
import { GeofenceManager as GeofenceManagerBase } from "./geofence-manager-common";

@NativeClass()
@ObjCClass(CLLocationManagerDelegate)
class GeofenceLocationListener extends NSObject implements CLLocationManagerDelegate {
    public locationManagerDidEnterRegion(manager: CLLocationManager, region: CLRegion): void {
        GeofenceManager.notify({
            eventName: GeofenceManager.enterRegionEvent,
            region: {
                identifier: region.identifier,
                center: {
                    latitude: region.center.latitude,
                    longitude: region.center.longitude,
                },
                radius: region.radius,
            },
        });
    }

    public locationManagerDidExitRegion(manager: CLLocationManager, region: CLRegion): void {
        GeofenceManager.notify({
            eventName: GeofenceManager.exitRegionEvent,
            region: {
                identifier: region.identifier,
                center: {
                    latitude: region.center.latitude,
                    longitude: region.center.longitude,
                },
                radius: region.radius,
            },
        });
    }
}

class GeofenceManagerImpl extends GeofenceManagerBase {
    private locationManager: CLLocationManager;
    private locationManagerDelegate: CLLocationManagerDelegate;

    constructor() {
        super();

        Application.on(Application.launchEvent, () => {
            this.locationManager = new CLLocationManager();
            this.locationManagerDelegate = GeofenceLocationListener.alloc().init();
            this.locationManager.delegate = this.locationManagerDelegate;
        });
    }

    public canMonitor(): boolean {
        return CLLocationManager.isMonitoringAvailableForClass(CLCircularRegion.class());
    }

    public startMonitoringRegion(region: CircularRegion) {
        // iOS allows a maximum of 20 regions to be monitored per app
        if (this.locationManager.monitoredRegions.count === 20) {
            return;
        }

        const geofenceRegion = CLCircularRegion.alloc().initCircularRegionWithCenterRadiusIdentifier(
            region.center,
            region.radius,
            region.identifier,
        );
        geofenceRegion.notifyOnEntry = region.notifyOnEntry;
        geofenceRegion.notifyOnExit = region.notifyOnExit;

        // Start monitoring
        this.locationManager.startMonitoringForRegion(geofenceRegion);

        this.activeGeofenceIds = [...this.activeGeofenceIds, region.identifier];
    }

    public stopMonitoringRegion(identifier: string) {
        const regions = this.locationManager.monitoredRegions.allObjects;

        for (let loop = 0; loop < regions.count; loop++) {
            const region = regions.objectAtIndex(loop);
            if (region.identifier === identifier) {
                this.locationManager.stopMonitoringForRegion(region);
                break;
            }
        }

        this.activeGeofenceIds = this.activeGeofenceIds.filter((id) => id !== identifier);
    }

    public stopMonitoringAllRegions() {
        const regions = this.locationManager.monitoredRegions.allObjects;

        for (let loop = 0; loop < regions.count; loop++) {
            const region = regions.objectAtIndex(loop);
            this.locationManager.stopMonitoringForRegion(region);
        }

        this.activeGeofenceIds = [];
    }
}

export const GeofenceManager = new GeofenceManagerImpl();

