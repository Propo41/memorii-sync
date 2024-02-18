import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import React from 'react';
import { makeStyles } from '@rneui/themed';
import { FF_REGULAR } from '../theme/typography';
import { toFont } from '../helpers/scaling';

type CustomToastProps = {
  position: 'top' | 'bottom';
};

export default function CustomToast({ position }: CustomToastProps) {
  const styles = useStyles();

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={styles.successStyle}
        text2NumberOfLines={3}
        contentContainerStyle={styles.container}
        text2Style={styles.successText2}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        contentContainerStyle={styles.container}
        style={styles.errorStyle}
        text1Style={styles.errorText1}
        text2Style={styles.errorText2}
        text2NumberOfLines={3}
      />
    ),
  };

  return <Toast config={toastConfig} position={position} visibilityTime={3000} />;
}

export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  Toast.show({
    type: type,
    text2: message,
  });
};

const useStyles = makeStyles((theme) => ({
  successStyle: {
    borderLeftColor: theme.colors.green,
  },
  errorStyle: {
    borderLeftColor: theme.colors.darkRed,
  },
  container: {
    paddingHorizontal: 13,
  },
  successText2: {
    fontSize: toFont(17),
    fontFamily: FF_REGULAR,
    color: theme.colors.black,
  },
  errorText1: {
    fontSize: toFont(17),
    fontFamily: FF_REGULAR,
    color: theme.colors.black,
  },
  errorText2: {
    fontSize: toFont(15),
    fontFamily: FF_REGULAR,
    color: theme.colors.black,
  },
}));
