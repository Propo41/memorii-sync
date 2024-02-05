import { useFocusEffect } from '@react-navigation/native';
import { makeStyles, useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { Image, StatusBar, TouchableNativeFeedback, View } from 'react-native';
import { NavProps, NavRoutes } from '../config/routes';
import { Text } from '@rneui/themed';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { User } from '../models/dto/User';
import { FirebaseApp } from '../models/FirebaseApp';
import { showToast } from '../components/CustomToast';
import { log } from '../helpers/logger';
import { useTranslation } from 'react-i18next';

async function onGoogleButtonPress() {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  } catch (error: any) {
    log('LoginScreen: onGoogleButtonPress', error);
  }

  return null;
}

type ButtonProps = {
  onSignInPress: () => void;
  disabled: boolean;
};

const Button = ({ disabled, onSignInPress }: ButtonProps) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#fff', false)} onPress={onSignInPress} disabled={disabled}>
        <View style={styles.buttonContainer}>
          <Image source={require('../assets/google.png')} style={styles.buttonIcon} />
          <Text body1>{t('screens.login.signinButton')}</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

export default function LoginScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useFocusEffect(React.useCallback(() => {}, []));

  const onSignInPress = async () => {
    const res = await onGoogleButtonPress();
    setLoading(true);

    if (!res) {
      showToast('Something went wrong while signing in!');
      return;
    }

    if (res.additionalUserInfo?.isNewUser) {
      showToast('Signed up successfully!');
      if (res.user) {
        const { user } = res;
        const userDto = new User(user.uid, user.displayName!, user.email!, user.photoURL!, user.emailVerified, user.metadata?.creationTime);

        userDto.decksPurchased = ['W1IOzaESOgZJRjsyOdVO', 'cIjHAzdFMZhZsErnSDn9', 'wScY3QOGTjM0cX7CLQV4', 'xY0fBfVJsioLPSoqoF4o'];
        await FirebaseApp.getInstance().createUser(user.uid, userDto);
        navigation.replace(NavRoutes.App);
      } else {
        log('LoginScreen: Something went wrong');
        showToast('Something went wrong! Please try again later');
      }
    } else {
      showToast('Welcome back!');
      navigation.replace(NavRoutes.App);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/sky1.png')} style={styles.sky1} />
      <Image source={require('../assets/sky2.png')} style={styles.sky2} />
      <Image source={require('../assets/sky3.png')} style={styles.sky3} />
      <StatusBar backgroundColor={theme.colors.violetShade} />
      <View style={styles.flexGrow} />
      <View style={styles.loginContainer}>
        <Image source={require('../assets/female-reading.png')} style={styles.image} />
        <Text head1 style={styles.title}>
          {t('screens.login.title')}
        </Text>
        <Text body1 style={styles.spacing}>
          {t('screens.login.subtitle')}
        </Text>
        <Button onSignInPress={onSignInPress} disabled={loading} />
        <Text style={styles.agreementText}> {t('screens.login.terms&Conditions')}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    backgroundColor: theme.colors.violetShade,
  },
  agreementText: {
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    fontSize: 15,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 10,
  },
  title: {
    marginTop: -30,
  },
  flexGrow: {
    flexGrow: 1,
  },
  spacing: {
    marginTop: 10,
  },
  image: {
    marginTop: -200,
  },
  sky1: {
    marginRight: 40,
    marginTop: 40,
    position: 'absolute',
    right: 0,
  },
  sky2: {
    marginLeft: 30,
    marginTop: 90,
    right: 0,
  },
  sky3: {
    marginRight: 20,
    marginTop: 180,
    position: 'absolute',
    right: 0,
  },
  loginContainer: {
    backgroundColor: theme.colors.white,
    borderTopRightRadius: 130,
    minHeight: 400,
    paddingTop: 15,
    paddingLeft: 25,
    paddingRight: 25,
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    marginLeft: 20,
  },
  buttonContainer: {
    backgroundColor: theme.colors.lightAsh,
    paddingBottom: 20,
    paddingTop: 20,
    display: 'flex',
    marginTop: 25,
    flexDirection: 'row',
    textAlign: 'center',
    justifyContent: 'flex-start',
    marginRight: 90,
    borderRadius: 20,
  },
}));
