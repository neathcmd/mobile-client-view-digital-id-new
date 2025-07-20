// lib/getDeviceInfo.ts
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { UAParser } from "ua-parser-js";

export const getDeviceInfo = async () => {
  const parser = new UAParser();
  const result = parser.getResult();

  const fingerprintInstance = await FingerprintJS.load();
  const fingerprintResult = await fingerprintInstance.get();

  return {
    fingerprint: fingerprintResult.visitorId,
    os: `${result.os.name} ${result.os.version}`,
    browser: `${result.browser.name} ${result.browser.version}`,
    device_name: result.device.model || "Unknown",
  };
};
