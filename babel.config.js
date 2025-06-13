// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Expo Router
      'expo-router/babel',
      // Optional: if you are using Reanimated 2 or higher
      // 'react-native-reanimated/plugin',
    ],
  };
};