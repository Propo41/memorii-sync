import { makeStyles, Text, ThemeMode, useTheme, useThemeMode } from '@rneui/themed';
import { Divider } from '@rneui/themed';
import { Switch } from '@rneui/themed';
import React, { useState } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ChangeLanguageDialog from '../components/ChangeLanguageDialog';
import TitleBar from '../components/TitleBar';
import Touchable from '../components/Touchable';
import { iconSize, margins } from '../config';
import { NavProps } from '../config/routes';
import { getAppState } from '../database';
import { toSize } from '../helpers/scaling';

type MenuProps = {
  title: string;
  Icon1: React.ReactElement;
  subtitle?: string;
  Icon2?: React.ReactElement;
  onPress?: () => void;
};

const Menu = ({ Icon1, title, subtitle, Icon2, onPress }: MenuProps) => {
  const styles = useStyles();

  return (
    <Touchable onPress={onPress}>
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
    </Touchable>
  );
};

export default function SettingsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();
  const [darkModeSwitch, setDarkModeSwitch] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [language, setLanguage] = useState('English');

  React.useEffect(() => {
    const { language, colorMode } = getAppState();
    setLanguage(language);
    setMode(colorMode as ThemeMode);
    setDarkModeSwitch(colorMode === 'dark' ? true : false);
  }, []);

  const toggleDarkMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
    setDarkModeSwitch(darkModeSwitch ? false : true);
  };

  return (
    <>
      <TitleBar title="Settings" />
      <Menu
        title="Language"
        subtitle={language}
        Icon1={<Icon name="language" style={styles.icon1} color={theme.colors.text} size={toSize(iconSize.sm)} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(iconSize.sm)} />}
        onPress={() => setDialogOpen(true)}
      />
      <Divider style={styles.divider} color={theme.colors.touchable} />
      <Menu
        title="Dark Mode"
        Icon1={<Icon name="wb-sunny" style={styles.icon1} color={theme.colors.text} size={toSize(iconSize.sm)} />}
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
        title="Help & Support"
        Icon1={<Icon name="help" style={styles.icon1} color={theme.colors.text} size={toSize(iconSize.sm)} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(iconSize.sm)} />}
      />
      <Divider style={styles.divider} color={theme.colors.touchable} />
      <Menu
        title="Log out of all sessions"
        Icon1={<Icon name="logout" style={styles.icon1} color={theme.colors.orange} size={toSize(iconSize.sm)} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(iconSize.sm)} />}
      />
      {/* dialogs */}
      <ChangeLanguageDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} language={language} setLanguage={setLanguage} />
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
