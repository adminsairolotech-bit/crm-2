module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    versionCode: process.env.VERSION_CODE
      ? parseInt(process.env.VERSION_CODE, 10)
      : config.android.versionCode,
  },
});
