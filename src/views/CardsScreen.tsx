import React from 'react';
import { NavProps } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import { View } from 'react-native';
import SwipeableCards from '../components/Cards';

export default function CardsScreen({ navigation }: NavProps) {
  const users = [
    { id: '1', uri: require('../assets/1.jpg') },
    { id: '2', uri: require('../assets/2.jpg') },
    { id: '3', uri: require('../assets/3.jpg') },
    { id: '4', uri: require('../assets/4.jpg') },
    { id: '5', uri: require('../assets/5.jpg') },
  ];

  return (
    <View>
      <NavigationBar title="" />
      <SwipeableCards cards={users} />
    </View>
  );
}
