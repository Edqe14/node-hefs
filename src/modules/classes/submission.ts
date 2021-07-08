import Client from '../client';
import Project from './project';

class Submission {
  id: string;
  project: Project;
  author?: string;
  srcIcon?: string;
  src?: string;
  type: string;
  message?: string;
  client: Client;

  constructor(config: ISubmission, client: Client) {
    // eslint-disable-next-line object-curly-newline
    const { _id, project, author, srcIcon, type, src, message } = config;

    this.client = client;
    this.id = _id;
    this.project = client.projects.resolve(project.toString()) as Project;
    this.author = author;
    this.srcIcon = srcIcon;
    this.src = src;
    this.type = type;
    this.message = message;
  }
}

export default Submission;
export interface ISubmission {
  _id: string;
  project: number;
  author?: string;
  srcIcon?: string;
  type: 'image' | 'video' | 'text';
  src?: string;
  message?: string;
}
