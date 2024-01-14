import React from 'react';
import { NavProps } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import { View } from 'react-native';
import SwipeableCards from '../components/Cards';

export default function CardsScreen({ navigation }: NavProps) {
  const cards = [
    { id: '1', key: 'dog', value: 'an brown a fascinating creature from the imaginary world' },
    { id: '2', key: 'monkey', value: 'an gray a mysterious being with magical powers' },
    { id: '3', key: 'elephant', value: 'an spotted a mysterious being with magical powers' },
    { id: '4', key: 'lion', value: 'an brown a mysterious being with magical powers' },
    { id: '5', key: 'cat', value: 'an spotted a fascinating creature from the imaginary world' },
  ];

  return (
    <View>
      <NavigationBar title="" />
      <SwipeableCards cards={cards} />
    </View>
  );
}
