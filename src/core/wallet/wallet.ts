import elliptic from 'elliptic';
import { SHA256 } from 'crypto-js';

const ec = new elliptic.ec('secp256k1');

export interface ReceivedTx {
  sender: string;
  received: string;
  amount: number;
  signature: elliptic.ec.Signature;
}

export class Wallet {
  public account: string;
  public publicKey: string;
  public balance: number;
  public signature: elliptic.ec.Signature;

  constructor(sender: string = '', signature: elliptic.ec.Signature) {
    this.publicKey = sender;
    this.account = Wallet.getAccount(this.publicKey);
    this.signature = signature;
    this.balance = 0;
  }

  static getVerify(receivedTx: ReceivedTx): Failable<undefined, string> {
    const { sender, received, amount, signature } = receivedTx;
    const data: [string, string, number] = [sender, received, amount];
    const hash: string = SHA256(data.join('')).toString();

    // 공개키로 서명 검증
    const keyPair = ec.keyFromPublic(sender, 'hex');
    const isVerify = keyPair.verify(hash, signature);
    if (!isVerify) return { isError: true, value: '서명 검증 실패' };
    return { isError: false, value: undefined };
  }

  static sendTransaction(receivedTx: ReceivedTx) {
    const verify = Wallet.getVerify(receivedTx);
    if (verify.isError) throw new Error(verify.value);

    const myWallet = new Wallet(receivedTx.sender, receivedTx.signature);
    console.log(myWallet);
  }

  static getAccount(publicKey: string): string {
    // Buffer에 있는 동안 바이너리 데이터를 조작할수 있기 때문
    return Buffer.from(publicKey).slice(26).toString();
  }

  // 코인 보내는 사람의 잔액을 확인하기 위한 함수
  static getBalance(account: string, unspentTxOuts: IUnspentTxOut[]): number {
    return unspentTxOuts
      .filter((v) => v.account === account)
      .reduce((acc, utxo) => {
        return acc + utxo.amount;
      }, 0);
    // 남아있는 잔액을 확인하고 확인한 잔액으로 보낼수 있는지 확인 하기 위해서
  }
}
