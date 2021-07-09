class Link {
  id: string;
  name: string;
  link: string;

  constructor(config: ILink) {
    const { _id, name, link } = config;

    this.id = _id;
    this.name = name;
    this.link = link;
  }

  toString(): string {
    return this.link;
  }
}

export default Link;
export interface ILink {
  _id: string;
  name: string;
  link: string;
}
