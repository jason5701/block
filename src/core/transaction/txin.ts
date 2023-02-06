import { TxOut } from './txout';

export class TxIn implements ITxIn {
  public txOutId: string;
  public txOutIndex: number;
  public signature?: string;

  constructor(txOutId: string, txOutIndex: number, signature?: string) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = signature;
  }

  static createTxIns(receivedTx: any, myUTXO: IUnspentTxOut[]) {
    let sum = 0;
    let txins: TxIn[] = [];
    for (let i = 0; i < myUTXO.length; i++) {
      const { txOutId, txOutIndex, amount } = myUTXO[i];
      const item: TxIn = new TxIn(txOutId, txOutIndex, receivedTx.signature);
      txins.push(item);
      sum += amount;
      5;
      if (sum >= receivedTx.amount) return { sum, txins };
    }
    return { sum, txins };
  }
}
