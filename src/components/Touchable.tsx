import { ColorValue, TouchableNativeFeedback } from 'react-native';
import React from 'react';
import { makeStyles } from '@rneui/themed';

type Props = {
  children: React.ReactElement;
  onPress?: () => void;
  rippleColor?: string;
};

const Touchable = ({ onPress, children, rippleColor }: Props) => {
  const styles = useStyles();

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple((rippleColor || styles.touchableContainer.color) as ColorValue, false)}
      onPress={onPress}
    >
      {children}
    </TouchableNativeFeedback>
  );
};

const useStyles = makeStyles((theme) => ({
  touchableContainer: {
    color: theme.colors.touchable,
  },
}));

export default Touchable;
