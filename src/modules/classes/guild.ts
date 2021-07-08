class Guild {
  id: string | undefined;
  name: string;
  description: string;
  image: string;
  invite: string;
  debut: Date;
  color: string | undefined;

  constructor(config: IGuild) {
    // eslint-disable-next-line object-curly-newline
    const { _id, name, description, image, invite, debutDate, color } = config;

    this.id = _id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.invite = `https://discord.gg/${invite}`;
    this.debut = new Date(debutDate);
    this.color = color;
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
