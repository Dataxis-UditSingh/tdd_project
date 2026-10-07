const fs = require("fs");
const path = require("path");

const source = path.resolve(__dirname, "..", "backend-runtime");
const destination = path.resolve(
  __dirname,
  "..",
  "backend-runtime-staged"
);

function removeDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDirectory(sourceDir, destinationDir) {
  fs.cpSync(sourceDir, destinationDir, {
    recursive: true,
    force: true,
  });
}

console.log("Preparing backend runtime...");
console.log("Source:", source);
console.log("Destination:", destination);

removeDirectory(destination);

copyDirectory(source, destination);

console.log("Backend runtime prepared successfully.");

const nodeModules = path.join(destination, "node_modules");
const sdkNode = path.join(
  nodeModules,
  "@opentelemetry",
  "sdk-node"
);
const express = path.join(nodeModules, "express");

if (!fs.existsSync(nodeModules)) {
  throw new Error("backend-runtime node_modules was not copied.");
}

if (!fs.existsSync(sdkNode)) {
  throw new Error("@opentelemetry/sdk-node was not copied.");
}

if (!fs.existsSync(express)) {
  throw new Error("express was not copied.");
}

console.log("Verified backend dependencies.");