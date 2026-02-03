import { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';
import { catchAsync } from '../utils/catch.async';

export const registerChatHandlers = (io: Server, socket: Socket) => {

    const handleMessage = catchAsync(async (data: { message: string }) => {
        const user = (socket as any).user;

        const savedMessage = await chatService.processMessage(user.id, data.message);

        io.emit("receive_message", {
            ...savedMessage,
            username: user.username
        });
    });

    socket.on("send_message", handleMessage);
};