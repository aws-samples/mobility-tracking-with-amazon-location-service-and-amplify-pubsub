// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Simulator from "./utils";

const IOT_CORE_TOPIC = "iot/location";
const IOT_CERT_SECRET_ID = "iot-cert-and-key";
const REGION = "ap-northeast-1";
const INTERVAL = 2;

const ROUTE_1 = [
  { lat: 35.68439798361399, long: 139.76044559362055 },
  { lat: 35.68724549485117, long: 139.7614681195722 },
  { lat: 35.68954715881722, long: 139.760533238701 },
  { lat: 35.690686101989755, long: 139.75682293024414 },
  { lat: 35.690448823503246, long: 139.7532294818938 },
];

const ROUTE_2 = [
  { lat: 35.68325895066084, long: 139.74420203848132 },
  { lat: 35.68050622055614, long: 139.745429069625 },
  { lat: 35.679034894831545, long: 139.74764941169434 },
  { lat: 35.67753981025764, long: 139.74934388327358 },
  { lat: 35.67761100539637, long: 139.75284968654103 },
  { lat: 35.677041442508354, long: 139.75518688871932 },
  { lat: 35.6783466847769, long: 139.75688136029856 },
  { lat: 35.68067233627224, long: 139.7582544665771 },
  { lat: 35.68257077703808, long: 139.75951071274915 },
  { lat: 35.68439798361399, long: 139.76044559362055 },
  { lat: 35.68724549485117, long: 139.7614681195722 },
];

const createSimulator = (clientId: string) =>
  new Simulator(clientId, IOT_CORE_TOPIC, IOT_CERT_SECRET_ID, REGION);

const sim1 = createSimulator("trackThing01");
const sim2 = createSimulator("trackThing02");

async function simulate(simulator: Simulator, route: any[]) {
    let currentIndex = 0;
  
    while (true) {
      const currentCoordinate = route[currentIndex];
      await simulator.publishUpdate(currentCoordinate);
      await new Promise((resolve) => setTimeout(resolve, INTERVAL * 1000));
      currentIndex = (currentIndex + 1) % route.length;
    }
}

simulate(sim1, ROUTE_1);
simulate(sim2, ROUTE_2);
