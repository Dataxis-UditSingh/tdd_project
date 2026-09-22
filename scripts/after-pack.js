const fs = require("fs");
const path = require("path");

exports.default = async function afterPack(context) {
  const projectRoot = context.packager.projectDir;

  const source = path.join(
    projectRoot,
    "backend-runtime-staged"
  );

  const appBundle = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  );

  const destination = path.join(
    appBundle,
    "Contents",
    "Resources",
    "backend"
  );

  console.log("");
  console.log("======================================");
  console.log("Copying backend runtime...");
  console.log("Source:", source);
  console.log("App:", appBundle);
  console.log("Destination:", destination);
  console.log("======================================");

  if (!fs.existsSync(source)) {
    throw new Error(
      `Backend runtime not found: ${source}`
    );
  }

  if (!fs.existsSync(appBundle)) {
    throw new Error(
      `Electron app bundle not found: ${appBundle}`
    );
  }

  fs.rmSync(destination, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(destination, {
    recursive: true,
  });

  fs.cpSync(source, destination, {
    recursive: true,
    force: true,
  });

  const sdkNode = path.join(
    destination,
    "node_modules",
    "@opentelemetry",
    "sdk-node"
  );

  const express = path.join(
    destination,
    "node_modules",
    "express"
  );

  if (!fs.existsSync(sdkNode)) {
    throw new Error(
      "@opentelemetry/sdk-node missing after packaging"
    );
  }

  if (!fs.existsSync(express)) {
    throw new Error(
      "express missing after packaging"
    );
  }

  console.log("Backend runtime copied successfully.");
  console.log("@opentelemetry/sdk-node: OK");
  console.log("express: OK");
  console.log("");
};