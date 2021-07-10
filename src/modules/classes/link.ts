class Link {
  id: string;
  name: string;
  link: string;

  constructor(config: LinkConfig) {
    const { _id, name, link } = config;

    this.id = _id;
    this.name = name;
    this.link = link;
  }

  toString(): string {
    return this.id;
  }
}

export default Link;
export interface LinkConfig {
  _id: string;
  name: string;
  link: string;
}
