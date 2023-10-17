// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CustomResource, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CfnPolicy,
  CfnPolicyPrincipalAttachment,
  CfnThing,
  CfnThingPrincipalAttachment,
} from "aws-cdk-lib/aws-iot";
import { Provider } from "aws-cdk-lib/custom-resources";
import { RetentionDays, LogGroup } from "aws-cdk-lib/aws-logs";
import { Function } from "aws-cdk-lib/aws-lambda";

interface IotCoreConstructProps extends StackProps {
  certificateHandlerFn: Function;
}

export class IotCoreConstruct extends Construct {
  constructor(scope: Construct, id: string, props: IotCoreConstructProps) {
    super(scope, id);

    const { certificateHandlerFn } = props;

    const provider = new Provider(this, "IoTCertProvider", {
      onEventHandler: certificateHandlerFn,
      logRetention: RetentionDays.ONE_DAY,
    });

    const certificate = new CustomResource(this, "AWS:IoTCert", {
      serviceToken: provider.serviceToken,
    });

    // Create an IoT Core Policy
    const policy = new CfnPolicy(this, "Policy", {
      policyName: "iot-device-policy",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "iot:Connect",
            Resource: [
              `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:client/trackThing01`,
              `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:client/trackThing02`
            ],
          },
          {
            Effect: "Allow",
            Action: "iot:Publish",
            Resource: `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:topic/iot/location`,
          },
        ],
      },
    });

    const policyPrincipalAttachment = new CfnPolicyPrincipalAttachment(
      this,
      "MyCfnPolicyPrincipalAttachment",
      {
        policyName: policy.policyName as string,
        principal: `arn:aws:iot:${Stack.of(this).region}:${
          Stack.of(this).account
        }:cert/${certificate.getAttString("certificateId")}`,
      }
    );
    policyPrincipalAttachment.addDependency(policy);

    // Create an IoT Core Thing
    const thing = new CfnThing(this, "Thing", {
      thingName: "iot-device",
    });

    // Attach the certificate to the IoT Core Thing
    const thingPrincipalAttachment = new CfnThingPrincipalAttachment(
      this,
      "MyCfnThingPrincipalAttachment",
      {
        principal: `arn:aws:iot:${Stack.of(this).region}:${
          Stack.of(this).account
        }:cert/${certificate.getAttString("certificateId")}`,
        thingName: thing.thingName as string,
      }
    );
    thingPrincipalAttachment.addDependency(thing);

    // CloudWatch Role for IoT Core error logging
    const logGroup = new LogGroup(this, "ErrorLogGroup", {
      retention: RetentionDays.ONE_DAY,
    });

  }
}
