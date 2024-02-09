import React from 'react';
import { View } from 'react-native';
import { makeStyles, Text, useTheme } from '@rneui/themed';
import { toFont } from '../helpers/scaling';
import { FF_BOLD, FF_REGULAR } from '../theme/typography';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';

type CardProps = {
  text: string;
  type?: string;
  isTopView?: boolean;
  isCompleted?: boolean;
  example?: string | null;
};

export default function Card({ text, type, isTopView = true, isCompleted, example }: CardProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const textStyle = isTopView ? { ...styles.topViewText } : { ...styles.backViewText, marginTop: isCompleted ? '10%' : theme.spacing.md };

  return (
    <View>
      {isCompleted && <Icon name="check-circle" style={styles.statusIcon} size={20} />}
      <View style={styles.container}>
        <Text style={textStyle}>{text}</Text>
        {type && isTopView && <Text style={styles.type}>{type}</Text>}
        {!isTopView && example && (
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTextTitle}>{t('screens.cards.example')}</Text>
            <Markdown style={{ body: styles.exampleText }}>{example}</Markdown>
          </View>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  type: {
    fontSize: toFont(15),
    fontFamily: FF_REGULAR,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  statusIcon: {
    marginRight: theme.spacing.sm,
    color: theme.colors.green,
    position: 'absolute',
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
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'left',
    position: 'absolute',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  exampleContainer: {
    alignSelf: 'flex-start',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  exampleTextTitle: {
    fontSize: toFont(18),
    fontFamily: FF_BOLD,
    textAlign: 'left',
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 3,
  },
  exampleText: {
    fontSize: toFont(18),
    fontFamily: FF_REGULAR,
    textAlign: 'left',
    paddingLeft: 10,
    paddingRight: 10,
    color: theme.colors.purple,
  },
}));
