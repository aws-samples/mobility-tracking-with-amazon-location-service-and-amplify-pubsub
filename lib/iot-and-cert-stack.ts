// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FunctionsConstruct } from "./functions-construct";
import { IotCoreConstruct } from "./iot-construct";

export class IotAndCertStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { certificateHandlerFn } = new FunctionsConstruct(this, "functionsConstruct")
    new IotCoreConstruct(this, "iotCoreConstruct", { certificateHandlerFn });

  }
}
