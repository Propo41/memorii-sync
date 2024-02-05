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
      <BaseToast {...props} style={styles.successStyle} contentContainerStyle={styles.successContainer} text2Style={styles.successText2} />
    ),
    error: (props: any) => <ErrorToast {...props} style={styles.errorStyle} text1Style={styles.errorText1} text2Style={styles.errorText2} />,
  };

  return <Toast config={toastConfig} position={position} visibilityTime={5000} />;
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
  successContainer: {
    paddingHorizontal: 15,
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
