declare interface IBlockHeader {
  version: string;
  height: number;
  timeStamp: number;
  previousHash: string;
}

declare interface IBlock extends IBlockHeader {
  merkleRoot: string;
  hash: string;
  nonce: number;
  difficulty: number;
  data: ITransaction[];
}
