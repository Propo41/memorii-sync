import BottomSheet, { BottomSheetBackdrop, useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { Button, FAB, makeStyles, Overlay, Text, useTheme } from '@rneui/themed';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Linking, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { _Appearance, _Card, _Set } from '../models/dto';
import CustomTextInput from './CustomTextInput';
import { margins } from '../config';
import { FF_REGULAR } from '../theme/typography';
import { toFont, toSize } from '../helpers/scaling';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { showToast } from './CustomToast';
import { rawToCards } from '../helpers/utility';
import { INSTRUCTION_URL } from '../config/conf';
import ColorPicker from 'react-native-wheel-color-picker';
import Entypo from 'react-native-vector-icons/Entypo';

type CreateSetDialog = {
  onAddSetClick: (set: _Set) => boolean;
  dialogOpen: { open: boolean; editing: boolean; set?: _Set | null };
  closeDialog: () => void;
  bottomSheetRef: RefObject<BottomSheet>;
  isPremium: boolean;
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

type DummySetItemProps = {
  name?: string;
  bgColor?: string;
  fgColor?: string;
  mt: number;
  onEditColorPress: (type: string) => void;
};

const DummySetItem = ({ name, bgColor, fgColor, mt, onEditColorPress }: DummySetItemProps) => {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View
      style={{
        marginTop: mt || 0,
        ...styles.dsContainer,
      }}
    >
      <View style={{ ...styles.dsContainer2, backgroundColor: bgColor || theme.colors.lightAsh }}>
        <FAB
          size="small"
          icon={<Entypo name="palette" color={theme.colors.white} size={toSize(15)} />}
          color={theme.colors.black}
          style={styles.dsFab1}
          onPress={() => {
            onEditColorPress('bgColor');
          }}
        />

        <View
          style={{
            backgroundColor: fgColor || theme.colors.ash,
            ...styles.dsContainer3,
          }}
        >
          <FAB
            size="small"
            icon={<Entypo name="palette" color={theme.colors.white} size={toSize(15)} />}
            color={theme.colors.black}
            style={styles.dsFab2}
            onPress={() => {
              onEditColorPress('fgColor');
            }}
          />
          <Text head3 style={styles.dsText}>
            {name || t('screens.myDecks.input.enter_name')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const CreateSetDialog = ({ onAddSetClick, isPremium, closeDialog, dialogOpen, bottomSheetRef }: CreateSetDialog) => {
  const snapPoints = useMemo(() => ['63%'], []);
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [input, setInput] = useState<InputFields>({});
  const [doc, setDoc] = useState<File | null>(null);
  const [isKeyboardShowing, setKeyboardShowing] = useState(false);
  const [showColorModal, setShowColorModal] = useState({
    open: false,
    type: 'bgColor',
  });
  const [currentColor, setCurrentColor] = useState('#ffffff'); // Initial color state
  const pickerRef = useRef(null);

  const onColorChangeComplete = (color: string) => {
    setCurrentColor(color);
    onInputChange(showColorModal.type, color);
  };

  useEffect(() => {
    if (dialogOpen.set) {
      const { name, appearance } = dialogOpen.set;
      const { fgColor, bgColor } = appearance;

      setInput({ name, bgColor, fgColor });
    } else {
      setInput({ name: '', bgColor: '#595959', fgColor: '#A5A5A5' });
    }
  }, [dialogOpen.set]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShowing(true);
    });

    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShowing(false);
    });

    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  const onDialogClose = () => {
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
      if (!doc && !dialogOpen.set?.cards) {
        showToast('No card file uploaded.', 'error');
        return;
      }

      let cards: _Card[] | null = [];
      if (doc) {
        const fileContent = await FileSystem.readAsStringAsync(doc!.uri);
        cards = await rawToCards(fileContent, isPremium);

        if (!cards) {
          showToast('Please use allowed headers only.', 'error');
          return;
        }

        if (cards.length === 0) {
          showToast('No cards were found in the .tsv file', 'error');
          return;
        }
      }

      if (dialogOpen.set?.cards.length) {
        cards = dialogOpen.set.cards;
      }

      const { name, bgColor, fgColor } = input;
      if (!name) {
        showToast('Please input all the fields', 'error');
        return;
      }
      const appearance = new _Appearance(bgColor || '#595959', fgColor || '#A5A5A5');
      const newSet = new _Set(name, appearance);
      newSet.cards = cards;

      if (onAddSetClick(newSet) !== false) {
        dialogOpen.editing ? showToast(`Set updated!`) : showToast(`Total ${newSet.cards.length} cards uploaded!`);
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

  const onEditColorPress = (type: string) => {
    setShowColorModal({
      open: true,
      type: type,
    });
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

          <DummySetItem name={input.name} fgColor={input.fgColor} bgColor={input.bgColor} onEditColorPress={onEditColorPress} mt={theme.spacing.xl} />

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
              Linking.openURL(INSTRUCTION_URL);
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
      <Overlay
        isVisible={showColorModal.open}
        onBackdropPress={() => {
          setShowColorModal({
            ...showColorModal,
            open: false,
          });
        }}
        overlayStyle={styles.overlay}
      >
        <View style={{ ...styles.modalContainer }}>
          <ColorPicker
            ref={pickerRef}
            color={currentColor}
            onColorChange={onColorChangeComplete}
            onColorChangeComplete={onColorChangeComplete}
            thumbSize={30}
            sliderSize={40}
            noSnap={true}
            row={false}
            useNativeDriver={false}
            useNativeLayout={false}
            sliderHidden={true}
            swatches={false}
          />
        </View>
      </Overlay>
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
  modalContainer: {
    padding: toSize(20),
    height: toSize(220),
  },
  overlay: {
    borderRadius: 20,
    backgroundColor: theme.colors.ash,
  },
  dsContainer: {
    borderRadius: 10,
    height: 80,
  },
  dsContainer2: {
    height: 80,
    borderRadius: 10,
  },
  dsFab1: {
    marginRight: theme.spacing.lg,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  dsContainer3: {
    width: 190,
    height: 80,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  dsFab2: {
    marginLeft: theme.spacing.lg,
    zIndex: 10,
  },
  dsText: {
    color: theme.colors.white,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
  },
}));

export default CreateSetDialog;
