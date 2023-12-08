import React from 'react';
import { View } from 'react-native';
import { makeStyles, Avatar } from '@rneui/themed';
import { NavProps } from '../config/routes';
import { toSize } from '../helpers/scaling';
import TitleBar from '../components/TitleBar';

export default function HomeScreen({ navigation }: NavProps) {
  const styles = useStyles();

  return (
    <View>
      <TitleBar title="Decks" subtitle="Your available decks">
        <Avatar
          size={toSize(50)}
          rounded
          source={{ uri: 'https://randomuser.me/api/portraits/men/36.jpg' }}
          containerStyle={styles.avatar}
        />
      </TitleBar>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginVertical: toSize(5),
  },
}));
