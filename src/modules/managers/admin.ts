import Setting, { SettingConfig } from '../classes/setting';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Events from '../../helpers/eventTypes';
import Helpers from '../../helpers';

export type PropertyType = 'whitelist';
export type SettingResolvable = string | Setting;

declare interface AdminManager {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  emit: <U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ) => boolean;
}

class AdminManager extends EventEmitter {
  client: Client;
  cache: Collection<string, Setting>;

  private _ready = false;

  constructor(client: Client) {
    super();

    this.client = client;
    this.cache = new Collection();

    this.hydrate();
  }

  private async hydrate() {
    if (!this.client.options.disableHydration && this.client.options.session) {
      await this.fetch('whitelist', true);
    }

    this._ready = true;
    this.emit('ready');
  }

  resolve(setting: SettingResolvable): Setting | undefined {
    if (setting instanceof Setting) return setting;
    return this.cache.get(setting);
  }

  resolveID(setting: SettingResolvable): string | undefined {
    if (typeof setting === 'string') {
      return this.cache.get(setting as string)?.id;
    }
    return setting?.id;
  }

  fetch(property: PropertyType, force = false, cache = true): Promise<Setting> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!property) {
          const error = new TypeError('Property must not be undefined');
          return reject(error);
        }

        if (!force && this.cache.has(property)) {
          return resolve(this.cache.get(property) as Setting);
        }

        const url = this.client.endpoints[property];
        if (!url) {
          const error = new Error('Unknown property');
          return reject(error);
        }

        const res = await this.client.axios.get(url as string);
        if (!Helpers.isOk(res.status)) {
          const error = new Error(
            `Error ${res.status} when fetching "${url}" endpoint`,
          );

          this.client.emit('error', error);
          return reject(error);
        }

        const guild = new Setting(res.data as SettingConfig, this.client);

        if (cache) this.cache.set(property, guild);
        return resolve(guild);
      });
    });
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default AdminManager;
