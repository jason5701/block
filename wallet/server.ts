import express from 'express';
import { Wallet } from './wallet';
import axios from 'axios';
import nunjucks from 'nunjucks';

const app = express();

nunjucks.configure('view', {
  express: app,
  watch: true,
});

app.set('view engine', 'html');

const baseURL = 'http://localhost:3000';
const baseAuth = Buffer.from('kim' + ':' + '1234').toString('base64');
const request = axios.create({
  baseURL,
  headers: {
    Authorization: 'Basic' + baseAuth,
    'Content-type': 'application/json',
  },
});

app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/wallet', (req, res) => {
  res.json(new Wallet());
});

app.post('/wallets', (req, res) => {
  const list = Wallet.getWalletList();
  res.json(list);
});

app.get('/wallet/:account', (req, res) => {
  const { account } = req.params;
  const privateKey = Wallet.getWalletPrivateKey(account);

  res.json(new Wallet(privateKey));
});

app.post('/send', async (req, res) => {
  const {
    sender: { publicKey, account },
    received,
    amount,
  } = req.body;

  const signature = Wallet.createSign(req.body);

  // 보낼사람 : 공개키
  // 받는사람 : 계정, 서명
  const txObject = {
    sender: publicKey,
    received,
    amount,
    signature,
  };

  const response = await request.post('/send', txObject);
  console.log(response.data);
  res.json({});
});

app.listen(4000, () => {
  console.log('server is running at 4000');
});
