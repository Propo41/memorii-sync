import React from 'react';
import { Image, View } from 'react-native';
import { makeStyles, useTheme } from '@rneui/themed';
import { toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TitleBar from '../components/TitleBar';
import { iconSize } from '../config';

export default function StoreScreen() {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <TitleBar
        title="Market"
        subtitle="Buy ready-made decks"
        icon={<Icon name="shopping-cart" color={theme.colors.purple} size={iconSize.lg} style={styles.headerIcon} />}
      />
      <Image style={styles.image} source={require('../assets/under_work.png')} />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  headerIcon: {
    marginVertical: toSize(20),
  },
  container: {
    textAlign: 'center',
    alignItems: 'center',
  },
  image: {
    marginTop: 30,
  },
}));
