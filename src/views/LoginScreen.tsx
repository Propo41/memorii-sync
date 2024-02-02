import { useFocusEffect } from '@react-navigation/native';
import { makeStyles, useTheme } from '@rneui/themed';
import React from 'react';
import { Image, StatusBar, TouchableNativeFeedback, View } from 'react-native';
import { NavProps, NavRoutes } from '../config/routes';
import { Text } from '@rneui/themed';

type ButtonProps = {
  onSignInPress: () => void;
};

const Button = ({ onSignInPress }: ButtonProps) => {
  const styles = useStyles();

  return (
    <View>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#fff', false)} onPress={onSignInPress}>
        <View style={styles.buttonContainer}>
          <Image source={require('../assets/google.png')} style={styles.buttonIcon} />
          <Text body1>Sign in with google</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

export default function LoginScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { theme } = useTheme();

  useFocusEffect(React.useCallback(() => {}, []));
  const onSignInPress = () => {
    // navigation.push(NavRoutes.App);
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
          Get{'\n'}started
        </Text>
        <Text body1 style={styles.spacing}>
          Unlock Your Learning Journey{'\n'}with a single click
        </Text>
        <Button onSignInPress={onSignInPress} />
        <Text style={styles.agreementText}>By signing in, you accept the terms and conditions</Text>
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
