import React, { useCallback, useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetBackdrop, useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { makeStyles, Text, useTheme } from '@rneui/themed';
import { View } from 'react-native';
import AppButton from './AppButton';
import { Easing } from 'react-native-reanimated';

type ChangeLanguageDialogProp = {
  language: string;
  setLanguage: (language: string) => void;
  dialogOpen: boolean;
  setDialogOpen: (state: boolean) => void;
};

const ChangeLanguageDialog = ({ language, setLanguage, setDialogOpen, dialogOpen }: ChangeLanguageDialogProp) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['31%'], []);
  const { theme } = useTheme();
  const styles = useStyles();

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  if (dialogOpen) {
    bottomSheetRef.current?.snapToIndex(0);
  }

  const onDialogClose = (language?: string) => {
    console.log('onDialogClose: ', language);
    bottomSheetRef.current?.close();
    setDialogOpen(false);
    language ? setLanguage(language) : null;
  };

  const languages = ['English', 'Bangla'];

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
      onChange={handleSheetChanges}
      backgroundStyle={styles.background}
      handleStyle={styles.handle}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.contentContainer}>
        <Text body1_bold style={{ marginBottom: theme.spacing.lg, color: theme.colors.text }}>
          Choose language
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  handleIndicator: {
    backgroundColor: theme.colors.ash,
  },
}));

export default ChangeLanguageDialog;
