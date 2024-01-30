import React from 'react';
import { View, ViewStyle } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';
import { toFont } from '../helpers/scaling';
import { FF_BOLD, FF_REGULAR } from '../theme/typography';
import Icon from 'react-native-vector-icons/MaterialIcons';

type CardProps = {
  text: string;
  style?: ViewStyle;
  isTopView?: boolean;
  isCompleted?: boolean;
};

export default function Card({ text, style, isTopView = true, isCompleted }: CardProps) {
  const styles = useStyles();

  return (
    <View>
      {isCompleted && <Icon name="check-circle" style={styles.statusIcon} size={20} />}
      <View style={{ ...styles.container, ...style }}>
        <Text style={isTopView ? styles.topViewText : styles.backViewText}>{text}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: theme.spacing.sm,
    color: theme.colors.green,
    position: 'absolute'
  },
  topViewText: {
    fontSize: toFont(25),
    fontFamily: FF_BOLD,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  backViewText: {
    fontSize: toFont(22),
    fontFamily: FF_REGULAR,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
}));
