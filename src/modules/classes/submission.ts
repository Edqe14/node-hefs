import Client from '../client';
import Helpers from '../../helpers';
import Project from './project';
import { format } from 'util';

class Submission {
  id: string;
  project?: Project;
  author?: string;
  srcIcon?: string;
  src?: string;
  type: string;
  message?: string;
  client: Client;

  constructor(config: SubmissionConfig, client: Client) {
    // eslint-disable-next-line object-curly-newline
    const { _id, project, author, srcIcon, type, src, message } = config;

    this.client = client;
    this.id = _id;
    this.project = client.projects.resolve(project.toString());
    this.author = author;
    this.srcIcon = srcIcon;
    this.src = src;
    this.type = type;
    this.message = message;
  }

  /**
   * Edit the submission metadata.
   * @param submissionConfig New submission metadata.
   * @returns A promise that resolves to a Submission object.
   */
  edit(submissionConfig: Partial<SubmissionConfig>): Promise<Submission> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        if (!submissionConfig || typeof submissionConfig !== 'object') {
          const error = new TypeError('Project config must be an object');
          return reject(error);
        }

        const submissions: SubmissionConfig[] = [
          {
            ...(submissionConfig as SubmissionConfig),
            _id: this.id,
          },
        ];

        const url = format(this.client.endpoints.projects, this.id);
        const res = await this.client.axios
          .patch(url, submissions)
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        // eslint-disable-next-line object-curly-newline
        const { _id, project, author, srcIcon, type, src, message } =
          res.data as SubmissionConfig;

        this.id = _id as string;
        this.project = this.client.projects.resolve(
          project.toString(),
        ) as Project;
        this.author = author;
        this.srcIcon = srcIcon;
        this.src = src;
        this.type = type;
        this.message = message;

        return resolve(this);
      });
    });
  }

  /**
   * Delete the submission.
   */
  delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        const url = format(this.client.endpoints.submissions, '');
        const res = await this.client.axios
          .delete(url, {
            data: [{ _id: this.id }],
          })
          .catch((e) => e);
        if (!res?.status || !Helpers.isOk(res?.status as number)) {
          return reject(res);
        }

        this.client.projects.cache.delete(this.id as string);
        return resolve();
      });
    });
  }

  toString(): string {
    return this.id;
  }
}

export default Submission;
export interface SubmissionConfig {
  _id: string;
  project: number;
  author?: string;
  srcIcon?: string;
  type: 'image' | 'video' | 'text';
  src?: string;
  message?: string;
}
