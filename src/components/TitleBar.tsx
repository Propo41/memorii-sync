import React, { ReactElement } from 'react';
import { View } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';
import { margins } from '../config/margins';

type TitleProps = {
  title: string;
  subtitle?: string;
  children?: ReactElement;
};

const TitleBar = ({ title, subtitle, children }: TitleProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text h1 style={styles.title}>
          {title}
        </Text>
        <Text style={styles.text} body1>
          {subtitle}
        </Text>
      </View>
      {children}
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: margins.window_vert,
  },
  titleContainer: {
    flexGrow: 1,
  },
  title: {
    color: theme.colors.purple,
  },
  text: {
    color: theme.mode === 'dark' ? theme.colors.white : theme.colors.black,
  },
}));

export default TitleBar;
