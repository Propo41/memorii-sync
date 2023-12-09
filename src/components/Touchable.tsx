import { ColorValue, TouchableNativeFeedback } from 'react-native';
import React from 'react';
import { makeStyles } from '@rneui/themed';

type Props = {
  children: React.ReactElement;
};

const Touchable = ({ children }: Props) => {
  const styles = useStyles();

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple(
        styles.touchableContainer.color as ColorValue,
        false
      )}
    >
      {children}
    </TouchableNativeFeedback>
  );
};

const useStyles = makeStyles((theme) => ({
  touchableContainer: {
    color: theme.mode === 'dark' ? theme.colors.ash : theme.colors.orange,
  },
}));

export default Touchable;
