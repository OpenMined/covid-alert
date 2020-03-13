/**
 * @format
 */

import "./shim.js";
import crypto from "crypto";

import { AppRegistry } from "react-native";
import App from "./src/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
