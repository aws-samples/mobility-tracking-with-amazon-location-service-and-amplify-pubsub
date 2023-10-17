// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { mqtt, iot } from "aws-iot-device-sdk-v2";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";

type Position = {
  lat: number;
  long: number;
}

class Simulator {

  private ioTtopic: string;
  private clientId: string;
  private isConnected: boolean = false;
  private iotCoreClient: IoTClient;
  private secretId: string;
  private region: string;
  private cert?: string;
  private key?: string;
  private endpoint?: string;
  private ioTConnection?: mqtt.MqttClientConnection;

  constructor(
    clientId: string,
    topic: string,
    secretId: string,
    region: string,
  ) {
    this.ioTtopic = topic;
    this.clientId = clientId;
    this.secretId = secretId;
    this.region = region;
    this.iotCoreClient = new IoTClient({});
    this.isConnected = false;
  }

  private async getEndpoint(): Promise<string> {
    try {
      const endpoint = await this.iotCoreClient.send(
        new DescribeEndpointCommand({
          endpointType: "iot:Data-ATS",
        })
      );

      if (!endpoint.endpointAddress)
        throw new Error("Unable to get IoT Core Endpoint");

      console.info(`Got IoT Core Endpoint: ${endpoint.endpointAddress}`);
      return endpoint.endpointAddress;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  private async getCertAndKey(): Promise<{
    cert: string;
    key: string;
  }> {
    if (!this.cert || !this.key) {
      const secretName = this.secretId; 
      const region = this.region; 

      const client = new SecretsManagerClient({
        region: region,
      });

      try {
        const response = await client.send(
          new GetSecretValueCommand({
            SecretId: secretName,
            VersionStage: "AWSCURRENT",
          })
        );

        if (!response.SecretString) {
          throw new Error("Could not find secret");
        }

        const secretObj = JSON.parse(response.SecretString);

        if (!secretObj.cert || !secretObj.keyPair) {
          throw new Error("Could not find cert or key");
        }

        this.cert = secretObj.cert;
        this.key = secretObj.keyPair;

        console.info("Got cert and key from Secrets Manager");
      } catch (err) {
        console.error(err);
        throw err;
      }
    }

    if (!this.cert || !this.key) {
      throw new Error("Cert or key is undefined.");
    }

    return {
      cert: this.cert,
      key: this.key,
    };
  }

  private async buildConnection(
    clientId: string
  ): Promise<mqtt.MqttClientConnection> {
    if (!this.endpoint) {
      this.endpoint = await this.getEndpoint();
    }
    const { cert, key } = await this.getCertAndKey();
    let configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
      cert,
      key
    );
    configBuilder.with_clean_session(false);
    configBuilder.with_client_id(clientId);
    configBuilder.with_endpoint(this.endpoint);
    const config = configBuilder.build();
    const client = new mqtt.MqttClient();

    return client.new_connection(config);
  }

  private async connect() {
    try {
      this.ioTConnection = await this.buildConnection(this.clientId);
      console.info("Successfully build connection object");
      this.isConnected = true;
    } catch (err) {
      console.error(err);
      console.error("Failed to build connection object");
      throw err;
    }

    try {
      await this.ioTConnection?.connect();
      console.info("Successfully connected to IoT Core");
      this.isConnected = true;
    } catch (err) {
      console.error(err);
      console.error("Failed to build connection object.");
      throw err;
    }
  }

  async publishUpdate(location: Position) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      let payload = {
        deviceId: this.clientId,
        timestamp: new Date().getTime(),
        location: location
      }
  
      // Log update before publishing
      console.debug(JSON.stringify(payload, null, 2));

      if (!this.ioTConnection) {
        throw new Error('AWS IoT connection is not established.');
      }
  
      await this.ioTConnection?.publish(
        this.ioTtopic,
        JSON.stringify(payload),
        mqtt.QoS.AtMostOnce
      );
    } catch (error) {
      console.error('Error publishing update:', error);
    }
  }

}

export default Simulator;
