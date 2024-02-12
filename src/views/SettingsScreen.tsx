import { makeStyles, Text, useTheme, useThemeMode } from '@rneui/themed';
import { Divider } from '@rneui/themed';
import { Switch } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { ColorValue, TouchableNativeFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChangeLanguageDialog from '../components/ChangeLanguageDialog';
import TitleBar from '../components/TitleBar';
import { iconSize, Language, margins } from '../config';
import { NavProps, NavRoutes } from '../config/routes';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { FirebaseApp } from '../models/FirebaseApp';
import { showToast } from '../components/CustomToast';
import { useTranslation } from 'react-i18next';
import { UserPreference } from '../models/dto/UserPreference';
import * as NavigationBar from 'expo-navigation-bar';
import { log } from '../helpers/utility';

type MenuProps = {
  title: string;
  Icon1: React.ReactElement;
  subtitle?: string;
  Icon2?: React.ReactElement;
  onPress: () => void;
};

const Menu = ({ Icon1, title, subtitle, Icon2, onPress }: MenuProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const onClick = () => {
    onPress();
  };

  return (
    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(theme.colors.touchable as ColorValue, false)} onPress={onClick}>
      <View style={styles.menuContainer}>
        {Icon1}
        <Text body1_bold style={styles.menuTitle}>
          {title}
        </Text>
        <Text body1 style={styles.menuSubtitle}>
          {subtitle}
        </Text>
        {Icon2}
      </View>
    </TouchableNativeFeedback>
  );
};

export default function SettingsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();
  const [darkModeSwitch, setDarkModeSwitch] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('English');
  const { t, i18n } = useTranslation(); //i18n instance

  useEffect(() => {
    const getData = async () => {
      const currentUser = auth().currentUser;
      const user = await FirebaseApp.getInstance().getUser(currentUser!.uid);
      if (!user) {
        showToast(t('screens.toast.sessionExpired'), 'error');
        navigation.replace(NavRoutes.Login);
        return;
      }

      const { locale, isDarkMode } = user.preferences;
      setLanguage(locale);
      setMode(isDarkMode ? 'dark' : 'light');
      setDarkModeSwitch(isDarkMode ? true : false);
    };

    getData();
  }, []);

  const toggleDarkMode = async () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
    setDarkModeSwitch(darkModeSwitch ? false : true);

    await updatePreference(mode !== 'dark', language);
    await NavigationBar.setBackgroundColorAsync(mode !== 'dark' ? theme.colors.violetShade! : theme.colors.white);
  };

  const onLanguageChange = async (lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);

    await updatePreference(mode === 'dark', lang);
  };

  const updatePreference = async (isDarkMode: boolean, locale: Language) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
    await FirebaseApp.getInstance().updateUserPreference(currentUser.uid, new UserPreference(isDarkMode, locale));
  };

  const onSignOutClick = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.revokeAccess();
      showToast('See you later!');
    } catch (error: any) {
      log('error signing out.', error);
    }
    navigation.replace(NavRoutes.Login);
  };

  return (
    <>
      <TitleBar title={t('screens.settings.title')} />
      <Menu
        title={t('screens.settings.language')}
        subtitle={language}
        Icon1={<Icon name="language" style={styles.icon1} color={theme.colors.text} size={iconSize.sm} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={iconSize.sm} />}
        onPress={() => setDialogOpen(true)}
      />
      <Divider style={styles.divider} color={theme.colors.touchable} />
      <Menu
        title={t('screens.settings.darkMode')}
        onPress={toggleDarkMode}
        Icon1={<Icon name="wb-sunny" style={styles.icon1} color={theme.colors.text} size={iconSize.sm} />}
        Icon2={
          <Switch
            value={darkModeSwitch}
            onValueChange={toggleDarkMode}
            color={theme.colors.purple}
            trackColor={{
              false: theme.colors.ash,
              true: theme.colors.purple,
            }}
          />
        }
      />
      <Divider style={styles.divider} color={theme.colors.touchable} />
      {/* todo <Menu
        title={t('screens.settings.helpAndSupport')}
        onPress={() => {}}
        Icon1={<Icon name="help" style={styles.icon1} color={theme.colors.text} size={iconSize.sm} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={iconSize.sm} />}
      />
      <Divider style={styles.divider} color={theme.colors.touchable} /> */}
      <Menu
        title={t('screens.settings.logout')}
        onPress={onSignOutClick}
        Icon1={<Icon name="logout" style={styles.icon1} color={theme.colors.orange} size={iconSize.sm} onPress={toggleDarkMode} />}
      />
      {/* dialogs */}
      <ChangeLanguageDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} language={language} onLanguageChange={onLanguageChange} />
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: margins.window_hor + 15,
  },
  divider: {
    marginHorizontal: margins.window_hor,
  },
  menuTitle: {
    flexGrow: 1,
    marginLeft: 10,
    color: theme.colors.text,
  },
  menuSubtitle: {
    color: theme.colors.text,
  },
  icon: {
    color: theme.colors.text,
  },
  icon1: {
    marginRight: 10,
  },
}));
