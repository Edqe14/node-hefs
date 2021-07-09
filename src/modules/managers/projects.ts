import Project, { ProjectConfig } from '../classes/project';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Events from '../../helpers/eventTypes';
import Helpers from '../../helpers';
import { format } from 'util';

declare interface ProjectManager {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
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

  private async hydrate() {
    if (!this.client.options.disableHydration) await this.fetch('', true);

    this._ready = true;
    this.emit('ready');
  }

  resolve(project: ProjectResolvable): Project | undefined {
    if (project instanceof Project) return project;
    return this.cache.get(project.toString());
  }

  resolveID(project: ProjectResolvable): string | undefined {
    if (typeof project === 'string' || typeof project === 'number') {
      return this.cache.get(project.toString())?.id;
    }
    return project?.id;
  }

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

  create(projectConfig: ProjectConfig, cache = true): Promise<Project> {
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
}

export default ProjectManager;
