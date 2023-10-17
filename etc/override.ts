// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { AmplifyRootStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyRootStackTemplate) {
    const unauthRole = resources.unauthRole;

    const basePolicies = Array.isArray(unauthRole.policies)
      ? unauthRole.policies
      : [unauthRole.policies];

    unauthRole.policies = [
      ...basePolicies,
      {
        policyName: "amplify-permissions-custom-resources",
        policyDocument: {
              "Version": "2012-10-17",
              "Statement": [
                  {
                      "Effect": "Allow",
                      "Action": [
                          "iot:Connect",
                          "iot:Subscribe",
                          "iot:Receive"
                      ],
                      "Resource": "*"
                  }
              ]
        },
      },
    ];
}