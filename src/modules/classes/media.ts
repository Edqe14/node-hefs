class Media {
  id: string;
  type: string;
  src?: string;
  message?: string;

  constructor(config: MediaConfig) {
    // eslint-disable-next-line object-curly-newline
    const { _id, type, src, message } = config;

    this.id = _id;
    this.type = type;
    this.src = src;
    this.message = message;
  }

  toString(): string {
    return this.src ?? this.message ?? this.type;
  }
}

export default Media;
export interface MediaConfig {
  _id: string;
  type: 'image' | 'video' | 'text';
  src?: string;
  message?: string;
}
