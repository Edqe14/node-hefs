const endpoints = {
  whitelist: '/admin/setting?s=whitelist',
  projects: '/projects/%s',
  guilds: '/guilds/%s',
  submissions: '/submissions/%s',
  invite: 'https://discord.gg/%s',
};

export default endpoints;
export type EndpointNames =
  | 'whitelist'
  | 'projects'
  | 'guilds'
  | 'submissions'
  | 'invite';
export type Endpoints = {
  [key in EndpointNames]: string;
};
