import { Wallet } from '@core/wallet/wallet';

export class TxOut implements ITxOut {
  public account: string;
  public amount: number;

  constructor(account: string, amount: number) {
    this.account = account;
    this.amount = amount;
  }

  // 인자값 : 보내는 게정, 받는 게정, 합, 보낼 코인 갯수
  // txOuts 배열을 추가할 함수
  static createTxOuts(sum:number, receivedTx: any): TxOut[] {
    // receivedTx.amount = 보낼 금액
    // receivedTx.sender = 보내는 사람의 공개키
    // receivedTx.received = 받는 사람 계정

    const { amount, sender, received} = receivedTx;
    const sendAccount: string = Wallet.getAccount(sender);
    
    // 받는 사람 txOut
    const receivedTxOut = new TxOut(received, amount);
    // 보내는 사람 txOut
    // sum 보내느 사람의 코인 합
    const senderTxOut = new TxOut(sendAccount, sum - amount);
    if(senderTxOut.amount <=0) return [receivedTxOut];

    return [receivedTxOut, senderTxOut]
  }
}
