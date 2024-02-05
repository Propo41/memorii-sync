import { Text, makeStyles } from '@rneui/themed';
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { toFont } from '../helpers/scaling';

type LocaleSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  mb?: number;
  value1: string;
  value2: string;
};

const LocaleSwitch = ({ onValueChange, value, mb, value1, value2 }: LocaleSwitchProps) => {
  const [isActive, setIsActive] = useState(value);
  const styles = useStyles();

  const handlePress = () => {
    const newValue = !isActive;
    setIsActive(newValue);
    onValueChange(newValue);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={{ ...styles.container, marginBottom: mb || 0 }}>
        <View style={{ ...styles.switch1, backgroundColor: isActive ? styles.active.backgroundColor : styles.inActive.backgroundColor }}>
          <Text style={styles.switch1Text}>{value1}</Text>
        </View>
        <View style={{ ...styles.switch1, backgroundColor: isActive ? styles.inActive.backgroundColor : styles.active.backgroundColor }}>
          <Text style={styles.switch2Text}>{value2}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    width: 50, // Square container width
    height: 50, // Square container height
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  active: {
    backgroundColor: '#656BFF',
  },
  inActive: {
    backgroundColor: theme.colors.transparent,
  },
  switch1: {
    padding: 5,
  },
  switch2: {
    padding: 5,
    marginLeft: 7,
  },
  switch1Text: {
    color: theme.colors.white,
    fontSize: toFont(15),
  },
  switch2Text: {
    color: theme.colors.white,
    fontSize: toFont(15),
  },
}));

export default LocaleSwitch;
