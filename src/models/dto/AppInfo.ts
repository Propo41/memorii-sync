export class AppInfo {
  version: string;
  instructionUrl: string;
  storeUrl: string;
  updatedAt: number;
  updateUrl: string;

  constructor(version: string, instructionUrl: string, storeUrl: string, updateUrl: string, updatedAt: number) {
    this.version = version;
    this.instructionUrl = instructionUrl;
    this.storeUrl = storeUrl;
    this.updatedAt = updatedAt;
    this.updateUrl = updateUrl;
  }

  static transform(_appInfo: InstanceType<typeof AppInfo>): AppInfo {
    const appInfo = new AppInfo(_appInfo.version, _appInfo.instructionUrl, _appInfo.storeUrl, _appInfo.updateUrl, _appInfo.updatedAt);

    return appInfo;
  }
}
