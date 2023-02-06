import { Chain } from './chain';

describe('UTXO 테스트', () => {
  let node: Chain = new Chain();
  it('miningBlock() 함수', () => {
    for (let i = 0; i < 10; i++) {
      node.miningBlock(
        '7C91020020680EFBE45B775942839479739294C686E15D70AD824E16822D7424'
      );
      console.log(node.getLatestBlock().data);
      console.log(node.getUnspentTxOuts());
    }
  });
});
