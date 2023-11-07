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
import {
    Application,
    Device,
    Utils,
} from "@nativescript/core";

import * as permissions from "nativescript-permissions";

import { CircularRegion } from ".";
import { GeofenceManager as GeofenceManagerBase } from "./geofence-manager-common";

@NativeClass()
@JavaProxy("com.tangrainc.GeofenceBroadcastReceiver")
class GeofenceLocationListener extends android.content.BroadcastReceiver {
    public onReceive(context: android.content.Context, intent: android.content.Intent) {
        const geofencingEvent = com.google.android.gms.location.GeofencingEvent.fromIntent(intent);

        if (geofencingEvent.hasError()) {
            console.error(geofencingEvent.getErrorCode(), com.google.android.gms.location.GeofenceStatusCodes.getStatusCodeString(geofencingEvent.getErrorCode()));
            return;
        }

        const geofenceTransition = geofencingEvent.getGeofenceTransition();
        const triggeringGeofences = geofencingEvent.getTriggeringGeofences();
        for (let loop = 0; loop < triggeringGeofences.size(); loop++) {
            const geofence: com.google.android.gms.location.Geofence = triggeringGeofences.get(loop);
            const transitionTypes = geofence.getTransitionTypes();
            const region: CircularRegion = {
                identifier: geofence.getRequestId(),
                center: {
                    latitude: geofence.getLatitude(),
                    longitude: geofence.getLongitude(),
                },
                radius: geofence.getRadius(),
                // eslint-disable-next-line no-bitwise
                notifyOnEntry: !!(transitionTypes & com.google.android.gms.location.Geofence.GEOFENCE_TRANSITION_ENTER),
                // eslint-disable-next-line no-bitwise
                notifyOnExit: !!(transitionTypes & com.google.android.gms.location.Geofence.GEOFENCE_TRANSITION_EXIT),
            };

            if (geofenceTransition === com.google.android.gms.location.Geofence.GEOFENCE_TRANSITION_ENTER) {
                GeofenceManager.notify({
                    eventName: GeofenceManager.enterRegionEvent,
                    object: GeofenceManager,
                    region,
                });
            }

            if (geofenceTransition === com.google.android.gms.location.Geofence.GEOFENCE_TRANSITION_EXIT) {
                GeofenceManager.notify({
                    eventName: GeofenceManager.exitRegionEvent,
                    object: GeofenceManager,
                    region,
                });
            }
        }
    }
}

class GeofenceManagerImpl extends GeofenceManagerBase {
    private geofencingClient: com.google.android.gms.location.GeofencingClient;
    private geofencePendingIntent: android.app.PendingIntent;

    constructor() {
        super();

        Application.on(Application.launchEvent, () => {
            this.geofencingClient = com.google.android.gms.location.LocationServices.getGeofencingClient(Utils.android.getApplicationContext());

            const intent = new android.content.Intent(Utils.android.getApplicationContext(), GeofenceLocationListener.class);
            this.geofencePendingIntent = android.app.PendingIntent.getBroadcast(
                Utils.android.getApplicationContext(),
                0,
                intent,
                // eslint-disable-next-line no-bitwise
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | (+Device.sdkVersion >= 31 ? android.app.PendingIntent.FLAG_MUTABLE : 0),
            );
        });
    }

    public canMonitor(): boolean {
        return permissions.hasPermission(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION);
    }

    public startMonitoringRegion(region: CircularRegion) {
        // Android only supports 100 geofences at a time
        if (this.activeGeofenceIds.length === 100) {
            return;
        }

        let transitionTypes = 0;
        if (region.notifyOnEntry) {
            // eslint-disable-next-line no-bitwise
            transitionTypes |= com.google.android.gms.location.Geofence.GEOFENCE_TRANSITION_ENTER;
        }
        if (region.notifyOnExit) {
            // eslint-disable-next-line no-bitwise
            transitionTypes |= com.google.android.gms.location.Geofence.GEOFENCE_TRANSITION_EXIT;
        }

        const geofenceRegion = new com.google.android.gms.location.Geofence.Builder()
            .setRequestId(region.identifier)
            .setCircularRegion(region.center.latitude, region.center.longitude, region.radius)
            .setExpirationDuration(com.google.android.gms.location.Geofence.NEVER_EXPIRE)
            .setTransitionTypes(transitionTypes)
            .build();

        const geofenceRequest = new com.google.android.gms.location.GeofencingRequest.Builder()
            .setInitialTrigger(com.google.android.gms.location.GeofencingRequest.INITIAL_TRIGGER_DWELL)
            .addGeofences(java.util.Arrays.asList([geofenceRegion]))
            .build();

        // Start monitoring
        this.geofencingClient.addGeofences(geofenceRequest, this.geofencePendingIntent)
            .addOnFailureListener(new com.google.android.gms.tasks.OnFailureListener({
                onFailure: (e) => {
                    console.error("Error adding geofence: " + e.getMessage());
                },
            }));

        this.activeGeofenceIds = [...this.activeGeofenceIds, region.identifier];
    }

    public stopMonitoringRegion(identifier: string) {
        this.geofencingClient.removeGeofences(java.util.Arrays.asList([identifier]))
            .addOnFailureListener(new com.google.android.gms.tasks.OnFailureListener({
                onFailure: (e) => {
                    console.error("Error removing geofence: " + e.getMessage());
                },
            }));

        this.activeGeofenceIds = this.activeGeofenceIds.filter((id) => id !== identifier);
    }

    public stopMonitoringAllRegions() {
        this.geofencingClient.removeGeofences(java.util.Arrays.asList(this.activeGeofenceIds))
            .addOnFailureListener(new com.google.android.gms.tasks.OnFailureListener({
                onFailure: (e) => {
                    console.error("Error removing geofence: " + e.getMessage());
                },
            }));

        this.activeGeofenceIds = [];
    }
}

export const GeofenceManager = new GeofenceManagerImpl();