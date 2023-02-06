import express from 'express';
import { P2PServer } from '@core/server/p2p';
import { BlockChain } from '@core/index';

const app = express();
const ws = new P2PServer();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('block chain');
});

// 블록 내용 조회
app.get('/chain', (req, res) => {
  res.json(ws.getChain());
});

// 블록 채굴
app.post('/mineBlock', (req, res) => {
  const { data } = req.body;
  const newBlock = ws.addBlock(data);
  if (newBlock.isError) return res.send(newBlock.value);

  res.json(newBlock.value);
});

// P2PServer 웹소켓 연결 요청
app.post('/addToPeer', (req, res) => {
  const { peer } = req.body;
  ws.connectToPeer(peer);
});

// 연결된 socket 조회
app.get('/peer', (req, res) => {
  const sockets = ws.getSockets().map((socket: any) => {
    return res.json(socket);
  });
});

app.listen(8008, () => {
  console.log('server is running');
  ws.listen();
});
