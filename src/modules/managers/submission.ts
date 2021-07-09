import Submission, { ISubmission } from '../classes/submission';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Helpers from '../../helpers';
import { format } from 'util';

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

  create(
    submissionConfig: ISubmission | ISubmission[],
    cache = true,
  ): Promise<Submission[]> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (
          /* eslint-disable prettier/prettier */
          !submissionConfig
          || typeof submissionConfig !== 'object'
          || !Array.isArray(submissionConfig)
          /* eslint-enable prettier/prettier */
        ) {
          const error = new TypeError(
            'Project config must be an object or an array',
          );
          return reject(error);
        }

        let submissions = submissionConfig;
        if (!Array.isArray(submissionConfig)) {
          submissions = [submissionConfig];
        }

        // Remove ID to ensure new submissions
        submissions.forEach((s) => s._id && delete s._id);

        const url = format(this.client.endpoints.submissions, '');
        const res = await this.client.axios
          .patch(url, submissions)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        const submissionsRes = (res.data as ISubmission[]).map(
          (s) => new Submission(s, this.client),
        );

        if (cache) {
          // eslint-disable-next-line prettier/prettier
          submissionsRes.forEach((s: Submission) => this.cache.set(s.id as string, s));
        }
        return resolve(submissionsRes);
      });
    });
  }

  get ready(): boolean {
    return this._ready;
  }
}

export default SubmissionManager;
