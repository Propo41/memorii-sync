import '@rneui/themed';
import { RecursivePartial } from '@rneui/themed/dist/config/theme';

declare module '@rneui/themed' {
  export interface TextProps {
    bold?: boolean;
    body1?: boolean;
    body2?: boolean;
  }

  export interface Colors {
    orange?: string;
    purple?: string;
    ash?: string;
    lightAsh?: string;
    violetShade?: string;
  }

  export interface ComponentTheme {
    Text: Partial<TextProps>;
    lightColors: RecursivePartial<Colors>;
  }
}
