import React, { ReactElement } from 'react';
import { View } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';
import { margins } from '../config/margins';

type TitleProps = {
  title: string;
  subtitle?: string;
  icon?: ReactElement;
};

const TitleBar = ({ title, subtitle, icon }: TitleProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text head1 style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.text} body1>
            {subtitle}
          </Text>
        )}
      </View>
      {icon}
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: margins.window_vert,
    marginBottom: 15,
    paddingHorizontal: margins.window_hor,
  },
  titleContainer: {
    flexGrow: 1,
  },
  title: {
    color: theme.colors.purple,
  },
  text: {
    marginTop: 5,
    color: theme.colors.text,
  },
}));

export default TitleBar;
