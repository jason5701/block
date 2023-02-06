import { Block } from './block';
import { GENESIS } from '@core/config';

describe('Block 검증', () => {
  let newBlock: Block;

  it('블록 추가', () => {
    const data: string[] = ['Block #2'];
    // newBlock = Block.generateBlock(GENESIS, data);
    // console.log(newBlock);
  });

  it('블록 검증', () => {
    const isValidBlock = Block.isValidNewBlock(newBlock, GENESIS);
    if (isValidBlock.isError) {
      console.error(isValidBlock.isError);
      return expect(true).toBe(false);
    }
    expect(isValidBlock.isError).toBe(false);
  });
});
