import { Block } from './block';
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from '@core/config';
import { UnspentTxOut } from '@core/transaction/unspentTxOut';
import { TxIn } from '@core/transaction/txin';
import { TxOut } from '@core/transaction/txout';
import { Transaction } from '@core/transaction/transaction';

export class Chain {
  private blockChain: Block[];
  private unspentTxOuts: IUnspentTxOut[];
  private transactionPool: ITransaction[];

  //블록체인에 최초 블록 넣어두기
  constructor() {
    this.blockChain = [Block.getGENESIS()];
    this.unspentTxOuts = [];
    this.transactionPool = [];
  }

  // 트랜잭션 풀을 반환
  public getTransactionPool(): ITransaction[] {
    return this.transactionPool;
  }

  // 트랜잭션 풀에 트랜잭션 추가 함수
  public appendTransactionPool(transaction: ITransaction) {
    this.transactionPool.push(transaction);
  }

  // 트랜잭션 풀 업데이트
  public updateTransactionPool(newBlock: IBlock) {
    let txPool: ITransaction[] = this.getTransactionPool();
    newBlock.data.forEach((tx: ITransaction) => {
      txPool = txPool.filter((txp) => txp.hash !== tx.hash);
    });

    this.transactionPool = txPool;
  }

  public getUnspentTxOuts(): IUnspentTxOut[] {
    return this.unspentTxOuts;
  }

  // UTXO 추가함수
  public appendUTXO(utxo: IUnspentTxOut[]) {
    this.unspentTxOuts.push(...utxo);
  }

  // 마이닝 블록
  public miningBlock(account: string): Failable<Block, string> {
    const txIn: ITxIn = new TxIn('', this.getLatestBlock().height + 1);
    const txOut: ITxOut = new TxOut(account, 50);
    const coinbaseTransaction: Transaction = new Transaction([txIn], [txOut]);
    const utxo = coinbaseTransaction.createUTXO();

    this.appendUTXO(utxo);

    return this.addBlock([coinbaseTransaction]);
  }

  public getChain(): Block[] {
    return this.blockChain;
  }

  public getLength(): number {
    return this.blockChain.length;
  }

  public getLatestBlock(): Block {
    return this.blockChain[this.blockChain.length - 1];
  }

  public addBlock(data: ITransaction[]): Failable<Block, string> {
    const previousBlock = this.getLatestBlock();
    const adjustmentBlock: Block = this.getAdjustmentBlock();
    const newBlock = Block.generateBlock(previousBlock, data, adjustmentBlock);
    const isValid = Block.isValidNewBlock(newBlock, previousBlock);

    if (isValid.isError) return { isError: true, value: '블록 추가 에러' };
    this.blockChain.push(newBlock);

    return { isError: false, value: newBlock };
  }

  // 체인 검증
  public isValidChain(chain: Block[]): Failable<undefined, string> {
    // 최초 블록 검사
    const genesis = chain[0];
    for (let i = 0; i < chain.length; i++) {
      const newBlock = chain[i];
      const previousBlock = chain[i - 1];
      const isVlaid = Block.isValidNewBlock(newBlock, previousBlock);
      if (isVlaid.isError) return { isError: true, value: isVlaid.value };
    }
    return { isError: false, value: undefined };
  }

  public replaceChain(receivedChain: Block[]): Failable<undefined, string> {
    const latestReceivedBlock: Block = receivedChain[receivedChain.length - 1];
    const latestBlock: Block = this.getLatestBlock();
    if (latestReceivedBlock.height === 0)
      return { isError: true, value: '받은 블록이 최초 블록' };
    if (latestReceivedBlock.height <= latestBlock.height)
      return { isError: true, value: '본인의 블록보다 길거나 같은 블록' };
    if (latestReceivedBlock.previousHash === latestBlock.hash)
      return { isError: true, value: '블럭이 하나 모자라다' };

    // 체인을 갱신
    this.blockChain = receivedChain;

    return { isError: false, value: undefined };
  }

  // 생성 시점으로 블록 높이 -10인 블록 구하기

  // 현재 높이값 < DIFFICULTY_ADJUSTMENT_INTERVAL: 최초 블록 반환
  // 현재 높이값 > DIFFICULTY_ADJUSTMENT_INTERVAL: -10번째 블록 반환
  public getAdjustmentBlock() {
    const currentLength = this.getLength();
    const adjustmentBlock: Block =
      this.getLength() < DIFFICULTY_ADJUSTMENT_INTERVAL
        ? Block.getGENESIS()
        : this.blockChain[currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL];

    return adjustmentBlock; // 최초 블록 또는 -10번째 블록
  }

  updateUTXO(tx: ITransaction) {
    const unspentTxOuts: UnspentTxOut[] = this.getUnspentTxOuts();
    const newUnspentTxOuts = tx.txOuts.map((txout, index) => {
      return new UnspentTxOut(tx.hash, index, txout.account, txout.amount);
    });
    const tmp = unspentTxOuts
      .filter((v: UnspentTxOut) => {
        const bool = tx.txIns.find((value: TxIn) => {
          return (
            value.txOutId === v.txOutId && v.txOutIndex === value.txOutIndex
          );
        });

        return bool;
      })
      .concat(newUnspentTxOuts);

    let unspentTmp: UnspentTxOut[] = [];
    const result = tmp.reduce((acc, uxto) => {
      const find = acc.find(({ txOutId, txOutIndex }) => {
        return txOutId === uxto.txOutId && txOutIndex === uxto.txOutIndex;
      });
      if (!find) acc.push(uxto);
      return acc;
    }, unspentTmp);

    this.unspentTxOuts = result;
  }
}
