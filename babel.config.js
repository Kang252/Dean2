module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Thêm dòng này vào cuối danh sách plugins
      'react-native-reanimated/plugin', 
    ],
  };
};