// babel.config.js
module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        "nativewind/babel",
        'react-native-reanimated/plugin', // ¡Importante que sea el último!
      ],
    };
  };
  
  // metro.config.js (crear este archivo)
  const { getDefaultConfig } = require("expo/metro-config");
  const { withNativeWind } = require('nativewind/metro');
  
  const config = getDefaultConfig(__dirname);
  
  module.exports = withNativeWind(config, { input: './global.css' });