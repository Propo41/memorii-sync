import { makeStyles } from '@rneui/themed';
import React from 'react';
import { KeyboardTypeOptions, TextInput } from 'react-native';
import { FF_REGULAR } from '../theme/typography';
import { toFont, toSize } from '../helpers/scaling';
import { useTranslation } from 'react-i18next';

type TextInputProps = {
  name: string; // name of the text input, ie email/name/phone etc
  value: string;
  placeholder?: string;
  onChange: (name: string, text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  mt?: number;
};

export default function CustomTextInput({ name, value, onChange, keyboardType, placeholder, mt }: TextInputProps) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <TextInput
      style={{ ...styles.input, marginTop: mt || 0 }}
      onChangeText={(text: string) => {
        onChange(name, text);
      }}
      value={value || ''}
      placeholder={placeholder || t('screens.misc.text_input_placeholder')}
      keyboardType={keyboardType || 'default'}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  input: {
    height: toSize(55),
    borderWidth: 0,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 20,
    fontFamily: FF_REGULAR,
    fontSize: toFont(16),
    backgroundColor: theme.colors.lightAsh,
  },
}));
