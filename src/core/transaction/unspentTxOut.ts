export class UnspentTxOut implements IUnspentTxOut {
  public txOutId: string;
  public txOutIndex: number;
  public account: string;
  public amount: number;

  constructor(
    txOutId: string,
    txOutIndex: number,
    account: string,
    amount: number
  ) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.account = account;
    this.amount = amount;
  }

  // UTXO를 가져오는 함수
  // 인자값 전체 UTXO, 내계정
  static getMyUnspentTxOuts(account: string, unspentTxOut: UnspentTxOut[]) {
    return unspentTxOut.filter((utxo: UnspentTxOut) => {
      return utxo.account === account;
    });
  }
}
