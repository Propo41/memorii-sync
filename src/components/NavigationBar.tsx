import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { View, ViewStyle } from 'react-native';
import { Button, Text, makeStyles } from '@rneui/themed';
import { toSize } from '../helpers/scaling';
import { useNavigation } from '@react-navigation/native';
import React, { ReactElement } from 'react';
import { margins } from '../config';

type NavigationBarProps = {
  title: string;
  style?: ViewStyle;
  optionsMenu?: ReactElement;
};

const NavigationBar = ({ title, style,  optionsMenu }: NavigationBarProps) => {
  const styles = useStyles();
  const navigation = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={{ ...styles.container, ...style, alignItems: 'center' }}>
      <Button
        type="clear"
        buttonStyle={styles.iconButton}
        containerStyle={{
          borderRadius: 30,
        }}
        onPress={onBackPress}
      >
        <Icon name="navigate-before" style={styles.icon} size={toSize(30)} />
      </Button>
      <Text style={styles.text} head3>
        {title}
      </Text>
      <View style={{ flexGrow: 1 }} />
      {optionsMenu}
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: theme.colors.transparent,
    paddingHorizontal: margins.window_hor_w_icon,
  },
  icon: {
    color: theme.mode === 'dark' ? theme.colors.white : theme.colors.black,
  },
  text: {
    marginLeft: 20,
    alignSelf: 'center',
    color: theme.colors.purple,
  },
  iconButton: {
    padding: 0,
    paddingHorizontal: 0,
  },
}));

export default NavigationBar;
