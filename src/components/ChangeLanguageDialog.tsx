import BottomSheet, { BottomSheetBackdrop, useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { makeStyles, Text, useTheme } from '@rneui/themed';
import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Easing } from 'react-native-reanimated';

import AppButton from './AppButton';
import { Language } from '../config';
import { useTranslation } from 'react-i18next';

type ChangeLanguageDialogProp = {
  language: string;
  onLanguageChange: (language: Language) => void;
  dialogOpen: boolean;
  setDialogOpen: (state: boolean) => void;
};

const ChangeLanguageDialog = ({ language, onLanguageChange, setDialogOpen, dialogOpen }: ChangeLanguageDialogProp) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['31%'], []);
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();

  if (dialogOpen) {
    bottomSheetRef.current?.snapToIndex(0);
  }

  const onDialogClose = (language?: Language) => {
    bottomSheetRef.current?.close();
    setDialogOpen(false);

    language ? onLanguageChange(language) : null;
  };

  const languages: Language[] = ['English', 'Bangla'];

  const renderBackdrop = useCallback(
    (
      props // @ts-expect-error lib issue
    ) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={() => onDialogClose()} />,
    []
  );

  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 150,
    easing: Easing.linear,
  });

  return (
    // @ts-expect-error lib issue
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      animationConfigs={animationConfigs}
      snapPoints={snapPoints}
      backgroundStyle={styles.background}
      handleStyle={styles.handle}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.contentContainer}>
        <Text body1_bold style={{ marginBottom: theme.spacing.lg, color: theme.colors.text }}>
          {t('screens.settings.languageSelect')}
        </Text>
        {languages.map((lang, index) => (
          <AppButton
            key={index}
            mt={2}
            py={12}
            title={lang}
            color={lang === language ? theme.colors.purple : theme.colors.lightAsh}
            textColor={lang === language ? undefined : theme.colors.black}
            onPress={() => onDialogClose(lang)}
          />
        ))}
      </View>
    </BottomSheet>
  );
};

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  background: {
    backgroundColor: theme.colors.background,
  },
  handle: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: theme.colors.ash,
  },
}));

export default ChangeLanguageDialog;
