export class Appearance {
  bgColor?: string;
  fgColor?: string;
  trackColor?: string;

  constructor(bgColor?: string, fgColor?: string, trackColor?: string) {
    this.bgColor = bgColor;
    this.fgColor = fgColor;
    this.trackColor = trackColor;
  }

  static transform(_appearance: InstanceType<typeof Appearance>): Appearance {
    const appearance = new Appearance(_appearance.bgColor, _appearance.fgColor, _appearance.trackColor);
    return appearance;
  }
}
