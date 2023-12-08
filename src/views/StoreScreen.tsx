import React from 'react';
import { View } from 'react-native';
import { makeStyles, useTheme } from '@rneui/themed';
import { toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TitleBar from '../components/TitleBar';

export default function StoreScreen() {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View>
      <TitleBar title="Market" subtitle="Buy ready-made decks">
        <Icon
          name="shopping-cart"
          color={theme.colors.purple}
          size={toSize(50)}
          style={styles.headerIcon}
        />
      </TitleBar>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  headerIcon: {
    marginVertical: toSize(5),
  },
}));
