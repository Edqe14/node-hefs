import Classes from '../src/modules/classes';
import Client from '../src/';
import dotenv from 'dotenv';
import { join } from 'path';
import Project from '../src/modules/classes/project';
dotenv.config({
  path: join(__dirname, '.env'),
});

jest.setTimeout(30000);
const client = new Client({
  session: process.env.SESSION,
  // fetchSubmissionsOnStart: true,
});

// Skip several tests if session and fetchSubmissionsOnStart is not set
const skip = client.options.fetchSubmissionsOnStart && !!client.options.session;
const skipDescribeIfUnavailable = (bool = skip) => bool ? describe : describe.skip;
const skipTestIfUnavailable = client.options.session ? it : it.skip;

// eslint-disable-next-line prettier/prettier
const waitReady = new Promise((resolve) => client.once('ready', resolve as () => void));

describe('client', () => {
  it('should emit ready event', async () => {
    await waitReady;
    expect(client.ready).toBe(true);
  });

  describe('guild manager', () => {
    const guilds = client.guilds;
    it('should hydrated the cache', async () => {
      await waitReady;
      expect(guilds.cache.size).not.toBe(0);
    });

    it('should resolve to guild object', async () => {
      await waitReady;
      expect(guilds.resolve('notExist')).toBeUndefined();
      expect(guilds.resolve('hirD8XHurcDYFoNQOFh7p')).toBeInstanceOf(
        Classes.Guild,
      );
    });

    it('should fetch a guild', async () => {
      await waitReady;
      expect(guilds.fetch()).resolves.toBeInstanceOf(Array);
      expect(
        guilds.fetch('hirD8XHurcDYFoNQOFh7p', true),
      ).resolves.toBeInstanceOf(Classes.Guild);
      expect(guilds.fetch('notExist')).rejects.toBeInstanceOf(Error);
    });

    // TODO: test guild create
    // TODO: test guild update
    // TODO: test guild delete
  });

  describe('project manager', () => {
    const projects = client.projects;
    it('should hydrated the cache', async () => {
      await waitReady;
      expect(projects.cache.size).not.toBe(0);
    });

    it('should resolve to project object', async () => {
      await waitReady;
      expect(projects.resolve('notExist')).toBeUndefined();
      expect(projects.resolve('1')).toBeInstanceOf(
        Classes.Project,
      );
    });

    it('should fetch a project', async () => {
      await waitReady;
      expect(projects.fetch()).resolves.toBeInstanceOf(Array);
      expect(
        projects.fetch('1', true),
      ).resolves.toBeInstanceOf(Classes.Project);
      expect(projects.fetch('notExist')).rejects.toBeInstanceOf(Error);
    });

    describe('project property', () => {
      it('should include links', async () => {
        await waitReady;

        const project = projects.cache.first();
        expect(project!.links![0]).toBeInstanceOf(Classes.Link);
      });

      it('should include media', async () => {
        await waitReady;

        const project = projects.cache.first();
        expect(project!.media![0]).toBeInstanceOf(Classes.Media);
      });
    });

    let proj: Project;
    const projPromise = new Promise((resolve) => {
      if (skip) return resolve(1);
      skipTestIfUnavailable('should create a new project', async () => {
        await waitReady;
  
        const newProj = await projects.create({
          title: 'Test Node API',
          status: 'ongoing',
          guild: 'hirD8XHurcDYFoNQOFh7p',
          shortDescription: 'Hello from Node',
          description: '',
          date: new Date(),
        }).then((p) => {
          proj = p;
          return p;
        }).finally(resolve as () => void);

        expect(newProj).toBeInstanceOf(Classes.Project);
        expect(newProj.title).toEqual('Test Node API');
      });
    })

    const editPromise = new Promise((resolve) => {
      if (skip) return resolve(1);
      skipTestIfUnavailable('should edit a project', async () => {
        await waitReady;
        await projPromise;
  
        const editedProj = await proj?.edit({
          description: 'Edited from Node!'
        }).finally(resolve as () => void);
  
        expect(editedProj).toBeInstanceOf(Classes.Project);
        expect(editedProj.description).toEqual('Edited from Node!');
      });
    });

    skipTestIfUnavailable('should delete a project', async () => {
      await waitReady;
      await projPromise;
      await editPromise;

      await proj?.delete();

      expect(projects.cache.has(proj.id as string)).toBe(false);
    });
  });

  // Skip submissions test if fetching on start is disabled
  skipDescribeIfUnavailable()('submissions manager', () => {
    const submissions = client.submissions;
    it('should hydrated the cache', async () => {
      await waitReady;
      expect(submissions.cache.size).not.toBe(0);
    });

    it('should resolve a submission', async () => {
      await waitReady;
      expect(
        submissions.resolve('60a3d1b209398d299039ee23'),
      ).toBeInstanceOf(Classes.Submission);
      expect(submissions.resolve('notExist')).toBeUndefined();
    });

    // TODO: test submission create
    // TODO: test submission edit
    // TODO: test submission delete
  });

  skipDescribeIfUnavailable(!!client.options.session)('admin manager', () => {
    const admin = client.admin;
    it('should hydrated the cache', async () => {
      await waitReady;
      expect(admin.cache.size).not.toBe(0);
    });

    it('should resolve whitelist setting', async () => {
      await waitReady;
      expect(
        admin.resolve('whitelist'),
      ).toBeInstanceOf(Classes.Submission);
      expect(admin.resolve('notExist')).toBeUndefined();
    });

    it('should fetch whitelist setting', async () => {
      await waitReady;
      expect(
        admin.fetch('whitelist', true),
      ).resolves.toBeInstanceOf(Classes.Setting);
    });
  });
});
