import axios, { AxiosInstance } from 'axios';
import endpoints, { EndpointNames, Endpoints } from './endpoints';
import { EventEmitter } from 'events';
import Events from '../helpers/eventTypes';
import Helpers from '../helpers';
import Managers from './managers';
import Partial from '../helpers/partial';

export type ClientOptions = {
  baseURL?: string;
  session?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  disableHydration?: boolean;
  fetchSubmissionsOnStart?: boolean;
  endpoints?: Partial<Endpoints>;
};

declare interface Client {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  emit: <U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ) => boolean;
}

/**
 * Main client class
 *
 * ```typescript
 * const options = {
 *   session: 'copySessionTokenFromCookies',
 *   fetchSubmissionsOnStart: true, // Fetch and cache all submissions when creating new client. Default: false
 * }
 *
 * const client = new Client(options);
 * ```
 */
class Client extends EventEmitter {
  axios: AxiosInstance;
  options: ClientOptions;
  endpoints: Endpoints;
  guilds: import('./managers/guilds').default;
  projects: import('./managers/projects').default;
  submissions: import('./managers/submissions').default;
  admin: import('./managers/admin').default;

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
      endpoints: {},
      ...options,
    };

    this.endpoints = {
      ...endpoints,
      ...this.options.endpoints,
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
    this.admin = new Managers.AdminManager(this);
    this.waitAllReady();
  }

  /**
   * Initial code to make sure everything is ready.
   */
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

      if (!this.options.disableHydration) {
        submissions.flat().forEach((s) => {
          this.submissions.cache.set(s.id, s);
        });
      }
    }

    this._ready = true;
    this.emit('ready');
  }

  /**
   * Set an endpoint manually.
   * @param endpoint - Endpoint name/key
   * @param value - New value
   */
  setEndpoint(endpoint: EndpointNames, value: string): void {
    if (!endpoint || !value) {
      throw new Error('Endpoint or value must not be empty');
    }
    if (typeof endpoint !== 'string' || typeof value !== 'string') {
      throw new TypeError('Endpoint or value must be a string');
    }

    this.endpoints[endpoint] = value;
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default Client;
