class Media {
  type: string;
  src?: string;
  message?: string;

  constructor(config: IMedia) {
    // eslint-disable-next-line object-curly-newline
    const { type, src, message } = config;

    this.type = type;
    this.src = src;
    this.message = message;
  }

  toString(): string {
    return this.src ?? this.message ?? this.type;
  }
}

export default Media;
export interface IMedia {
  type: 'image' | 'video' | 'text';
  src?: string;
  message?: string;
}
