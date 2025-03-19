module.exports = {
  expo: {
    name: "ECUS Example",
    slug: "ecus-example",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.moonrailgun.ecus.example",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.moonrailgun.ecus.example",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 30000,
      url: "http://localhost:5433/api/mxcv71ljj1l4elkqu0crv3i3/manifest",
      requestHeaders: {
        foo: "bar",
      },
    },
    runtimeVersion: "1",
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
