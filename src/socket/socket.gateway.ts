import {
  ConnectedSocket, // Decorator: lấy ra socket của client đang gửi event
  MessageBody, // Decorator: lấy ra dữ liệu (payload) mà client gửi lên
  OnGatewayConnection, // Interface: bắt buộc có hàm handleConnection (chạy khi client kết nối)
  OnGatewayDisconnect, // Interface: bắt buộc có hàm handleDisconnect (chạy khi client ngắt kết nối)
  SubscribeMessage, // Decorator: đăng ký lắng nghe 1 event từ client
  WebSocketGateway, // Decorator: đánh dấu class là 1 WebSocket Gateway
  WebSocketServer, // Decorator: inject instance Server của socket.io vào property
} from '@nestjs/websockets';
// Server: đại diện cho toàn bộ server socket.io (dùng để emit cho nhiều client)
// Socket: đại diện cho 1 kết nối của 1 client cụ thể
import { Server, Socket } from 'socket.io';
// Service chứa logic nghiệp vụ (lưu tin nhắn, đánh dấu đã đọc...) tách riêng khỏi gateway
import { SocketService } from './socket.service.js';
// DTO định nghĩa cấu trúc dữ liệu khi tạo tin nhắn mới
import { CreateMessageDto } from '../messages/dto/create-message.dto.js';



// Kiểu dữ liệu client gửi lên khi join/leave 1 cuộc hội thoại
interface ConversationRoomPayload {
  conversationId: string; // ID của cuộc hội thoại muốn vào/rời
  userId?: string; // ID người dùng (có dấu ? nghĩa là không bắt buộc)
}

// Kiểu dữ liệu client gửi lên khi đánh dấu đã đọc tin nhắn
interface ReadMessagePayload {
  conversationId: string; // ID cuộc hội thoại được đọc
  userId: string; // ID người dùng đã đọc (bắt buộc)
}

// Khai báo class là Gateway; cors: true cho phép mọi origin kết nối (nên giới hạn khi lên production)
@WebSocketGateway({ cors: true })
// Class implement 2 interface để NestJS tự gọi handleConnection / handleDisconnect
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // NestJS tự gán instance socket.io Server vào biến này
  @WebSocketServer()
  private server: Server;

  // Inject SocketService qua constructor (Dependency Injection); readonly để không bị gán lại
  constructor(private readonly socketService: SocketService) {}

  
  // Hàm tự động chạy mỗi khi có 1 client kết nối thành công
  handleConnection(client: Socket) {
    console.log('Client connected:', client);
    const userId = this.getUserId(client);
    // console.log(`Client connected: ${client.id}, userId: ${userId}`);
    client.data.userId = userId;
    
    client.emit('connected', { socketId: client.id, userId });
    this.server.emit('presence:online', { userId, socketId: client.id });
  }

  // Hàm tự động chạy khi 1 client ngắt kết nối (đóng tab, mất mạng...)
  handleDisconnect(client: Socket) {
    // Báo cho tất cả client biết user này đã offline
    this.server.emit('presence:offline', {
      userId: client.data.userId, // userId đã lưu lúc kết nối
      socketId: client.id, // ID của socket vừa ngắt
    });
  }

  // Lắng nghe event 'joinConversation' do client emit lên
  @SubscribeMessage('joinConversation')
  joinConversation(
    @ConnectedSocket() client: Socket, // socket của client gửi event
    @MessageBody() payload: ConversationRoomPayload, // dữ liệu client gửi kèm
  ) {
    // Tạo tên room từ conversationId (dạng "conversation:123")
    const room = this.getRoomName(payload.conversationId);
    console.log("Room", room);
    // Cho socket này tham gia vào room
    client.join(room);
    // Nếu payload có userId thì dùng, không thì giữ userId cũ (toán tử ?? chỉ thay khi giá trị là null/undefined)
    client.data.userId = payload.userId ?? client.data.userId;
    // Báo cho những người KHÁC trong room (client.to loại trừ chính mình) rằng có người mới vào
    client.to(room).emit('conversation:userJoined', {
      conversationId: payload.conversationId,
      userId: client.data.userId,
    });
    // Giá trị return sẽ được gửi lại (ack) cho đúng client đã gửi event
    return {
      event: 'joinedConversation',
      conversationId: payload.conversationId,
    };
  }

  // Lắng nghe event 'leaveConversation' khi client muốn rời cuộc hội thoại
  @SubscribeMessage('leaveConversation')
  leaveConversation(
    @ConnectedSocket() client: Socket, // socket của client gửi event
    @MessageBody() payload: ConversationRoomPayload, // dữ liệu client gửi kèm
  ) {
    // Lấy tên room tương ứng với cuộc hội thoại
    const room = this.getRoomName(payload.conversationId);
    // Cho socket này rời khỏi room
    client.leave(room);
    // Báo cho những người còn lại trong room biết user này đã rời
    client.to(room).emit('conversation:userLeft', {
      conversationId: payload.conversationId,
      userId: client.data.userId,
    });
    // Trả ack về cho client xác nhận đã rời thành công
    return {
      event: 'leftConversation',
      conversationId: payload.conversationId,
    };
  }

  // Lắng nghe event 'sendMessage' khi client gửi tin nhắn mới
  @SubscribeMessage('sendMessage')
  // async vì việc lưu tin nhắn vào database là bất đồng bộ
  async sendMessage(@MessageBody() payload: CreateMessageDto) {
    // Gọi service để lưu tin nhắn vào DB, nhận về tin nhắn đã lưu (có id, thời gian...)
    const message = await this.socketService.createMessage(payload);
    this.server
      // Chọn đúng room của cuộc hội thoại (server.to gửi cho cả người gửi lẫn người nhận trong room)
      .to(this.getRoomName(payload.conversationId))
      // Phát event 'message:new' kèm tin nhắn mới cho mọi người trong room
      .emit('message:new', message);
    // Trả tin nhắn về cho người gửi như 1 ack
    return message;
  }

  // Lắng nghe event 'markRead' khi client đọc tin nhắn trong cuộc hội thoại
  @SubscribeMessage('markRead')
  async markRead(@MessageBody() payload: ReadMessagePayload) {
    // Gọi service cập nhật trạng thái "đã đọc" của user trong cuộc hội thoại (thường lưu vào DB)
    await this.socketService.markConversationRead(
      payload.conversationId,
      payload.userId,
    );
    this.server
      // Chọn room của cuộc hội thoại
      .to(this.getRoomName(payload.conversationId))
      // Thông báo cho mọi người trong room là user này đã đọc (để hiện "Đã xem")
      .emit('conversation:read', payload);
    // Trả ack, dùng spread (...payload) để gộp conversationId và userId vào object
    return { event: 'markedRead', ...payload };
  }

  // Hàm tiện ích tạo tên room thống nhất, tránh gõ chuỗi lặp lại ở nhiều nơi
  private getRoomName(conversationId: string) {
    return `conversation:${conversationId}`;
  }

  // Hàm tiện ích lấy userId từ thông tin handshake của client
  private getUserId(client: Socket) {
    // Ép kiểu handshake.auth để TypeScript hiểu có thể chứa userId
    const auth = client.handshake.auth as { userId?: string };
    // Ưu tiên lấy userId từ auth; nếu không có thì lấy từ query string (?userId=...)
    return auth?.userId ?? client.handshake.query.userId;
  }
}