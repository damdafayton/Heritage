const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const {
  createSentryMetroSerializer,
} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // resolver: {
  //   extraNodeModules: {
  //     crypto: require('react-native-crypto'),
  //   },
  // },
  server: {
    port: 8082,
  },

  serializer: {
    customSerializer: createSentryMetroSerializer(),
  },
};

const merged = mergeConfig(getDefaultConfig(__dirname), config);
console.info(merged);
module.exports = merged;
