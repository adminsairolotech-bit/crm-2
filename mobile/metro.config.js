const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix @/ path alias for EAS Build (EAGER_BUNDLE phase)
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

module.exports = config;
