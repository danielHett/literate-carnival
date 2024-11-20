import { LRUCache } from 'lru-cache';

const options = {
  max: 1000,
};

export const cache = new LRUCache(options);
