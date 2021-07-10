import Link, { LinkConfig } from './link';
import Media, { MediaConfig } from './media';
import Submission, { SubmissionConfig } from './submission';
import Client from '../client';
import Collection from '@discordjs/collection';
import Guild from './guild';
import Helpers from '../../helpers';
import ProjectSubmissions from '../collections/projectSubmissions';
import { format } from 'util';

class Project {
  id: string;
  url: string;
  status: 'ongoing' | 'past';
  guild: Guild;
  media?: Media[];
  title: string;
  shortDescription: string;
  description: string;
  links?: Link[];
  date: Date;
  flags?: string[];
  ogImage?: string;
  submissions: ProjectSubmissions;
  client: Client;

  constructor(config: ProjectConfig, client: Client) {
    // eslint-disable-next-line object-curly-newline
    const {
      _id,
      status,
      guild,
      media,
      title,
      shortDescription,
      description,
      links,
      date,
      flags,
      ogImage,
    } = config;

    this.client = client;
    this.id = _id?.toString();
    this.url = `${client.options.baseURL}/projects/${this.id}`;
    this.status = status;
    this.guild = client.guilds.resolve(guild) as Guild;
    this.media = media?.map((m) => new Media(m));
    this.title = title;
    this.shortDescription = shortDescription;
    this.description = description;
    this.links = links?.map((l) => new Link(l));
    this.date = new Date(date);
    this.flags = flags;
    this.ogImage = ogImage;
    this.submissions = new ProjectSubmissions(this.client, this.guild);
  }

  /**
   * Fetch related submissions from the API.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to a Collection of submission objects.
   */
  fetchSubmissions(cache = true): Promise<Collection<string, Submission>> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        const url = format(this.client.endpoints.submissions, this.id);
        const res = await this.client.axios.get(url).catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        const submissions = (res.data as SubmissionConfig[])
          .filter((s) => s._id !== undefined || s._id !== null)
          .map((s) => new Submission(s, this.client));
        if (cache) {
          submissions.forEach((s) => this.submissions.cache.set(s.id, s));
        }
        return resolve(new Collection(submissions.map((s) => [s.id, s])));
      });
    });
  }

  /**
   * Edit the project metadata.
   * @param projectConfig New project metadata.
   * @returns A promise that resolves to a Project object.
   */
  edit(projectConfig: Partial<ProjectConfig>): Promise<Project> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!projectConfig || typeof projectConfig !== 'object') {
          const error = new TypeError('Project config must be an object');
          return reject(error);
        }

        const url = format(this.client.endpoints.projects, this.id);
        const res = await this.client.axios
          .patch(url, projectConfig)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          status,
          guild,
          media,
          title,
          shortDescription,
          description,
          links,
          date,
          flags,
          ogImage,
        } = res.data as ProjectConfig;

        this.id = _id?.toString();
        this.url = `${this.client.options.baseURL}/projects/${this.id}`;
        this.status = status;
        this.guild = this.client.guilds.resolve(guild) as Guild;
        this.media = media?.map((m) => new Media(m));
        this.title = title;
        this.shortDescription = shortDescription;
        this.description = description;
        this.links = links?.map((l) => new Link(l));
        this.date = new Date(date);
        this.flags = flags;
        this.ogImage = ogImage;

        return resolve(this);
      });
    });
  }

  /**
   * Delete the project.
   */
  delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        const url = format(this.client.endpoints.projects, this.id);
        const res = await this.client.axios.delete(url).catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        this.client.projects.cache.delete(this.id as string);
        return resolve();
      });
    });
  }

  toString(): string {
    return this.id;
  }
}

export default Project;

export interface ProjectConfig {
  _id: number;
  status: 'ongoing' | 'past';
  guild: string;
  media?: MediaConfig[];
  title: string;
  shortDescription: string;
  description: string;
  links?: LinkConfig[];
  date: Date;
  flags?: string[];
  ogImage?: string;
}
