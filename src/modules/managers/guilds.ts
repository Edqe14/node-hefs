import Guild, { GuildConfig } from '../classes/guild';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Events from '../../helpers/eventTypes';
import Helpers from '../../helpers';
import { format } from 'util';

declare interface GuildManager {
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

export type GuildResolvable = string | Guild;

class GuildManager extends EventEmitter {
  client: Client;
  cache: Collection<string, Guild>;

  private _ready = false;

  constructor(client: Client) {
    super();

    this.client = client;
    this.cache = new Collection();

    this.hydrate();
  }

  /**
   * Initial code for cache hydration.
   * @fires GuildManager#ready
   */
  private async hydrate() {
    if (!this.client.options.disableHydration) await this.fetch('', true);

    this._ready = true;
    this.emit('ready');
  }

  /**
   * Resolve a resolvable to a matching object.
   * @param guild Guild resolvable to resolve.
   * @returns Guild object or `undefined`.
   */
  resolve(guild: GuildResolvable): Guild | undefined {
    if (guild instanceof Guild) return guild;
    return this.cache.get(guild);
  }

  /**
   * Resolve a resolvable to a matching object ID.
   * @param guild Guild resolvable to resolve.
   * @returns Guild ID or `undefined`.
   */
  resolveID(guild: GuildResolvable): string | undefined {
    if (typeof guild === 'string') return this.cache.get(guild)?.id;
    return guild?.id;
  }

  /**
   * Fetch data from cache or send a request the API endpoint if not cached.
   * @param property Guild ID. Default `''`.
   * @param force Force fetch from the API endpoint. Default `false`.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Guild object or an Array of Guild objects if no ID is provided.
   */
  fetch(id = '', force = false, cache = true): Promise<Guild | Guild[]> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!force && !id) return resolve(this.cache.array());
        if (id && !force && this.cache.has(id)) {
          return resolve(this.cache.get(id) as Guild);
        }

        const url = format(this.client.endpoints.guilds, id);
        const res = await this.client.axios.get(url).catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        if (id) {
          const guild = new Guild(res.data as GuildConfig, this.client);

          if (cache) this.cache.set(id, guild);
          return resolve(guild);
        }

        const guilds = (res.data as GuildConfig[])
          .filter((g) => g._id !== undefined || g._id !== null)
          .map((g) => new Guild(g, this.client));
        if (cache) {
          guilds.forEach((g) => this.cache.set(g.id as string, g));
        }
        return resolve(guilds);
      });
    });
  }

  /**
   * Create a new guild.
   * @param guildConfig Guild metadata.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Guild object.
   */
  create(guildConfig: Omit<GuildConfig, '_id'>, cache = true): Promise<Guild> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!guildConfig || typeof guildConfig !== 'object') {
          const error = new TypeError('Guild config must be an object');
          return reject(error);
        }

        const url = format(this.client.endpoints.guilds, '');
        const res = await this.client.axios
          .post(url, guildConfig)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        const guild = new Guild(res.data as GuildConfig, this.client);
        if (cache) this.cache.set(guild.id as string, guild);
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

export default GuildManager;
