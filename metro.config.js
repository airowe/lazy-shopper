const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\.spec\.tsx?$/,
  /\.spec\.jsx?$/,
  /__tests__\/.*/,
];

module.exports = config;
