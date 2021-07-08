import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import Helpers from '../helpers';
import Managers from './managers';
import Submission from './classes/submission';

type ClientOptions = {
  baseURL?: string;
  session?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  disableHydration?: boolean;
  fetchSubmissionsOnStart?: boolean;
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
  projects: import('./managers/projects').default;
  submissions: import('./managers/submission').default;
  options: ClientOptions;

  private _ready = false;

  constructor(options: ClientOptions = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('Options must be an object');
    }

    super();

    this.options = {
      baseURL: 'https://holoen.fans/api',
      headers: {},
      cookies: {},
      session: undefined,
      disableHydration: false,
      fetchSubmissionsOnStart: false,
      ...options,
    };

    const cookie = Helpers.buildCookies({
      'next-auth.session-token': this.options.session as string,
      ...this.options.headers,
    });

    this.axios = axios.create({
      baseURL: this.options.baseURL,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Cookie: cookie,
        ...this.options.headers,
      },
    });

    this.guilds = new Managers.GuildManager(this);
    this.projects = new Managers.ProjectManager(this);
    this.submissions = new Managers.SubmissionManager(this);
    this.waitAllReady();
  }

  private async waitAllReady() {
    await Promise.all(
      [this.guilds, this.projects].map(
        (c) => new Promise((resolve) => c.once('ready', resolve as () => void)),
      ),
    );

    if (!this.options.disableHydration) {
      this.guilds.cache.forEach((g) => {
        g.projects = this.projects.cache.filter((p) => p.guild === g).array();
      });
    }

    if (this.options.fetchSubmissionsOnStart) {
      const submissions = await Promise.all(
        this.projects.cache.array().map((p) => p.fetchSubmissions()),
      );

      // for (const projects of this.projects.cache.array()) {
      // }

      if (!this.options.disableHydration) {
        submissions.flat().forEach((s) => {
          this.submissions.cache.set(s.id, s);
        });
      }
    }

    this._ready = true;
    this.emit('ready');
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default Client;