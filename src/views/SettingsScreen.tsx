import React from 'react';
import { View } from 'react-native';
import { makeStyles, Button, useThemeMode, useTheme, Text } from '@rneui/themed';
import { NavProps } from '../config/routes';
import TitleBar from '../components/TitleBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { toSize } from '../helpers/scaling';

const Menu = () => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.menuContainer}>
      <Icon
        name="shopping-cart"
        color={theme.mode === 'dark' ? theme.colors.white : theme.colors.black}
        size={toSize(30)}
        style={styles.menuIcon}
      />
      <Text body1 bold>Language</Text>
      <Text body1 bold>English</Text>
      <Icon name="navigate-next" style={styles.icon} size={toSize(30)} />
    </View>
  );
};

export default function SettingsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();

  const handleOnPress = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <View>
      <TitleBar title="Settings" />
      <Menu />
      <Button onPress={handleOnPress} title={'change mode'} />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  menuContainer: {
    display: 'flex',
  },
  menuIcon: {},
  text: {
    color: theme.colors.text,
  },
  icon: {
    color: theme.mode === 'dark' ? theme.colors.white : theme.colors.black,
  },
}));
