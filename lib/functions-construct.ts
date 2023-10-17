// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Policy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class FunctionsConstruct extends Construct {
  certificateHandlerFn: Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const sharedConfig = {
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        target: "es2020",
        sourceMap: true,
      },
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(30),
    };

    const lambdaRole = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "secretsmanager:CreateSecret",
          "secretsmanager:DeleteSecret",
        ],
        resources: [
          `arn:aws:secretsmanager:${Stack.of(this).region}:${
            Stack.of(this).account
          }:secret:iot-cert-and-key-*`,
        ],
      })
    );

    lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: ["iot:CreateKeysAndCertificate"],
        resources: [`*`],
      })
    );

    lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: ["iot:UpdateCertificate", "iot:DeleteCertificate"],
        resources: [
          `arn:aws:iot:${Stack.of(this).region}:${
            Stack.of(this).account
          }:cert/*`,
        ],
      })
    );

    this.certificateHandlerFn = new NodejsFunction(this, "certificateHandler", {
      entry: "lambda/cert-handler.ts",
      role: lambdaRole, 
      ...sharedConfig,
    });

  }
}
