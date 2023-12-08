import Icon from 'react-native-vector-icons/FontAwesome';
import { View } from 'react-native';
import { Button, Text, makeStyles } from '@rneui/themed';
import { toSize } from '../helpers/scaling';
import { useNavigation } from '@react-navigation/native';

const NavigationBar = () => {
  const styles = useStyles();
  const navigation = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Button title="Clear" type="clear" buttonStyle={styles.iconButton} onPress={onBackPress}>
        <Icon name="angle-left" style={styles.icon} size={toSize(30)} />
      </Button>
      <Text style={styles.text} h3>
        Sets
      </Text>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: toSize(15),
    backgroundColor: theme.colors.background,
  },
  icon: {
    color: theme.mode === 'dark' ? theme.colors.white : theme.colors.black,
  },
  text: {
    marginLeft: 20,
    color: theme.colors.purple,
  },
  iconButton: {
    padding: 0,
    paddingHorizontal: 0,
  },
}));

export default NavigationBar;
