import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Submission from '../classes/submission';

interface Events {
  ready: () => void;
}

declare interface SubmissionManager {
  on: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  once: <U extends keyof Events>(event: U, listener: Events[U]) => this;
  emit: <U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ) => boolean;
}

type SubmissionResolvable = string | Submission;

class SubmissionManager extends EventEmitter {
  client: Client;
  cache: Collection<string, Submission>;

  private _ready = false;

  constructor(client: Client) {
    super();

    this.client = client;
    this.cache = new Collection();
  }

  resolve(submission: SubmissionResolvable): Submission | undefined {
    if (submission instanceof Submission) return submission;
    return this.cache.get(submission);
  }

  resolveID(submission: SubmissionResolvable): string | undefined {
    if (typeof submission === 'string') {
      return this.cache.get(submission)?.id;
    }
    return submission?.id;
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default SubmissionManager;
