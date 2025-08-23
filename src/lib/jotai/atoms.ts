import { atom } from 'jotai';

export const sLAtom = atom<number>(0);
export const priceAtom = atom<number>(0);

export const jokeAtom = atom({ setup: '', punchline: '' });

export const jokeObjAtom = atom(
  async (get) => get(jokeAtom),
  async (_get, set, url: string) => {
    const res = await fetch(url);
    set(jokeAtom, await res.json());
  }
);
