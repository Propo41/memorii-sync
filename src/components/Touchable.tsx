import { ColorValue, Platform, TouchableNativeFeedback, View } from 'react-native';
import React from 'react';
import { makeStyles } from '@rneui/themed';

type Props = {
  children: React.ReactElement;
  onPress?: () => void;
};

const Touchable = ({ onPress, children }: Props) => {
  const styles = useStyles();

  if (Platform.OS === 'web') {
    console.log('cannot use touchable in web');
    return <View onTouchEnd={onPress}>{children}</View>;
  }

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple(
        styles.touchableContainer.color as ColorValue,
        false
      )}
      onPress={onPress}
    >
      {children}
    </TouchableNativeFeedback>
  );
};

const useStyles = makeStyles((theme) => ({
  touchableContainer: {
    color: theme.colors.ash,
  },
}));

export default Touchable;
