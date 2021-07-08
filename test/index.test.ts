import Classes from '../src/modules/classes';
import Client from '../src/';
import Collection from '@discordjs/collection';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  session: process.env.SESSION,
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

    it('should fetch guild', async () => {
      await waitReady;
      expect(guilds.fetch()).resolves.toBeInstanceOf(Collection);
      expect(
        guilds.fetch('hirD8XHurcDYFoNQOFh7p', true),
      ).resolves.toBeInstanceOf(Classes.Guild);
      expect(guilds.fetch('notExist')).rejects.toBeInstanceOf(Error);
    });
  });
});
