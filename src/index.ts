// Export client & defaults
// eslint-disable-next-line object-curly-newline
export { default, default as Client, ClientOptions } from './modules/client';
export {
  default as EndpointDefaults,
  Endpoints,
  EndpointNames,
} from './modules/endpoints';

// Export Managers
export { default as Managers } from './modules/managers';
export {
  default as AdminManager,
  PropertyType,
  SettingResolvable,
} from './modules/managers/admin';
export {
  default as GuildManager,
  GuildResolvable,
} from './modules/managers/guilds';
export {
  default as ProjectManager,
  ProjectResolvable,
} from './modules/managers/projects';
export {
  default as SubmissionManager,
  SubmissionResolvable,
} from './modules/managers/submissions';

// Export collections
export { default as Collections } from './modules/collections';
export { default as GuildProjects } from './modules/collections/guildProjects';
export { default as ProjectSubmissions } from './modules/collections/projectSubmissions';

// Export classes
export { default as Classes } from './modules/classes';
export { default as Guild, GuildConfig } from './modules/classes/guild';
export { default as Link, LinkConfig } from './modules/classes/link';
export { default as Media, MediaConfig } from './modules/classes/media';
export { default as Project, ProjectConfig } from './modules/classes/project';
export { default as Setting, SettingConfig } from './modules/classes/setting';
export {
  default as Submission,
  SubmissionConfig,
} from './modules/classes/submission';

// Export Helpers
export { default as Helpers } from './helpers';
export { default as EventTypes } from './helpers/eventTypes';
export { default as buildCookies } from './helpers/buildCookies';
export { default as isOk } from './helpers/isOk';
