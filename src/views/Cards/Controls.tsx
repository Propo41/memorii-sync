import React, { View } from 'react-native';
import { FAB, makeStyles, useTheme } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { toSize } from '../../helpers/scaling';
import { iconSize } from '../../config';

type ControlsProps = {
  onPressCross: () => void;
  onPressRotate: () => void;
  onPressCheck: () => void;
  onPlayAudio: () => void;
  hasAudio: boolean;
  isAudioPlaying: boolean;
};

const Controls = ({ onPressCross, onPressRotate, onPressCheck, onPlayAudio, hasAudio, isAudioPlaying }: ControlsProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.controls}>
      <FAB size="large" color="white" icon={<EntypoIcons name="cross" color="#FF3636" size={iconSize.sm} />} onPress={onPressCross} />
      {hasAudio && (
        <FAB
          size="large"
          icon={<EntypoIcons name="sound" color={theme.colors.white} size={iconSize.sm} />}
          color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
          style={{ marginLeft: theme.spacing.lg }}
          onPress={onPlayAudio}
          disabled={isAudioPlaying}
        />
      )}
      <FAB
        style={{ marginLeft: theme.spacing.lg }}
        size="large"
        icon={{
          name: 'rotate-90-degrees-ccw',
          color: 'white',
        }}
        onPress={onPressRotate}
      />
      <FAB
        size="large"
        style={{ marginLeft: theme.spacing.lg }}
        icon={<MaterialCommunityIcons name="check-bold" color="#4FF960" size={iconSize.sm} />}
        color="white"
        onPress={onPressCheck}
      />
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));

export default Controls;
