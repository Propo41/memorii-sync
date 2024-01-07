import React from 'react';
import { View } from 'react-native';
import { makeStyles, useTheme } from '@rneui/themed';
import { toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TitleBar from '../components/TitleBar';
import { iconSize } from '../config';

export default function StoreScreen() {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View>
      <TitleBar
        title="Market"
        subtitle="Buy ready-made decks"
        icon={<Icon name="shopping-cart" color={theme.colors.purple} size={iconSize.lg} style={styles.headerIcon} />}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  headerIcon: {
    marginVertical: toSize(20),
  },
}));
