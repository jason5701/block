import { randomBytes } from 'crypto';
import elliptic from 'elliptic';
import { SHA256 } from 'crypto-js';
import fs from 'fs';
import path from 'path';

const dir = path.join(__dirname, '../data');

// elliptic 인스턴스 생성
const ec = new elliptic.ec('secp256k1');

export class Wallet {
  // 지갑 주소
  public account: string;
  // 지갑 개인키
  public privateKey: string;
  // 지갑 공개키
  public publicKey: string;
  // 암호화폐
  public balance: number;

  constructor(privateKey: string = '') {
    this.privateKey = privateKey || this.getPrivateKey();
    this.publicKey = this.getPublicKey();
    this.account = this.getAccount();
    this.balance = 0;
    Wallet.createWallet(this);
  }

  static createWallet(myWallet: Wallet) {
    // fs모듈을 사용해서 프로그램을 통해 지갑을 만들때 개인키를 안전하게 저장하는게 중요함
    // fs모듈을 이용해서 개인키를 저장할 파일 만들기
    // writeFileSync 함수의 매개변수(파일이름, 내용)
    // 지갑의 주소를 파일 이름으로 data폴더 경로까지 내용
    const fileName = path.join(dir, myWallet.account);
    // 파일의 내용은 해당 지갑의 개인키
    const fileContent = myWallet.privateKey;
    // 파일 이름은 지갑의 주소 파일의 내용은 지갑의 개인키
    fs.writeFileSync(fileName, fileContent);
  }

  public getPrivateKey(): string {
    return randomBytes(32).toString('hex');
  }

  public getPublicKey(): string {
    // 타원 곡선 알고리즘을 사용해서 개인키를 이용하여 공개키를 만듬
    const keyPair = ec.keyFromPrivate(this.privateKey);
    return keyPair.getPublic().encode('hex', true);
  }

  // 지갑 목록
  static getWalletList(): string[] {
    const files: string[] = fs.readdirSync(dir);
    // 파일 이름이 담긴 string 배열
    return files;
  }

  // 정보를 받고 개인키를 구해주는 함수
  static getWalletPrivateKey(account: string): string {
    const filepath = path.join(dir, account);
    // data 폴더에 만들어진 파일을 가져오고 해당 파일을 읽어옴
    const fileContent = fs.readFileSync(filepath);
    // 내용의 개인키를 문자열로 반환
    return fileContent.toString();
  }

  // 전자서명
  static createSign(obj: any): elliptic.ec.Signature {
    const {
      sender: { publicKey, account },
      received,
      amount,
    } = obj;
    // obj는 server.ts 에서 전달받는 값

    // 합쳐서 해싱하고 문자열로 저장
    const hash: string = SHA256(
      [publicKey, received, amount].join('')
    ).toString();
    const privateKey: string = Wallet.getWalletPrivateKey(account);
    // 서명
    const keyPair: elliptic.ec.KeyPair = ec.keyFromPrivate(privateKey);

    return keyPair.sign(hash, 'hex');
  }

  public getAccount(): string {
    return Buffer.from(this.publicKey).slice(26).toString();
  }
}
