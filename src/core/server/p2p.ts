import { WebSocket } from 'ws';
import { Chain } from '@core/blockChain/chain';

// 상수인 값 열거형
enum MessageType {
  latest_block,
  all_block,
  receivedChain,
}

interface Message {
  type: MessageType;
  payload: any;
}

export class P2PServer extends Chain {
  private sockets: WebSocket[];
  constructor() {
    super();
    this.sockets = [];
  }

  // listen 서버에 들어왔을때
  // 클라이언트가 입장 했을때
  listen() {
    const server = new WebSocket.Server({ port: 5000 });
    server.on('connection', (socket) => {
      console.log('클라이언트 입장');
      this.connectSocket(socket);
    });
  }

  // connectToPeer: 클라이언트 입장
  // 서버쪽으로 연결 요청시
  connectToPeer(newPeer: string) {
    const socket = new WebSocket(newPeer);
    socket.on('open', () => {
      this.connectSocket(socket);
    });
  }
  connectSocket(socket: WebSocket) {
    this.sockets.push(socket);
    this.messageHandler(socket);

    const data: Message = {
      type: MessageType.latest_block,
      payload: {},
    };

    this.errorHandler(socket);

    const send = P2PServer.send(socket);
    send(data);
  }

  getSockets() {
    return this.sockets;
  }

  messageHandler(socket: WebSocket) {
    const callback = (data: string) => {
      // Message: 통신할때 이벤트들을 구분처리 해주기 위해 만든 타입
      const result: Message = P2PServer.dataParse<Message>(data);
      const send = P2PServer.send(socket);

      switch (result.type) {
        case MessageType.latest_block: {
          const message: Message = {
            type: MessageType.all_block,
            payload: [this.getLatestBlock()],
          };
          send(message);
          break;
        }
        case MessageType.all_block: {
          // 체인에 블록을 추가할지 결정
          const message: Message = {
            type: MessageType.receivedChain,
            payload: this.getChain(),
          };
          send(message);
          break;
        }
        case MessageType.receivedChain: {
          // 체인을 교체하는 코드(값이 더 긴 체인으로)
          const receivedChain: IBlock[] = result.payload;
          console.log(receivedChain);
          break;
        }

        default:
          break;
      }
    };
    socket.on('meesage', callback);
  }

  errorHandler(socket: WebSocket) {
    const close = () => {
      this.sockets.splice(this.sockets.indexOf(socket), 1);
    };
    // 소켓이 끊겼을때
    socket.on('close', close);

    // 에러 발생시
    socket.on('error', close);
  }

  handleChainResponce(
    receivedChain: IBlock[]
  ): Failable<Message | undefined, string> {
    const isValidChain = this.isValidChain(receivedChain);
    if (isValidChain.isError)
      return { isError: true, value: isValidChain.value };

    const isValid = this.replaceChain(receivedChain);
    if (isValid.isError) return { isError: true, value: isValid.value };

    const message: Message = {
      type: MessageType.receivedChain,
      payload: receivedChain,
    };
    this.broadcast(message);
    return { isError: false, value: undefined };
  }

  broadcast(message: Message) {
    this.sockets.forEach((socket) => P2PServer.send(socket)(message));
  }

  static dataParse<T>(_data: string): T {
    return JSON.parse(Buffer.from(_data).toString());
  }

  static send(socket: WebSocket) {
    return (data: Message) => {
      socket.send(JSON.stringify(data));
    };
  }
}
