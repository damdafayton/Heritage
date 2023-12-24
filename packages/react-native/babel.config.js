module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // This prevents "Flatlist render error: Cannot read property 'getItem' of undefined #36828" error
    // do `react-native start --reset-cache` after adding the plugin
    '@babel/plugin-transform-flow-strip-types',
    ['@babel/plugin-transform-private-methods', {loose: true}],
  ],
};
