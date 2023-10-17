// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, memo } from "react";
import { View, Text, useTheme } from "@aws-amplify/ui-react";
import { Marker, Popup } from "react-map-gl";
import Pin from "./Pin";

const Markers = (props) => {
  const [popupInfo, setPopupInfo] = useState();
  const tp = props.trackerPositions;
  const ts = props.trackerStatus;

  const handleClick = ({ name, longitude, latitude, time, status, detail }) => {
    if (popupInfo) return;
    setPopupInfo({
      name,
      longitude,
      latitude,
      time,
      status,
      detail,
    });
  };

  return (
    <>
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          offset={[0, -40]}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
        >
          <View padding="10px 10px">
            <Text>Name: {popupInfo.name}</Text>
            <Text>Time: {popupInfo.time}</Text>
            <Text>Lat: {popupInfo.latitude}</Text>
            <Text>Lon: {popupInfo.longitude}</Text>
            <Text>Status: {popupInfo.status}</Text>
            <Text>Detail: {popupInfo.detail}</Text>
          </View>
        </Popup>
      )}
      {Object.keys(props.trackerPositions).map((trackerId) => (
        <Marker
          key={tp[trackerId].deviceId}
          longitude={tp[trackerId].location.long}
          latitude={tp[trackerId].location.lat}
          time={tp[trackerId].timestamp}
        >
          <Pin
            onClick={() =>
              handleClick({
                name: tp[trackerId].deviceId,
                longitude: tp[trackerId].location.long,
                latitude: tp[trackerId].location.lat,
                time: new Date(tp[trackerId].timestamp).toISOString(),
                status: ts[trackerId].eventType,
                detail: ts[trackerId].disconnectReason,
              })
            }
            color={
              ts[trackerId].eventType === undefined
                ? ""
                : ts[trackerId].eventType === "disconnected"
                ? "tomato"
                : "deepskyblue"
            }
          />
        </Marker>
      ))}
    </>
  );
};

export default memo(Markers);
