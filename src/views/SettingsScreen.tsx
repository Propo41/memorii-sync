import { Dialog, makeStyles, Text, useTheme, useThemeMode } from '@rneui/themed';
import { Divider } from '@rneui/themed';
import { Switch } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Alert, ColorValue, TouchableNativeFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
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
import { _User } from '../models/dto';
import { Cache } from '../models/Cache';
import { FF_BOLD, FF_REGULAR } from '../theme/typography';

type MenuProps = {
  title: string;
  Icon1: React.ReactElement;
  subtitle?: string;
  color?: string;
  Icon2?: React.ReactElement;
  onPress: () => void;
};

const showAlert = (title: string, subtitle: string, onConfirm: () => void) =>
  Alert.alert(
    title,
    subtitle,
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Confirm', onPress: onConfirm },
    ],
    {
      cancelable: true,
    }
  );

const Menu = ({ Icon1, title, subtitle, Icon2, onPress, color }: MenuProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const onClick = () => {
    onPress();
  };

  return (
    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(theme.colors.touchable as ColorValue, false)} onPress={onClick}>
      <View style={styles.menuContainer}>
        {Icon1}
        <Text body1_bold style={{ ...styles.menuTitle, color: color || theme.colors.text }}>
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
  const [user, setUser] = useState<_User>();
  const [backupAlertVisible, setBackupAlertVisible] = useState(false);
  const [importAlertVisible, setImportAlertVisible] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const currentUser = auth().currentUser;
      const user = await FirebaseApp.getInstance().getUser(currentUser!.uid);
      if (!user) {
        showToast(t('screens.toast.sessionExpired'), 'error');
        navigation.replace(NavRoutes.Login);
        return;
      }

      setUser(user);
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
    if (!user) return;
    await FirebaseApp.getInstance().updateUserPreference(user.id, new UserPreference(isDarkMode, locale));
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
    await NavigationBar.setBackgroundColorAsync(theme.colors.white);
  };

  const onImportPress = async () => {
    if (!user) return;
    const decks = await FirebaseApp.getInstance().restoreDecks(user.id);
    for (const deck of decks) {
      await Cache.getInstance().updateDeck(deck.id, deck);
    }

    showToast('Import done!');
    setImportAlertVisible(!importAlertVisible);
  };

  const onExportPress = async () => {
    if (!user) return;
    const deckList = await Cache.getInstance().getDecks([...user.decksCreated, ...user.decksPurchased]);
    await FirebaseApp.getInstance().backUpDecks(user.id, deckList);

    showToast('Backup done!');
    setBackupAlertVisible(!backupAlertVisible);
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
      <Menu
        title={t('screens.settings.import')}
        onPress={() => setImportAlertVisible(true)}
        Icon1={<EntypoIcon name="download" style={styles.icon1} color={theme.colors.text} size={iconSize.sm} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={iconSize.sm} />}
      />
      <Menu
        title={t('screens.settings.export')}
        onPress={() => setBackupAlertVisible(true)}
        Icon1={<EntypoIcon name="upload-to-cloud" style={styles.icon1} color={theme.colors.text} size={iconSize.sm} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={iconSize.sm} />}
      />
      <Divider style={styles.divider} color={theme.colors.touchable} />
      <Menu
        title={t('screens.settings.logout')}
        onPress={onSignOutClick}
        color={theme.colors.orange}
        Icon1={<Icon name="logout" style={styles.icon1} color={theme.colors.orange} size={iconSize.sm} onPress={toggleDarkMode} />}
      />
      {/* dialogs */}
      <ChangeLanguageDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} language={language} onLanguageChange={onLanguageChange} />
      <Dialog isVisible={backupAlertVisible} onBackdropPress={() => setBackupAlertVisible(!backupAlertVisible)}>
        <Text style={styles.alertTitle}>Backup data</Text>
        <Text body1>Are you sure you want to export your data to the cloud for backup?</Text>
        <Dialog.Actions>
          <Dialog.Button title="CONFIRM" titleStyle={styles.alertActionButtonPos} onPress={onExportPress} />
          <Dialog.Button title="CANCEL" titleStyle={styles.alertTitle} onPress={() => setBackupAlertVisible(!backupAlertVisible)} />
        </Dialog.Actions>
      </Dialog>
      <Dialog isVisible={importAlertVisible} onBackdropPress={() => setImportAlertVisible(!importAlertVisible)}>
        <Text style={styles.alertTitle}>Import data</Text>
        <Text body1>You will be downloading all your backed up data from the cloud</Text>
        <Dialog.Actions>
          <Dialog.Button title="CONFIRM" titleStyle={styles.alertActionButtonPos} onPress={onImportPress} />
          <Dialog.Button title="CANCEL" titleStyle={styles.alertTitle} onPress={() => setImportAlertVisible(!importAlertVisible)} />
        </Dialog.Actions>
      </Dialog>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: margins.window_hor + 5,
  },
  alertTitle: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
  },
  alertActionButtonPos: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
    color: theme.colors.orange,
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
