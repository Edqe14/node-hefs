class Link {
  name: string;
  link: string;

  constructor(config: ILink) {
    const { name, link } = config;

    this.name = name;
    this.link = link;
  }

  toString(): string {
    return this.link;
  }
}

export default Link;
export interface ILink {
  name: string;
  link: string;
}
