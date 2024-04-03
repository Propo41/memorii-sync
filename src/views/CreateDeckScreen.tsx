import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, ScrollView, View } from 'react-native';
import { Button, Dialog, FAB, Overlay, Text, makeStyles, useTheme } from '@rneui/themed';
import NavigationBar from '../components/NavigationBar';
import { _Appearance, _Deck, _Set } from '../models/dto';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../components/CustomTextInput';
import { margins } from '../config';
import Entypo from 'react-native-vector-icons/Entypo';
import { toFont, toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FF_BOLD, FF_REGULAR } from '../theme/typography';
import * as SystemNavigationBar from 'expo-navigation-bar';
import CreateSetDialog from '../components/CreateSetDialog';
import { showToast } from '../components/CustomToast';
import { FirebaseApp } from '../models/FirebaseApp';
import auth from '@react-native-firebase/auth';
import { kickUser } from '../helpers/utility';
import { NavProps } from '../config/routes';
import ColorPicker from 'react-native-wheel-color-picker';
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet';
import { Cache } from '../models/Cache';

type InputFields = {
  id?: string;
  name?: string;
  trackColor?: string;
  bgColor?: string;
  fgColor?: string;
};

type DummyDeckItemProps = {
  name?: string;
  bgColor?: string;
  fgColor?: string;
  trackColor?: string;
  mt?: number;
  onEditColorPress: (type: string) => void;
};

const DummyDeckItem = ({ name, bgColor, fgColor, trackColor, mt, onEditColorPress }: DummyDeckItemProps) => {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View style={{ ...styles.dummyDeckContainer, backgroundColor: bgColor || theme.colors.ash, marginTop: mt || 0 }}>
      <FAB
        size="small"
        icon={<Entypo name="palette" color={theme.colors.white} size={toSize(15)} />}
        color={theme.colors.black}
        style={styles.dummyDeckFab1}
        onPress={() => {
          onEditColorPress('bgColor');
        }}
      />
      <Text head3 style={styles.dummyDeckText}>
        {name || t('screens.myDecks.input.enter_name')}
      </Text>
      <View style={{ ...styles.dummyDeckContainer2, backgroundColor: trackColor || theme.colors.white }}>
        <FAB
          size="small"
          icon={<Entypo name="palette" color={theme.colors.white} size={toSize(15)} />}
          color={theme.colors.black}
          style={styles.dummyDeckFab2}
          onPress={() => {
            onEditColorPress('fgColor');
          }}
        />
        <FAB
          size="small"
          icon={<Entypo name="palette" color={theme.colors.white} size={toSize(15)} />}
          color={theme.colors.black}
          style={styles.dummyDeckFab3}
          onPress={() => {
            onEditColorPress('trackColor');
          }}
        />

        <View
          style={{
            ...styles.dummyDeckContainer3,
            backgroundColor: fgColor || theme.colors.grey1,
          }}
        />
      </View>
    </View>
  );
};

type SetItemProps = {
  name: string;
  mt?: number;
  mb?: number;
  totalCards: number;
  onDeleteClick: () => void;
  onEditClick: () => void;
};

const SetItem = ({ name, totalCards, mt, mb, onEditClick, onDeleteClick }: SetItemProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={{ ...styles.setContainer, marginTop: mt || 0, marginBottom: mb || 0 }}>
      <Text>{name}</Text>
      <Text> : ({totalCards})</Text>
      <View style={styles.flexGrow} />
      <Button radius={'sm'} type="solid" buttonStyle={styles.iconButton} onPress={onEditClick}>
        <Icon name="edit" color={theme.colors.purple} size={toSize(25)} />
      </Button>
      <Button radius={'sm'} type="solid" buttonStyle={styles.iconButton} onPress={onDeleteClick}>
        <Icon name="delete" color={theme.colors.orange} size={toSize(25)} />
      </Button>
    </View>
  );
};

type DialogState = {
  open: boolean;
  editing: boolean;
  set?: null | _Set;
};

export default function CreateDeckScreen({ navigation, route }: NavProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [input, setInput] = useState<InputFields>({
    fgColor: '#A5A5A5',
    bgColor: '#595959',
    trackColor: '#FFFFFF',
  });
  const [sets, setSets] = useState<_Set[]>([]);
  const [dialogPayload, setDialogPayload] = useState<DialogState>({
    open: false,
    editing: false,
    set: null,
  });
  const [isKeyboardShowing, setKeyboardShowing] = useState(false);
  const [showColorModal, setShowColorModal] = useState({
    open: false,
    type: 'bgColor',
  });
  const [currentColor, setCurrentColor] = useState('#ffffff'); // Initial color state
  const pickerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isPremium, setIsPremium] = useState(false); // Initial color state
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [routeParams, setRouteParams] = useState<_Deck>();

  const onColorChangeComplete = (color: string) => {
    setCurrentColor(color);
    onInputChange(showColorModal.type, color);
  };

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }

    FirebaseApp.getInstance()
      .getUser(currentUser.uid)
      .then((user) => {
        if (!user) return;
        setIsPremium(user.isPremium);
      });
  }, []);

  useEffect(() => {
    // @ts-expect-error don't know how to fix it
    if (route?.params?.deck) {
      setIsEditing(true);
      // @ts-expect-error don't know how to fix it
      setRouteParams(route.params.deck);

      // @ts-expect-error don't know how to fix it
      const { id, name, appearance, sets } = route?.params?.deck as _Deck;
      setInput({ id: id, name, bgColor: appearance.bgColor, fgColor: appearance.fgColor, trackColor: appearance.trackColor });
      setSets(sets || []);
    }

    SystemNavigationBar.setBackgroundColorAsync(theme.colors.purple!);

    Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShowing(true);
    });

    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShowing(false);
    });
    return () => {
      SystemNavigationBar.setBackgroundColorAsync(theme.mode === 'dark' ? theme.colors.violetShade! : theme.colors.white);
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (dialogPayload.open) {
        setDialogPayload({ open: false, editing: false });
        bottomSheetRef.current?.close();
      } else {
        navigation.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [dialogPayload.open]);

  const onInputChange = (name: string, text: string) => {
    setInput({
      ...input,
      [name]: text,
    });
  };

  const onSetAdded = (set: _Set) => {
    if (!dialogPayload.editing) {
      const isSetExist = sets.some((_set) => _set.name === set.name);
      if (isSetExist) {
        showToast(t('screens.myDecks.createDecks.duplicate_set_name'), 'error');
        return false;
      }
    }

    let updatedSets = [...sets, set];
    if (dialogPayload.editing) {
      updatedSets = sets.map((_set) => {
        return _set.id === set.id ? set : _set;
      });
    }

    setSets(updatedSets);
    return true;
  };

  const onCreateDeck = async () => {
    const { name, bgColor, fgColor, trackColor } = input;

    if (!name || !bgColor || !fgColor || !trackColor) {
      showToast(t('screens.myDecks.createDecks.validation_error'), 'error');
      return;
    }

    if (sets.length === 0) {
      showToast(t('screens.myDecks.createDecks.no_sets'), 'error');
      return;
    }

    const newDeck = new _Deck(name, new _Appearance(bgColor, fgColor, trackColor));
    newDeck.sets = sets;

    const currentUser = auth().currentUser;
    if (!currentUser) {
      kickUser(navigation, t);
      return;
    }

    if (isEditing && routeParams) {
      newDeck.createdAt = routeParams.createdAt;
      newDeck.id = routeParams.id;

      await Cache.getInstance().updateDeck(input.id!, newDeck);
      showToast(t('screens.myDecks.createDecks.edited_deck'));
      navigation.goBack();
      return;
    }

    const deckId = await Cache.getInstance().createDeck(newDeck);
    if (deckId) {
      // not awaiting here since if user is offline, the ui will be stuck here
      FirebaseApp.getInstance().addDeckToUser(deckId, currentUser.uid);
    } else {
      showToast(t('screens.myDecks.createDecks.deck_creation_error'), 'error');
      return;
    }

    showToast(t('screens.myDecks.createDecks.added_deck'));
    navigation.goBack();
  };

  const onDeleteDeck = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    await FirebaseApp.getInstance().deleteUserDeck(currentUser.uid, input.id!)
    await Cache.getInstance().deleteDeck(input.id!);

    navigation.goBack();

    setDeleteAlertVisible(!deleteAlertVisible);
    showToast(t('screens.myDecks.createDecks.deleted_deck'));
  };

  const onEditColorPress = (type: string) => {
    setShowColorModal({
      open: true,
      type: type,
    });
  };

  const onAddSetClick = () => {
    if (!isPremium && sets.length >= 3) {
      showToast(t('screens.myDecks.createDecks.set_limit_error'), 'error');
      return;
    }

    setDialogPayload({
      open: true,
      editing: false,
    });

    bottomSheetRef.current?.snapToIndex(0);
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title={t('screens.myDecks.create_deck')} />
        <View style={{ marginTop: toSize(theme.spacing.sm), paddingHorizontal: margins.window_hor }}>
          <CustomTextInput name={'name'} value={input.name!} onChange={onInputChange} placeholder={t('screens.myDecks.input.enter_name')} />
          <Text body1_bold style={{ color: theme.colors.text, ...styles.mt0 }}>
            {t('screens.myDecks.deck_appr')}
          </Text>

          <DummyDeckItem
            name={input.name}
            mt={theme.spacing.xl}
            bgColor={input.bgColor}
            trackColor={input.trackColor}
            fgColor={input.fgColor}
            onEditColorPress={onEditColorPress}
          />

          <View style={styles.setTitle}>
            <Text body1_bold style={{ color: theme.colors.text }}>
              {t('screens.myDecks.sets')}
            </Text>

            <View style={styles.flexGrow} />

            <FAB
              size="small"
              icon={<Entypo name="plus" color={theme.colors.white} size={toSize(18)} />}
              color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
              style={{ marginLeft: theme.spacing.lg }}
              onPress={onAddSetClick}
            />
          </View>

          {sets.length === 0 && (
            <Text body2 style={{ color: theme.colors.text }}>
              {t('screens.myDecks.empty_sets')}
            </Text>
          )}

          {sets.length > 0 &&
            sets.map((set, index) => {
              return (
                <SetItem
                  name={set.name}
                  totalCards={set.cards.length}
                  key={index}
                  mt={index === 0 ? 10 : 7}
                  mb={index === sets.length - 1 ? 70 : 0}
                  onEditClick={() => {
                    // open dialog
                    bottomSheetRef.current?.snapToIndex(0);
                    setDialogPayload({
                      open: true,
                      editing: true,
                      set: set,
                    });
                  }}
                  onDeleteClick={() => {
                    const remainingSets = sets.filter((_set) => _set.name !== set.name);
                    setSets(remainingSets);
                  }}
                />
              );
            })}
        </View>
      </ScrollView>
      {isEditing && (
        <Button
          title={t('screens.myDecks.delete_deck_btn')}
          titleStyle={styles.createBtnTitle}
          buttonStyle={{ ...styles.createBtn, backgroundColor: theme.colors.orange }}
          // eslint-disable-next-line react-native/no-inline-styles
          containerStyle={{ ...styles.deleteBtnContainer, display: isKeyboardShowing ? 'none' : 'flex' }}
          onPress={() => setDeleteAlertVisible(true)}
        />
      )}
      <Button
        title={isEditing ? t('screens.myDecks.edit_deck_btn') : t('screens.myDecks.create_deck_btn')}
        titleStyle={styles.createBtnTitle}
        buttonStyle={styles.createBtn}
        // eslint-disable-next-line react-native/no-inline-styles
        containerStyle={{ ...styles.createBtnContainer, width: isEditing ? '50%' : '100%', display: isKeyboardShowing ? 'none' : 'flex' }}
        onPress={onCreateDeck}
      />
      <CreateSetDialog
        dialogPayload={dialogPayload}
        isPremium={isPremium}
        closeDialog={() => {
          setDialogPayload({ open: false, editing: false });
          bottomSheetRef.current?.close();
        }}
        onAddSetClick={onSetAdded}
        bottomSheetRef={bottomSheetRef}
      />
      <Overlay
        isVisible={showColorModal.open}
        onBackdropPress={() => {
          setShowColorModal({
            ...showColorModal,
            open: false,
          });
        }}
        overlayStyle={styles.overlayStyle}
      >
        <View style={{ ...styles.modalContainer }}>
          <ColorPicker
            ref={pickerRef}
            color={currentColor}
            onColorChangeComplete={onColorChangeComplete}
            onColorChange={onColorChangeComplete}
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
      <Dialog isVisible={deleteAlertVisible} onBackdropPress={() => setDeleteAlertVisible(!deleteAlertVisible)}>
        <Text style={styles.alertTitle}>{t('screens.myDecks.alerts.delete_title')}</Text>
        <Text body1>{t('screens.myDecks.alerts.delete_subtitle')}</Text>
        <Dialog.Actions>
          <Dialog.Button title={t('screens.myDecks.alerts.dialog_confirm')} titleStyle={styles.alertActionButtonPos} onPress={onDeleteDeck} />
          <Dialog.Button
            title={t('screens.myDecks.alerts.dialog_cancel')}
            titleStyle={styles.alertTitle}
            onPress={() => setDeleteAlertVisible(!deleteAlertVisible)}
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  loading: {
    width: '70%',
    height: '50%',
    alignSelf: 'center',
    marginBottom: 200,
  },
  rootContainer: {
    height: '100%',
  },
  alertTitle: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
  },
  alertActionButtonPos: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
    color: theme.colors.orange,
  },
  flexGrow: { flexGrow: 1 },
  setTitle: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  setContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 17,
    backgroundColor: theme.colors.lightAsh,
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
  iconButton: {
    backgroundColor: theme.colors.lightAsh,
    padding: 0,
    paddingVertical: 3,
  },
  createBtn: {
    borderRadius: 0,
    paddingVertical: 15,
    backgroundColor: theme.colors.purple,
  },
  createBtnContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 0,
  },
  deleteBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    borderRadius: 0,
  },
  createBtnTitle: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(18),
  },
  modalContainer: {
    padding: toSize(20),
    height: toSize(220),
  },
  overlayStyle: {
    borderRadius: 20,
    backgroundColor: theme.colors.ash,
  },
  dummyDeckContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
  },
  dummyDeckFab1: {
    marginRight: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  dummyDeckText: {
    color: theme.colors.white,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  dummyDeckFab2: {
    marginLeft: theme.spacing.lg,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  dummyDeckFab3: {
    marginRight: theme.spacing.lg,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  dummyDeckContainer3: {
    width: 150,
    height: 50,
    borderRadius: 10,
  },
  dummyDeckContainer2: { height: 50, marginHorizontal: 10, borderRadius: 10 },
}));
