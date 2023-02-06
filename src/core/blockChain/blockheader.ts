export class BlockHeader implements IBlockHeader {
  public version: string;
  public height: number;
  public timeStamp: number;
  public previousHash: string;
  
  constructor(_previousBlock: IBlock) {
    this.version = BlockHeader.getVersion();
    this.timeStamp = BlockHeader.getTimeStamp();
    this.height = _previousBlock.height + 1;
    this.previousHash = _previousBlock.hash;
  }

  // static 메소드 사용시 인스턴스에 메소드가 포함되지 않아 인스턴스 생성마다 메소드가 생성되는 비효율성을 방지
  // 클래스 내에서 함수를 만들어 사용하고 싶을때 static 메소드를 주로 활용
  public static getVersion() {
    return '1.0.0';
  }
  public static getTimeStamp() {
    return new Date().getTime();
  }
}
