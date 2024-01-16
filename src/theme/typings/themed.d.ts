import '@rneui/themed';
import { RecursivePartial } from '@rneui/themed/dist/config/theme';

declare module '@rneui/themed' {
  export interface TextProps {
    bold?: boolean;
    head1?: boolean;
    head2?: boolean;
    head3?: boolean;
    body1?: boolean;
    body1_bold?: boolean;
    body2?: boolean;
    body2_bold?: boolean;
    color?: string; // @todo obsolte. safely remove it
  }

  export interface Colors {
    orange?: string;
    purple?: string;
    ash?: string;
    lightAsh?: string;
    violetShade?: string;
    text?: string;
    grey?: string;
    touchable?: string;
    green?: string;
    darkRed?: string;
    transparent?: string;
    cardsBackground?: string;
  }

  export interface ComponentTheme {
    Text: Partial<TextProps>;
    lightColors: RecursivePartial<Colors>;
  }
}
