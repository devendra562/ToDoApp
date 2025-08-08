// socket.js
let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user identification
      socket.on('identify', (userId) => {
        socket.userId = userId;
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
        console.log(`Socket ${socket.id} is now identified as user ${userId}`);

        // Send confirmation back to client
        socket.emit('identified', { userId, socketId: socket.id });
      });

      // socket.on('disconnect', () => {
      //   console.log('User disconnected:', socket.id);
      // });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};