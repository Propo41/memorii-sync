import { makeStyles, Text } from '@rneui/themed';
import { TouchableHighlight, View } from 'react-native';
import React from 'react';
import { LinearProgress } from '@rneui/themed';
import { margins } from '../config';

type DeckProps = {
  name: string;
  progress: number; // ranges from 0-1
  pbColor: string;
  containerBgColor: string;
  pbBackgroundColor: string;
  textColor?: string;
  mt?: number;
  mb?: number;
  onDeckPress: () => void;
};

const Deck = ({ name, progress, containerBgColor, pbColor, pbBackgroundColor, textColor, mt, mb, onDeckPress }: DeckProps) => {
  const styles = useStyles();

  return (
    <TouchableHighlight
      onPress={onDeckPress}
      underlayColor={'red'}
      style={{ ...styles.container, backgroundColor: containerBgColor, marginTop: mt || 0, marginBottom: mb || 0 }}
    >
      <>
        <Text style={{ color: textColor || styles.text.color }} head2>
          {name}
        </Text>
        <LinearProgress
          style={{ ...styles.progressBar, backgroundColor: pbBackgroundColor }}
          color={pbColor}
          value={progress}
          variant="determinate"
        />
        <View style={styles.progressStatusContainer}>
          <Text body2 style={[styles.flex, { color: textColor || styles.text.color }]}>
            Completion
          </Text>
          <Text style={{ color: textColor || styles.text.color }} body2>
            {progress * 100}%
          </Text>
        </View>
      </>
    </TouchableHighlight>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderRadius: 15,
    marginHorizontal: margins.window_hor,
  },
  text: {
    color: theme.colors.white,
  },
  flex: {
    flex: 1,
  },
  progressBar: {
    marginTop: 10,
    height: 35,
    borderRadius: 5,
  },
  progressStatusContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: 10,
  },
}));

export default Deck;
