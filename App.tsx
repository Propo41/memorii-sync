import { JosefinSans_400Regular, JosefinSans_700Bold, useFonts } from '@expo-google-fonts/josefin-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createTheme, Dialog, makeStyles, Text, ThemeProvider } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AppNavigator } from './src/navigation';
import { palette, typography } from './src/theme';
import { NavRoutes } from './src/config/routes';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CustomToast from './src/components/CustomToast';
import { FirebaseApp } from './src/models/FirebaseApp';
import { Cache } from './src/models/Cache';
import { FF_BOLD } from './src/theme/typography';
import { useTranslation } from 'react-i18next';
import { _AppInfo } from './src/models/dto';

const theme = createTheme({
  lightColors: palette['light'],
  darkColors: palette['dark'],
  components: {
    Text: typography,
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_700Bold,
  });
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [updateAlertVisible, setUpdateAlertVisible] = useState(false);
  const styles = useStyles();
  const { t } = useTranslation(); //i18n instance
  const [appInfo, setAppInfo] = useState<_AppInfo>();

  useEffect(() => {
    const googleServices = require('./google-services.json');
    // Note: Before triggering a sign-in request, you must initialize the Google SDK using your any required scopes 
    // and the webClientId, which can be found in the `android/app/google-services.json` file as the `client/oauth_client/client_id` property. 
    // Make sure to pick the client_id with `client_type: 3`
    const oAuthClient = googleServices.client[0].oauth_client.find((client: any) => client.client_type === 3);
    if (oAuthClient) {
      GoogleSignin.configure({
        webClientId: oAuthClient.client_id,
      });
    }
  }, []);

  useEffect(() => {
    const _user = auth().currentUser;
    setUser(_user);
    setInitializing(false);

    FirebaseApp.getInstance()
      .getAppInfo()
      .then(async (appInfo) => {
        if (appInfo) {
          await Cache.getInstance().saveAppInfo(appInfo);
          setAppInfo(appInfo);
        }

        const currentAppInfo = await Cache.getInstance().getAppInfo();

        if (!appInfo || !currentAppInfo) return;

        if (appInfo.version > currentAppInfo.version) {
          // update is available. Show user prompt
          setUpdateAlertVisible(true);
        }
      });
  }, []);

  const onConfirmUpdatePress = () => {
    if (appInfo) {
      Linking.openURL(appInfo.updateUrl);
    }

    setUpdateAlertVisible(false);
  };

  if (!fontsLoaded && initializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator initialRoute={!user ? NavRoutes.Login : NavRoutes.App} />
          <CustomToast position="bottom" />

          <Dialog isVisible={updateAlertVisible} onBackdropPress={() => setUpdateAlertVisible(!updateAlertVisible)}>
            <Text style={styles.alertTitle}>{t('screens.misc.update_alert_title')}</Text>
            <Text body1>{t('screens.misc.update_alert_subtitle')}</Text>
            <Dialog.Actions>
              <Dialog.Button
                title={t('screens.misc.update_alert_positive_btn')}
                titleStyle={styles.alertActionButtonPos}
                onPress={onConfirmUpdatePress}
              />
              <Dialog.Button
                title={t('screens.settings.alert.dialog_cancel')}
                titleStyle={styles.alertTitle}
                onPress={() => setUpdateAlertVisible(!updateAlertVisible)}
              />
            </Dialog.Actions>
          </Dialog>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  alertTitle: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
  },
  alertActionButtonPos: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
    color: '#FF7C7C',
  },
}));
