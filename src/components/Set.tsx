import { makeStyles, Text, useTheme } from '@rneui/themed';
import { TouchableNativeFeedback, View } from 'react-native';
import React from 'react';
import { LinearProgress } from '@rneui/themed';
import { margins } from '../config';
import { toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

type DeckProps = {
  name: string;
  progress: number; // ranges from 0-1
  fgColor: string;
  bgColor: string;
  mt?: number;
  mb?: number;
  onSetPress: () => void;
};

type StatusProps = {
  text: number;
  icon: React.ReactNode;
};

const Status = ({ text, icon }: StatusProps) => {
  const styles = useStyles();

  return (
    <View style={styles.status}>
      {icon}
      <Text body2 style={styles.statusText}>
        {text}
      </Text>
    </View>
  );
};

const Set = ({ name, progress, fgColor, bgColor, mt, mb, onSetPress }: DeckProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={{ ...styles.container, backgroundColor: bgColor, marginTop: mt || 0, marginBottom: mb || 0 }}>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(fgColor, false)} onPress={onSetPress}>
        <View style={styles.setContainer}>
          <Text style={styles.title} head3>
            {name}
          </Text>
          <LinearProgress style={{ ...styles.progressBar, backgroundColor: fgColor }} color={bgColor} value={progress} variant="determinate" />
          <View style={styles.statusContainer}>
            <Status text={30} icon={<Icon name="check-circle" style={styles.statusIcon} color={theme.colors.green} />} />
            <Status text={100} icon={<Icon2 name="cards-playing" style={styles.statusIcon} color={theme.colors.darkRed} />} />
          </View>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    borderRadius: 15,
    marginHorizontal: margins.window_hor,
    overflow: 'hidden',
  },
  status: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.white,
  },
  setContainer: {
    position: 'relative',
  },
  title: {
    color: theme.colors.white,
    position: 'absolute',
    top: '20%',
    marginLeft: toSize(30),
    zIndex: 1,
  },
  progressBar: {
    height: toSize(90),
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
    marginRight: 10,
    marginBottom: 5,
  },
}));

export default Set;
