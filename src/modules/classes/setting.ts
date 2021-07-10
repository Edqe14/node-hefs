import Client from '../client';

class Setting {
  id: string;
  value: unknown | string[];
  client: Client;

  constructor(config: SettingConfig, client: Client) {
    const { _id, value } = config;

    this.client = client;
    this.id = _id;
    this.value = value;
  }

  toString(): string {
    return this.id;
  }
}

export default Setting;
export interface SettingConfig {
  _id: string;
  value: unknown;
}
