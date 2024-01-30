export class Appearance {
  bgColor: string;
  fgColor: string;
  trackColor?: string;
  textColor?: string;

  constructor(bgColor: string, fgColor: string, trackColor?: string, textColor?: string) {
    this.bgColor = bgColor;
    this.fgColor = fgColor;
    this.trackColor = trackColor;
    this.textColor = textColor || '#fff';
  }

  static transform(_appearance: InstanceType<typeof Appearance>): Appearance {
    const appearance = new Appearance(_appearance.bgColor, _appearance.fgColor, _appearance.trackColor, _appearance.textColor);
    return appearance;
  }
}
