import Classes from '../src/modules/classes';
import Client from '../src/';
import Collection from '@discordjs/collection';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  session: process.env.SESSION,
  fetchSubmissionsOnStart: true,
});

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
      expect(guilds.fetch()).resolves.toBeInstanceOf(Collection);
      expect(
        guilds.fetch('hirD8XHurcDYFoNQOFh7p', true),
      ).resolves.toBeInstanceOf(Classes.Guild);
      expect(guilds.fetch('notExist')).rejects.toBeInstanceOf(Error);
    });
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
      expect(projects.fetch()).resolves.toBeInstanceOf(Collection);
      expect(
        projects.fetch('hirD8XHurcDYFoNQOFh7p', true),
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
    })
  });

  describe('submissions manager', () => {
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
  });
});
