import Setting, { SettingConfig } from '../classes/setting';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Events from '../../helpers/eventTypes';
import Helpers from '../../helpers';

export type PropertyType = 'whitelist';
export type SettingResolvable = string | Setting;

declare interface AdminManager {
  /**
   * @event
   */
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  /**
   * @event
   */
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  /**
   * @event
   */
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

  /**
   * Initial code for cache hydration.
   * @fires AdminManager#ready
   */
  private async hydrate() {
    if (!this.client.options.disableHydration && this.client.options.session) {
      await this.fetch('whitelist', true);
    }

    this._ready = true;
    this.emit('ready');
  }

  /**
   * Resolve a resolvable to a matching object.
   * @param setting Setting resolvable to resolve.
   * @returns Setting object or `undefined`.
   */
  resolve(setting: SettingResolvable): Setting | undefined {
    if (setting instanceof Setting) return setting;
    return this.cache.get(setting);
  }

  /**
   * Resolve a resolvable to a matching object ID.
   * @param setting Setting resolvable to resolve.
   * @returns Setting ID or `undefined`.
   */
  resolveID(setting: SettingResolvable): string | undefined {
    if (typeof setting === 'string') {
      return this.cache.get(setting as string)?.id;
    }
    return setting?.id;
  }

  /**
   * Fetch data from cache or send a request the API endpoint if not cached.
   * @param property Property name.
   * @param force Force fetch from the API endpoint. Default `false`.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Setting object.
   */
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

  /**
   * Promise that will be resolved when the manager is ready.
   */
  awaitReady(): Promise<void> {
    return new Promise((resolve) => {
      if (this._ready) return resolve();
      return this.once('ready', resolve);
    });
  }

  /**
   * A boolean indicating whether client is ready.
   */
  get ready(): boolean {
    return this._ready;
  }
}

export default AdminManager;
