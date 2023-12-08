import React from 'react';
import { View } from 'react-native';
import { makeStyles, Button, useThemeMode } from '@rneui/themed';
import { NavProps } from '../config/routes';
import TitleBar from '../components/TitleBar';

export default function SettingsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();

  const handleOnPress = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <View>
      <TitleBar title="Settings" />
      <Button onPress={handleOnPress} title={'change mode'} />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({}));
