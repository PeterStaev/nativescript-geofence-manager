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
    ApplicationSettings,
    EventData,
    Observable,
} from "@nativescript/core";

import { CircularRegion, RegionChangedEventData } from ".";

export abstract class GeofenceManager extends Observable {
    public readonly enterRegionEvent = "enterRegion";
    public readonly exitRegionEvent = "exitRegion";

    public get activeGeofenceIds(): string[] { return ApplicationSettings.getString("GeofenceManager.activeGeofenceIds", "").split(","); }
    protected set activeGeofenceIds(val: string[]) { ApplicationSettings.setString("GeofenceManager.activeGeofenceIds", val.join(",")); }

    public abstract canMonitor(): boolean;
    public abstract startMonitoringRegion(region: CircularRegion): void;
    public abstract stopMonitoringRegion(identifier: string): void;
    public abstract stopMonitoringAllRegions(): void;
}

// eslint-disable-next-line no-redeclare
export interface GeofenceManager {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "enterRegion" | "exitRegion", callback: (args: RegionChangedEventData) => void, thisArg?: any);
}