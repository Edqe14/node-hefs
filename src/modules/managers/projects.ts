import Project, { IProject } from '../classes/project';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Helpers from '../../helpers';

interface Events {
  ready: () => void;
}

declare interface ProjectManager {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  emit: <U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ) => boolean;
}

type ProjectResolvable = string | number | Project;

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
        if (!force && !id) return this.cache;
        if (id && !force && this.cache.has(id)) {
          return this.cache.get(id) as Project;
        }

        const url = `/projects/${id}`;
        const res = await this.client.axios.get(url);
        if (!Helpers.isOk(res.status)) {
          const error = new Error(
            `Error ${res.status} when fetching "${url}" endpoint`,
          );

          this.client.emit('error', error);
          return reject(error);
        }

        if (id) {
          const project = new Project(res.data as IProject, this.client);

          if (cache) this.cache.set(id, project);
          return resolve(project);
        }

        const projects = (res.data as IProject[])
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

  get ready(): boolean {
    return this._ready;
  }
}

export default ProjectManager;
