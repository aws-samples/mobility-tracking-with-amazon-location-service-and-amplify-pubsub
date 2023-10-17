// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MapView } from "@aws-amplify/ui-react-geo";
import '@aws-amplify/ui-react-geo/styles.css';
import { NavigationControl } from "react-map-gl";
import Markers from "./components/Markers";

import { Amplify, PubSub } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub";

import { useState, useEffect } from "react";

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_endpoint: "wss://<IOT_CORE_ENDPOINT>/mqtt",
    clientId: "browser",
  })
);

function App() {
  const [trackerPositions, setTrackerPositions] = useState({});
  const [trackerStatus, setTrackerStatus] = useState({});

  const locationTopic = "iot/location";
  const connectedTopic = "$aws/events/presence/connected/+";
  const disconnectedTopic = "$aws/events/presence/disconnected/+";

  useEffect(() => {
    const locationSubscription = PubSub.subscribe(locationTopic).subscribe({
      next: (data) => {
        const deviceData = data.value;
        console.log("deviceData:", deviceData);
        setTrackerPositions((prev) => ({
          ...prev,
          [deviceData.deviceId]: deviceData,
        }));
      },
      error: (error) => console.error(error),
      complete: () => console.log("Done"),
    });

    const lifecycleSubscription = PubSub.subscribe([connectedTopic, disconnectedTopic]).subscribe({
      next: (data) => {
        const lceData = data.value;
        console.log("lceData:", lceData);
        setTrackerStatus((prev) => ({
          ...prev,
          [lceData.clientId]: lceData,
        }));
      },
      error: (error) => console.error(error),
      complete: () => console.log("Done"),
    });

    // Clean up the subscriptions when the component is unmounted.
    return () => {
      locationSubscription.unsubscribe();
      lifecycleSubscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <MapView
        initialViewState={{
          longitude: 139.75497613879122,
          latitude: 35.684366176216656,
          zoom: 14,
        }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <NavigationControl showCompass={true} />
        <Markers trackerPositions={trackerPositions} trackerStatus={trackerStatus}/>
      </MapView>
    </>
  );
}

export default App;
