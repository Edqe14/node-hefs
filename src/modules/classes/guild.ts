import Client from '../client';
import Helpers from '../../helpers';
import Partial from '../../helpers/partial';
import Project from './project';
import { format } from 'util';

class Guild {
  id?: string;
  name: string;
  description: string;
  image: string;
  invite: string;
  debutDate: Date;
  color?: string;
  projects?: Project[];
  client: Client;

  constructor(config: GuildConfig, client: Client) {
    // eslint-disable-next-line object-curly-newline
    const { _id, name, description, image, invite, debutDate, color } = config;

    this.client = client;
    this.id = _id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.invite = format(this.client.endpoints.invite, invite);
    this.debutDate = new Date(debutDate);
    this.color = color;
  }

  edit(guildConfig: Partial<GuildConfig>): Promise<Guild> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!guildConfig || typeof guildConfig !== 'object') {
          const error = new TypeError('Guild config must be an object');
          return reject(error);
        }

        const url = format(this.client.endpoints.guilds, this.id);
        const res = await this.client.axios
          .patch(url, guildConfig)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        // eslint-disable-next-line object-curly-newline
        const { _id, name, description, image, invite, debutDate, color } =
          res.data as GuildConfig;
        this.id = _id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.invite = format(this.client.endpoints.invite, invite);
        this.debutDate = new Date(debutDate);
        this.color = color;

        return resolve(this);
      });
    });
  }

  delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        const url = format(this.client.endpoints.guilds, this.id);
        const res = await this.client.axios.delete(url).catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        this.client.guilds.cache.delete(this.id as string);
        return resolve();
      });
    });
  }

  toString(): string {
    return this.invite;
  }
}

export default Guild;
export interface GuildConfig {
  _id?: string;
  name: string;
  description: string;
  image: string;
  invite: string;
  debutDate: Date;
  color?: string;
}
