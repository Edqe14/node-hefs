import Link, { ILink } from './link';
import Media, { IMedia } from './media';
import Submission, { ISubmission } from './submission';
import Client from '../client';
import Guild from './guild';
import Helpers from '../../helpers';

class Project {
  id?: string;
  url: string;
  status: 'ongoing' | 'past';
  guild?: Guild;
  media?: Media[];
  title: string;
  shortDescription: string;
  description: string;
  links?: Link[];
  date: Date;
  flags?: string[];
  ogImage?: string;
  submissions?: Submission[];
  client: Client;

  constructor(config: IProject, client: Client) {
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
    this.guild = client.guilds.resolve(guild);
    this.media = media?.map((m) => new Media(m));
    this.title = title;
    this.shortDescription = shortDescription;
    this.description = description;
    this.links = links?.map((l) => new Link(l));
    this.date = new Date(date);
    this.flags = flags;
    this.ogImage = ogImage;
  }

  fetchSubmissions(cache = true): Promise<Submission[]> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        const url = `/submissions/${this.id}`;
        const res = await this.client.axios.get(url);
        if (!Helpers.isOk(res.status)) {
          const error = new Error(
            `Error ${res.status} when fetching "${url}" endpoint`,
          );

          this.client.emit('error', error);
          return reject(error);
        }

        const submissions = (res.data as ISubmission[])
          .filter((s) => s._id !== undefined || s._id !== null)
          .map((s) => new Submission(s, this.client));
        if (cache) {
          submissions.forEach((s) => this.submissions?.push(s));
        }
        return resolve(submissions);
      });
    });
  }

  toString(): string {
    return this.url;
  }
}

export default Project;

export interface IProject {
  _id?: number;
  status: 'ongoing' | 'past';
  guild: string;
  media?: IMedia[];
  title: string;
  shortDescription: string;
  description: string;
  links?: ILink[];
  date: Date;
  flags?: string[];
  ogImage?: string;
}
