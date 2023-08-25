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
class GeofenceManagerImpl extends Observable {
    public readonly enterRegionEvent;
    public readonly exitRegionEvent;

    public get activeGeofenceIds(): string[];

    public canMonitor(): boolean;
    public startMonitoringRegion(region: CircularRegion): void;
    public stopMonitoringRegion(identifier: string): void;
    public stopMonitoringAllRegions(): void;

    public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    // eslint-disable-next-line no-dupe-class-members
    public on(event: "enterRegion" | "exitRegion", callback: (args: RegionChangedEventData) => void, thisArg?: any);
}


export interface CircularRegion {
    identifier: string;
    center: { latitude: number, longitude: number };
    radius: number;
    notifyOnEntry: boolean;
    notifyOnExit: boolean;
}

export interface RegionChangedEventData extends EventData {
    region: CircularRegion;
}

export const GeofenceManager: GeofenceManagerImpl;