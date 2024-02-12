import BottomSheet, { BottomSheetBackdrop, useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { Button, makeStyles, Text, useTheme } from '@rneui/themed';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Linking, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { _Appearance, _Set } from '../models/dto';
import CustomTextInput from './CustomTextInput';
import { margins } from '../config';
import { FF_REGULAR } from '../theme/typography';
import { toFont, toSize } from '../helpers/scaling';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { showToast } from './CustomToast';
import { rawToCards } from '../helpers/utility';
import { instructionUrl } from '../config/conf';

type CreateSetDialog = {
  onAddSetClick: (set: _Set) => boolean;
  dialogOpen: { open: boolean; editing: boolean; set?: _Set | null };
  closeDialog: () => void;
};

type InputFields = {
  name?: string;
  bgColor?: string;
  fgColor?: string;
};

type File = {
  name: string;
  size?: number;
  uri: string;
  type: string;
};

const CreateSetDialog = ({ onAddSetClick, closeDialog, dialogOpen }: CreateSetDialog) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['63%'], []);
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [input, setInput] = useState<InputFields>({});
  const [doc, setDoc] = useState<File | null>(null);
  const [isKeyboardShowing, setKeyboardShowing] = useState(false);

  useEffect(() => {
    if (dialogOpen.set) {
      const { name, appearance } = dialogOpen.set;
      const { bgColor, fgColor } = appearance;
      setInput({ name, bgColor, fgColor });
    }
  }, [dialogOpen.set]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShowing(true);
    });

    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShowing(false);
    });
  }, []);

  if (dialogOpen.open) {
    bottomSheetRef.current?.snapToIndex(0);
  }

  const onDialogClose = () => {
    bottomSheetRef.current?.close();
    closeDialog();
  };

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

  const onInputChange = (name: string, text: string) => {
    setInput({
      ...input,
      [name]: text,
    });
  };

  const pickDocument = async () => {
    const response = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (response.type === 'cancel') {
      return;
    }

    const { name, size, uri } = response;
    const nameParts = name.split('.');
    const fileType = nameParts[nameParts.length - 1];
    const fileToUpload: File = {
      name: name,
      size: size,
      uri: uri,
      type: 'application/' + fileType,
    };

    setDoc(fileToUpload);
  };

  const onCardUpload = async () => {
    await pickDocument();
  };

  const onCreateClick = async () => {
    try {
      if (!doc) {
        showToast('No card file uploaded.', 'error');
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(doc.uri);
      const cards = await rawToCards(fileContent);

      const { name, bgColor, fgColor } = input;
      if (!name || !bgColor || !fgColor) {
        showToast('Please input all the fields', 'error');
        return;
      }

      const apperance = new _Appearance(bgColor, fgColor);
      const newSet = new _Set(name, apperance);
      newSet.cards = cards;

      if (onAddSetClick(newSet) !== false) {
        showToast(`Total ${cards.length} cards uploaded!`);
        onDialogClose();
        Keyboard.dismiss();
        setInput({});
        setDoc(null);
      }
    } catch (error: any) {
      showToast(`Something went wrong: ${error.message}`);
      console.log('Error reading file:', error);
    }
  };

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.contentContainer}>
          <CustomTextInput
            name={'name'}
            value={input.name!}
            onChange={onInputChange}
            placeholder={t('screens.myDecks.input.enter_name')}
            mt={styles.mt1.marginTop}
          />
          <Text body1_bold style={{ color: theme.colors.text, ...styles.mt0 }}>
            {t('screens.myDecks.set_appr')}
          </Text>

          <CustomTextInput
            name={'bgColor'}
            value={input.bgColor!}
            onChange={onInputChange}
            placeholder={t('screens.myDecks.input.enter_bg_color')}
            mt={styles.mt1.marginTop}
          />
          <CustomTextInput
            name={'fgColor'}
            value={input.fgColor!}
            onChange={onInputChange}
            placeholder={t('screens.myDecks.input.enter_fg_color')}
            mt={styles.mt2.marginTop}
          />

          <Text body1_bold style={{ color: theme.colors.text, ...styles.mt0 }}>
            {t('screens.myDecks.cards')}
          </Text>

          <TouchableOpacity onPress={onCardUpload}>
            <View style={styles.uploadContainer}>
              {dialogOpen.editing ? (
                <Text body2 style={styles.textAlign}>
                  {t('screens.myDecks.input.updating_set_cards_alert')}
                </Text>
              ) : (
                <Text body2>{doc ? doc.name : t('screens.myDecks.input.upload_tsv_file')}</Text>
              )}
              <Icon name="file-upload" color={theme.colors.darkRed} size={toSize(25)} style={{ marginLeft: theme.spacing.md }} />
            </View>
          </TouchableOpacity>

          <Text
            style={styles.instructions}
            onPress={() => {
              Linking.openURL(instructionUrl);
            }}
            body2
          >
            {t('screens.myDecks.instructions')}
          </Text>
          <View style={styles.flexGrow} />

          <Button
            title={dialogOpen.editing ? t('screens.myDecks.update_set') : t('screens.myDecks.create_set')}
            titleStyle={styles.createBtnTitle}
            buttonStyle={styles.createBtn}
            // eslint-disable-next-line react-native/no-inline-styles
            containerStyle={{ ...styles.createBtnContainer, display: isKeyboardShowing ? 'none' : 'flex' }}
            onPress={onCreateClick}
          />
        </View>
      </TouchableWithoutFeedback>
    </BottomSheet>
  );
};

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: margins.window_hor + 10,
  },
  flexGrow: {
    flexGrow: 1,
  },
  textAlign: {
    textAlign: 'center',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.lightAsh,
    borderColor: theme.colors.black,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 5,
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginTop: theme.spacing.lg,
  },
  background: {
    backgroundColor: theme.colors.background,
  },
  instructions: {
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
    color: theme.colors.purple,
  },
  handle: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: theme.colors.ash,
  },
  mt0: {
    marginTop: theme.spacing.xl,
  },
  mt1: {
    marginTop: theme.spacing.lg,
  },
  mt2: {
    marginTop: theme.spacing.md,
  },
  createBtn: {
    borderRadius: 0,
    paddingVertical: 10,
    backgroundColor: theme.colors.purple,
  },
  createBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  createBtnTitle: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(18),
  },
}));

export default CreateSetDialog;
