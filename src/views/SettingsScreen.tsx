import { makeStyles, Text, useTheme, useThemeMode } from '@rneui/themed';
import { Divider } from '@rneui/themed';
import { Switch } from '@rneui/themed';
import React, { useState } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BottomSheet from '../components/BottomSheet';
import TitleBar from '../components/TitleBar';
import Touchable from '../components/Touchable';
import { margins } from '../config';
import { NavProps } from '../config/routes';
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
  const [checked, setChecked] = useState(false);

  const toggleDarkMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
    setChecked(checked ? false : true);
  };

  return (
    <View>
      <TitleBar title="Settings" />
      <BottomSheet>
        <Text body1 style={styles.menuSubtitle}>
          hello
        </Text>
      </BottomSheet>
      <Menu
        title="Language"
        subtitle="English"
        Icon1={<Icon name="language" color={theme.colors.text} size={toSize(30)} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(30)} />}
        onPress={() => console.log('hello')}
      />
      <Divider style={styles.divider} />
      <Menu
        title="Dark Mode"
        Icon1={<Icon name="wb-sunny" color={theme.colors.text} size={toSize(30)} />}
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
      <Divider style={styles.divider} />
      <Menu
        title="Help & Support"
        Icon1={<Icon name="help" color={theme.colors.text} size={toSize(30)} />}
        Icon2={<Icon name="navigate-next" style={styles.icon} size={toSize(30)} />}
      />
      <Divider style={styles.divider} />
      <Menu
        title="Log out of all sessions"
        Icon1={<Icon name="logout" color={theme.colors.orange} size={toSize(30)} />}
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
    paddingVertical: 20,
    paddingHorizontal: margins.window_hor,
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
}));
