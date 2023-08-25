# NativeScript Geofence Manager

A NativeScript plugin to work with Geofences

## Installation

Run the following command from the root of your project:

`tns plugin add nativescript-geofence-manager`

This command automatically installs the necessary files, as well as stores nativescript-geofence-manager as a dependency in your project's package.json file.

## API

### Events
* **enterRegion**  
Triggered when the the device reports that it enters a geofence region. 

* **exitRegion**  
Triggered when the the device reports that it exists a geofence region. 

### Instance Properties
* **enterRegionEvent** - *string*  
String value used when hooking to enterRegion event.

* **exitRegionEvent** - *string*  
String value used when hooking to exitRegion event.

* **activeGeofenceIds** - *string[]*  
Gets the currently active Geofence IDs.

### Methods 
* **canMonitor(): boolean**  
Return if the device currently is capable of monitoring geofences.

* **startMonitoringRegion(region: CircularRegion): void**  
Starts monitoring the geofence defined by given circular region. 

* **stopMonitoringRegion(identifier: string): void**  
Stops monitoring the given geofence id. 

* **stopMonitoringAllRegions(): void**  
Stops monitoring all geofences defined by the app. 

## Usage (Core)

You need to import the geofence manager in the start up file for the app. This setups the needed native event listeners.  
It is recommended to also subscribe to the manager's events in the main app file to ensure that when the device is awaken by the OS you will receive the notification. Note that this has to be done before calling `run()` for your app

```ts
import { GeofenceManager, RegionChangedEventData } from "nativescript-geofence-manager";

GeofenceManager.on(GeofenceManager.enterRegionEvent, (args: RegionChangedEventData) => {
    console.log("GeofenceManager.enterRegionEvent", args.region.identifier);
});

GeofenceManager.on(GeofenceManager.exitRegionEvent, (args: RegionChangedEventData) => {
    console.log("GeofenceManager.exitRegionEvent", args.region.identifier);
});

Application.run({ moduleName: "app-root" });
```

In order to receive event notifications even when the app is in the background you need to request always location usage permissions. This has some caveats deppending on what platform and for android even on what SDK version is your app running. You can check the code of the demo app to see what I found to work best, but you can change this to better suit your needs as needed. 

In order to start monitoring for a given region you can simply call the `startMonitoring` method and pass the circular region you want to monitor as well as if you want to monitor enter, exit, or both events. The `identifier` must be unique as if you call a second time `startMonitoringRegion` with the same `identifier` it will simply edit previous region. 
```ts
import { GeofenceManager } from "nativescript-geofence-manager";

GeofenceManager.startMonitoringRegion({
    identifier: "Apple HQ",
    center: { latitude: 37.330551, longitude: -122.030583 },
    radius: 30,
    notifyOnEntry: true,
    notifyOnExit: true,
});
```

Once you are no longer intereseted in a region remember to call `stopMonitoringRegion`
```ts
GeofenceManager.stopMonitoringRegion("Apple HQ");
```

## Usage in other NativeScript flavors (Angular, Vue, etc.)

Currently the plugin has not been tested nor made to support other NS flavors, since I'm not actively using those. If you are such a dev, I'm happily accepting PRs to support all the NS flavors ot there :)

## Caveats
* Each platform has different limitations to maximum allowed geofences. For iOS this 20 while for android this is 100. Once that number is reached calls to `startMonitoringRegion` will stop adding further geofences. 
* Testing for android in emulator is supbar. Although you can define a route and start it, seems location isn't updated correctly. The only way I managed to get it working is to start the route AND open Google Maps on the device. This seems to be forcing the emulator to crrectly report position and trigger the events. 

## License

Apache License Version 2.0, January 2004
