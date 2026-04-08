const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude the backend folder so Metro doesn't try to watch backend/node_modules
config.watchFolders = (config.watchFolders ?? []).filter(
  (f) => !f.includes("backend")
);

config.resolver.blockList = [
  new RegExp(
    path.join(__dirname, "backend").replace(/\\/g, "\\\\") + ".*"
  ),
];

module.exports = config;
