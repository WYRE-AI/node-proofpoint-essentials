import type { SenderLists } from '../../src/types/index.js';

export const senderListsGet: SenderLists = {
  allow_list: ['good@example.com'],
  block_list: ['bad.example.com'],
};
