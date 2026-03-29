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
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 24,
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '1.9.25',
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
            minSdkVersion: 24,
          },
        },
      ],
      'expo-router',
      'expo-secure-store',
    ],
  },
};
