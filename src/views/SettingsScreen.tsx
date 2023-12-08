import React from 'react';
import { View } from 'react-native';
import { Text, Button, useThemeMode } from '@rneui/themed';

export default function SettingsScreen() {
  const { setMode, mode } = useThemeMode();

  const handleOnPress = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <View>
      <Text>Settings</Text>
      <Button onPress={handleOnPress} title={'change mode'} />
    </View>
  );
}
