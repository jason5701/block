import { TxIn } from './txin';
import { TxOut } from './txout';
import { UnspentTxOut } from './unspentTxOut';
import { SHA256 } from 'crypto-js';

export class Transaction implements ITransaction {
  public hash: string;
  public txIns: ITxIn[];
  public txOuts: ITxOut[];

  constructor(txIns: TxIn[], txOut: TxOut[]) {
    this.txIns = txIns;
    this.txOuts = txOut;
    this.hash = this.createTransactionHash();
  }

  createTransactionHash(): string {
    const txOutContent: string = this.txOuts
      .map((v) => Object.values(v))
      .join('');
    const txInContent: string = this.txIns
      .map((v) => Object.values(v))
      .join('');

    return SHA256(txOutContent + txInContent).toString();
  }

  createUTXO(): UnspentTxOut[] {
    const utxo: UnspentTxOut[] = this.txOuts.map(
      (txout: TxOut, index: number) => {
        return new UnspentTxOut(this.hash, index, txout.account, txout.amount);
      }
    );

    return utxo;
  }

  static createTransaction(
    receivedTx: any,
    myUTXO: UnspentTxOut[]
  ): Transaction {
    const { sum, txins } = TxIn.createTxIns(receivedTx, myUTXO);
    const txouts: TxOut[] = TxOut.createTxOuts(sum, receivedTx);
    const tx = new Transaction(txins, txouts);
    return tx;
  }
}
