import { ExpoConfig, ConfigContext } from 'expo/config';
  
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Memorii Sync',
  slug: 'memorii-sync',
  version: '1.0.3',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  splash: {
    image: './src/assets/splash.png',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    googleServicesFile: './google-services.json',
    versionCode: 3,
    package: 'com.minkstudios.memoriisync',
    adaptiveIcon: {
      foregroundImage: './src/assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    blockedPermissions: ['android.permission.RECORD_AUDIO'],
  },
  web: {
    favicon: './src/assets/favicon.png',
  },
  plugins: [
    '@react-native-firebase/app',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '13.0',
        },
        android: {
          compileSdkVersion: 33,
          targetSdkVersion: 33,
          buildToolsVersion: '33.0.0',
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '6de1e02f-14b4-4b0c-8274-b313220edcf5',
    },
  },
  owner: 'minkstudios',
});