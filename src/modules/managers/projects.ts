import Project, { ProjectConfig } from '../classes/project';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Events from '../../helpers/eventTypes';
import Helpers from '../../helpers';
import { format } from 'util';

declare interface ProjectManager {
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

export type ProjectResolvable = string | number | Project;

class ProjectManager extends EventEmitter {
  client: Client;
  cache: Collection<string, Project>;

  private _ready = false;

  constructor(client: Client) {
    super();

    this.client = client;
    this.cache = new Collection();

    this.hydrate();
  }

  /**
   * Initial code for cache hydration.
   * @fires ProjectManager#ready
   */
  private async hydrate() {
    if (!this.client.options.disableHydration) await this.fetch('', true);

    this._ready = true;
    this.emit('ready');
  }

  /**
   * Resolve a resolvable to a matching object.
   * @param project Project resolvable to resolve.
   * @returns Project object or `undefined`.
   */
  resolve(project: ProjectResolvable): Project | undefined {
    if (project instanceof Project) return project;
    return this.cache.get(project.toString());
  }

  /**
   * Resolve a resolvable to a matching object ID.
   * @param project Project resolvable to resolve.
   * @returns Project ID or `undefined`.
   */
  resolveID(project: ProjectResolvable): string | undefined {
    if (typeof project === 'string' || typeof project === 'number') {
      return this.cache.get(project.toString())?.id;
    }
    return project?.id;
  }

  /**
   * Fetch data from cache or send a request the API endpoint if not cached.
   * @param property Project ID. Default `''`.
   * @param force Force fetch from the API endpoint. Default `false`.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Project object or an Array of Project objects if no ID is provided.
   */
  fetch(id = '', force = false, cache = true): Promise<Project | Project[]> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!force && !id) return resolve(this.cache.array());
        if (id && !force && this.cache.has(id)) {
          return resolve(this.cache.get(id) as Project);
        }

        const url = format(this.client.endpoints.projects, id);
        const res = await this.client.axios.get(url).catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        if (id) {
          const project = new Project(res.data as ProjectConfig, this.client);

          if (cache) this.cache.set(id, project);
          return resolve(project);
        }

        const projects = (res.data as ProjectConfig[])
          .filter((p) => p._id !== undefined || p._id !== null)
          .map((p) => new Project(p, this.client));
        if (cache) {
          // eslint-disable-next-line prettier/prettier
          projects.forEach((p) => this.cache.set(p.id as string, p));
        }

        return resolve(projects);
      });
    });
  }

  /**
   * Create a new project.
   * @param projectConfig Project metadata.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Project object.
   */
  create(
    projectConfig: Omit<ProjectConfig, '_id'>,
    cache = true,
  ): Promise<Project> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!projectConfig || typeof projectConfig !== 'object') {
          const error = new TypeError('Project config must be an object');
          return reject(error);
        }

        const url = format(this.client.endpoints.projects, '');
        const res = await this.client.axios
          .post(url, projectConfig)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        const project = new Project(res.data as ProjectConfig, this.client);
        if (cache) this.cache.set(project.id as string, project);
        return resolve(project);
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

export default ProjectManager;
