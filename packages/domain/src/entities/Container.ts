export class Container {
  constructor(
    public readonly id: string,
    public name: string,
    public description?: string,
    public type?: string,
    public updatedAt: string = new Date().toISOString(),
    public deviceId?: string,
    public deletedAt?: string,
    public parentId?: string
  ) {}

  touch(deviceId: string) {
    this.updatedAt = new Date().toISOString();
    this.deviceId = deviceId;
  }
}
