import Project, { ProjectConfig } from '../classes/project';
import Client from '../client';
import Collection from '@discordjs/collection';
import Guild from '../classes/guild';
import { ProjectResolvable } from 'modules/managers/projects';

type OmitConfig = {
  _id: never;
  guild: never;
};

class GuildProjects {
  client: Client;
  guild: Guild;
  cache: Collection<string, Project>;

  constructor(
    client: Client,
    guild: Guild,
    entries?: readonly (readonly [string, Project])[] | null | undefined,
  ) {
    this.client = client;
    this.guild = guild;
    this.cache = new Collection(entries);
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
   * Create a new project.
   * @param projectConfig Project metadata.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Project object.
   */
  create(
    projectConfig: Omit<ProjectConfig, keyof OmitConfig>,
    cache = true,
  ): Promise<Project> {
    return new Promise((resolve, reject) => {
      if (!projectConfig || typeof projectConfig !== 'object') {
        const error = new TypeError('Project config must be an object');
        return reject(error);
      }

      return Promise.resolve().then(async () => {
        const config = {
          ...projectConfig,
          guild: this.guild.id,
        };

        try {
          const res = await this.client.projects.create(config, cache);
          this.cache.set(res.id, res);

          return resolve(res);
        } catch (e) {
          return reject(e);
        }
      });
    });
  }
}

export default GuildProjects;
