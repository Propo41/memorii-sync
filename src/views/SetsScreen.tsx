import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { makeStyles, Text, Button, useThemeMode, useTheme } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import { getSets } from '../database';
import Set from '../components/Set';

export default function SetsScreen({ navigation }: NavProps) {
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
        <NavigationBar title="Sets" />
        <View style={{ marginTop: theme.spacing.sm }}>
          {sets.map((set, index) => {
            const { name, cards, completed, bgColor, fgColor } = set;

            const progress = completed / cards.length;

            return (
              <Set
                key={index}
                name={name}
                progress={progress}
                mt={index > 0 ? 8 : 0}
                mb={index === sets.length - 1 ? 70 : 0}
                fgColor={fgColor}
                bgColor={bgColor}
                onSetPress={() => {
                  navigation.push(NavRoutes.Cards);
                }}
              />
            );
          })}
        </View>
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
