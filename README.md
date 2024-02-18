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
  { header: 'backLocale', required: false, needPremium1: true },
  { header: 'audio', required: false, needPremium2: true },
];
```

## Issues faced

- View is not a jsx component: https://github.com/eslint/eslint/issues/15802
