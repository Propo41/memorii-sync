import { Button, makeStyles } from '@rneui/themed';
import React from 'react';
import { FF_REGULAR } from '../theme/typography';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  mx?: number;
  mt?: number;
  mb?: number;
  py?: number;
  color?: string;
  textColor?: string;
};

const AppButton = ({ title, onPress, mx, mt, mb, py, color, textColor }: AppButtonProps) => {
  const styles = useStyles();

  const containerStyle = {
    ...styles.container,
    paddingHorizontal: mx !== undefined ? mx : styles.container.paddingHorizontal,
    marginTop: mt !== undefined ? mt : styles.container.marginTop,
    marginBottom: mb !== undefined ? mb : styles.container.marginBottom,
  };

  const buttonStyle = {
    ...styles.button,
    backgroundColor: color ? color : styles.button.backgroundColor,
    paddingVertical: py !== undefined ? py : styles.button.paddingVertical,
  };

  const titleStyle = {
    ...styles.title,
    color: textColor ? textColor : styles.title.color,
  };
  return (
    <Button
      buttonStyle={buttonStyle}
      containerStyle={containerStyle}
      titleStyle={titleStyle}
      title={title}
      onPress={() => onPress()}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    marginVertical: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: theme.colors.purple,
    borderRadius: 7,
    paddingVertical: 10,
  },
  title: {
    fontFamily: FF_REGULAR,
    color: theme.colors.white,
  },
}));

export default AppButton;
