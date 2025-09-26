module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // plugins: [
    //   // NOTE: react-native-worklets/plugin must be listed last
    //   // It replaces the old react-native-reanimated/plugin
    //   [
    //     "react-native-worklets/plugin",
    //     {
    //       // Enable debugging in development
    //       relativeSourceLocation: true,
    //     },
    //   ],
    // ],
  };
};
