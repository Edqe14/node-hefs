import Submission, { SubmissionConfig } from '../classes/submission';
import Client from '../client';
import Collection from '@discordjs/collection';
import { EventEmitter } from 'events';
import Helpers from '../../helpers';
import { format } from 'util';

export type SubmissionResolvable = string | Submission;

class SubmissionManager extends EventEmitter {
  client: Client;
  cache: Collection<string, Submission>;

  private _ready = false;

  constructor(client: Client) {
    super();

    this.client = client;
    this.cache = new Collection();
  }

  /**
   * Resolve a resolvable to a matching object.
   * @param submission Submission resolvable to resolve.
   * @returns Submission object or `undefined`.
   */
  resolve(submission: SubmissionResolvable): Submission | undefined {
    if (submission instanceof Submission) return submission;
    return this.cache.get(submission);
  }

  /**
   * Resolve a resolvable to a matching object ID.
   * @param submission Submission resolvable to resolve.
   * @returns Submission ID or `undefined`.
   */
  resolveID(submission: SubmissionResolvable): string | undefined {
    if (typeof submission === 'string') {
      return this.cache.get(submission)?.id;
    }
    return submission?.id;
  }

  /**
   * Create a new submission(s).
   * @param submissionConfig Submission(s) metadata.
   * @param cache Caches parsed object from response. Default `true`.
   * @returns A promise that resolves to an Array of submission objects.
   */
  create(
    submissionConfig:
      | Omit<SubmissionConfig, '_id'> // eslint-disable-line @typescript-eslint/indent
      | Omit<SubmissionConfig, '_id'>[], // eslint-disable-line @typescript-eslint/indent
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
        submissions.forEach(
          (s) =>
            // eslint-disable-next-line operator-linebreak,implicit-arrow-linebreak
            (s as SubmissionConfig)._id &&
            delete (s as Partial<SubmissionConfig>)._id,
        );

        const url = format(this.client.endpoints.submissions, '');
        const res = await this.client.axios
          .patch(url, submissions)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        const submissionsRes = (res.data as SubmissionConfig[]).map(
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

  /**
   * A boolean indicating whether client is ready.
   */
  get ready(): boolean {
    return this._ready;
  }

  /**
   * Ready event.
   * @event
   */
  static READY: 'ready' = 'ready';
}

export default SubmissionManager;
