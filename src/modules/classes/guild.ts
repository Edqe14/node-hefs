import Client from '../client';
import Project from './project';
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

  constructor(config: IGuild, client: Client) {
    // eslint-disable-next-line object-curly-newline
    const { _id, name, description, image, invite, debutDate, color } = config;

    this.client = client;
    this.id = _id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.invite = `https://discord.gg/${invite}`;
    this.debutDate = new Date(debutDate);
    this.color = color;
  }

  toString(): string {
    return this.invite;
  }
}

export default Guild;
export interface IGuild {
  _id?: string;
  name: string;
  description: string;
  image: string;
  invite: string;
  debutDate: Date;
  color?: string;
}
