import React, { useState } from 'react';
import { View } from 'react-native';
import { makeStyles, Button, useThemeMode, useTheme, Text } from '@rneui/themed';
import { NavProps } from '../config/routes';
import TitleBar from '../components/TitleBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { toSize } from '../helpers/scaling';
import { Divider } from '@rneui/themed';
import { Switch } from '@rneui/themed';

type MenuProps = {
  title: string;
  Icon1: React.ReactElement;
  subtitle?: string;
  Icon2?: React.ReactElement;
};

const Menu = ({ Icon1, title, subtitle, Icon2 }: MenuProps) => {
  const styles = useStyles();

  return (
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
  );
};

export default function SettingsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();
  const [checked, setChecked] = useState(false);

  const toggleDarkMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
    setChecked(checked ? false : true);
  };

  return (
    <View>
      <TitleBar title="Settings" />
      <Menu
        title="Language"
        subtitle="English"
        Icon1={
          <Icon
            name="language"
            color={theme.mode === 'dark' ? theme.colors.white : theme.colors.black}
            size={toSize(30)}
          />
        }
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(30)} />}
      />
      <Divider />
      <Menu
        title="Dark Mode"
        Icon1={
          <Icon
            name="wb-sunny"
            color={theme.mode === 'dark' ? theme.colors.white : theme.colors.black}
            size={toSize(30)}
          />
        }
        Icon2={
          <Switch
            value={checked}
            onValueChange={toggleDarkMode}
            color={theme.colors.purple}
            trackColor={{
              false: theme.colors.ash,
              true: theme.colors.purple,
            }}
          />
        }
      />
      <Divider />
      <Menu
        title="Help & Support"
        Icon1={
          <Icon
            name="help"
            color={theme.mode === 'dark' ? theme.colors.white : theme.colors.black}
            size={toSize(30)}
          />
        }
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(30)} />}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
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
}));
