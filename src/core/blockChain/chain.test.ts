import { Chain } from './chain';

describe('체인 검증', () => {
  let node: Chain = new Chain();
  it('체인 가져오기 확인', () => {
    console.log(node.getChain());
  });
  it('체인 길이 확인', () => {
    console.log(node.getLength());
  });
  it('체인 마지막 블록 확인', () => {
    console.log(node.getLatestBlock());
  });
  // it('체인 블록 추가 확인', () => {
  //   for (let i = 0; i < 20; i++) {
  //     node.addBlock([`블록 ${i}번째`]);
  //     console.log(node.getChain());
  //   }
  // });
});
