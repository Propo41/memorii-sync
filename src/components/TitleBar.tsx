import React, { ReactElement } from 'react';
import { View } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';
import { margins } from '../config';
import { toSize } from '../helpers/scaling';

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
    paddingVertical: 0,
    display: 'flex',
    flexDirection: 'row',
    // paddingTop: margins.window_vert,
    paddingHorizontal: margins.window_hor,
  },
  titleContainer: {
    flexGrow: 1,
  },
  title: {
    color: theme.colors.purple,
  },
  text: {
    marginTop: 0,
    color: theme.colors.text,
    marginBottom: toSize(7),
  },
}));

export default TitleBar;
