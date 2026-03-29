const baseConfig = require('./app.json');

const versionCode = process.env.VERSION_CODE
  ? parseInt(process.env.VERSION_CODE, 10)
  : baseConfig.expo.android.versionCode;

module.exports = {
  ...baseConfig,
  expo: {
    ...baseConfig.expo,
    android: {
      ...baseConfig.expo.android,
      versionCode,
    },
  },
};
