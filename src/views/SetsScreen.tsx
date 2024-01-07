import React from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import { makeStyles, Text, Button, useThemeMode, useTheme } from '@rneui/themed';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavProps } from '../config/routes';
import NavigationBar from '../components/NavigationBar';

const Tab = createBottomTabNavigator();

export default function SetsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();
  console.log(mode);

  //navigation.navigate()

  return (
    <View>
      <NavigationBar title="Sets" />
      <View
        style={{
          overflow: 'hidden',
          borderRadius: 10,
          marginHorizontal: 30
        }}
      >
        <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#7C82FF', false)} onPress={() => console.log('hekk')}>
          <View
            style={{
              paddingHorizontal: 50,
              paddingVertical: 50,
            }}
          >
            <Text>Click me</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      <Button
        iconPosition="left"
        buttonStyle={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 0,
          paddingHorizontal: 0,
        }}
      >
        <Text>hello</Text>
      </Button>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
