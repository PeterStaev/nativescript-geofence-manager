/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import { Application } from "@nativescript/core";

import { GeofenceManager, RegionChangedEventData } from "nativescript-geofence-manager";

GeofenceManager.on(GeofenceManager.enterRegionEvent, (args: RegionChangedEventData) => {
    console.log("GeofenceManager.enterRegionEvent", args.region.identifier);
});

GeofenceManager.on(GeofenceManager.exitRegionEvent, (args: RegionChangedEventData) => {
    console.log("GeofenceManager.exitRegionEvent", args.region.identifier);
});


Application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
