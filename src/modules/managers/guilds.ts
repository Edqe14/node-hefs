import Guild, { IGuild } from '../classes/guild';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';

interface Events {
  ready: () => void;
}

declare interface GuildManager {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  emit: <U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ) => boolean;
}

type GuildResolvable = string | Guild;

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

  private async hydrate() {
    await this.fetch('', true);

    this._ready = true;
    this.emit('ready');
  }

  resolve(guild: GuildResolvable): Guild | undefined {
    if (guild instanceof Guild) return guild;
    return this.cache.get(guild);
  }

  resolveID(guild: GuildResolvable): string | undefined {
    if (typeof guild === 'string') return this.cache.get(guild)?.id;
    return guild?.id;
  }

  fetch(
    id = '',
    force = false,
    cache = true,
  ): Promise<Guild | Collection<string, Guild>> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!force && !id) return this.cache;
        if (id && !force && this.cache.has(id)) {
          return this.cache.get(id) as Guild;
        }

        const url = `/guilds/${id}`;
        const res = await this.client.axios.get(url);
        if (res.status !== 200) {
          const error = new Error(
            `Error ${res.status} when fetching "${url}" endpoint`,
          );

          this.client.emit('error', error);
          return reject(error);
        }

        if (id) {
          const guild = new Guild(res.data as IGuild);

          if (cache) this.cache.set(id, guild);
          return resolve(guild);
        }

        const guilds = (res.data as IGuild[]).map((g) => new Guild(g));
        guilds.forEach((g) => this.cache.set(g.id as string, g));
        return resolve(this.cache);
      });
    });
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default GuildManager;
