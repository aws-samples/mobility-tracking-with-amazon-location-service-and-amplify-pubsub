// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Amplify } from "aws-amplify";
import config from "./aws-exports";

Amplify.configure(config);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
