import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { makeStyles, Text, Button, useThemeMode, useTheme } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import { getSets } from '../database';
import Set from '../components/Set';

export default function CardsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();
  const [sets, setSets] = useState([]);
  console.log(mode);

  useEffect(() => {
    const sets = getSets('English');
    console.log(sets);

    setSets(sets);
  }, []);

  //navigation.navigate()

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title="" />
        <View style={{ marginTop: theme.spacing.sm }}></View>
      </ScrollView>
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
