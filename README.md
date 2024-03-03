## Requirements

- node v16.13.0

## Docs

- using custom fonts:
  https://blog.logrocket.com/adding-custom-fonts-react-native/

- possible headers

Premium1 means the user can add audio and also 2 meanings for each card
```
const possible_headers = [
  { header: 'front', required: true },
  { header: 'type', required: false },
  { header: 'back', required: true },
  { header: 'example', required: false },
  { header: 'back2', required: false, needPremium1: true },
  { header: 'audio', required: false, needPremium2: true },
];
```

- code for options menu: 

```
<Menu opened={menuOpen} onBackdropPress={() => setMenuOpen(false)}>
            <MenuTrigger
              children={
                <Button
                  type="clear"
                  buttonStyle={styles.optionsIconBtn}
                  containerStyle={{
                    borderRadius: 30,
                  }}
                  onPress={() => setMenuOpen(!menuOpen)}
                >
                  <SimpleLineIcons name="options-vertical" style={styles.optionsIcon} size={toSize(18)} />
                </Button>
              }
            />
            <MenuOptions>
              <MenuOption
                onSelect={() => alert(`Delete`)}
                style={{
                  padding: 10,
                }}
              >
                <Text style={{ color: theme.colors.black, fontFamily: FF_REGULAR, fontSize: toFont(15) }}>Reset Cards</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
          ```

- sm2: https://cs310.hashnode.dev/spaced-repetition-flashcards-nodejs

## Issues faced

- View is not a jsx component: https://github.com/eslint/eslint/issues/15802
