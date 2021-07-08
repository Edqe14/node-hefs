import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import Helpers from '../helpers';
import Managers from './managers';

type ClientOptions = {
  baseURL?: string;
  session?: string;
  headers?: Record<string, string>;
};

interface Events {
  ready: () => void;
  error: (error: Error) => void;
}

declare interface Client {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  emit: <U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ) => boolean;
}

class Client extends EventEmitter {
  axios: AxiosInstance;
  guilds: import('./managers/guilds').default;

  private _ready = false;

  constructor(options: ClientOptions) {
    super();

    const cookie = Helpers.buildCookies({
      'next-auth.session-token': options.session as string,
      ...(options.headers ?? {}),
    });

    this.axios = axios.create({
      baseURL: options.baseURL ?? 'https://holoen.fans/api',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Cookie: cookie,
      },
    });

    this.guilds = new Managers.GuildManager(this);
    this.waitAllReady();
  }

  private async waitAllReady() {
    await Promise.all(
      [this.guilds].map(
        (c) => new Promise((resolve) => c.once('ready', resolve as () => void)),
      ),
    );

    this._ready = true;
    this.emit('ready');
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default Client;
