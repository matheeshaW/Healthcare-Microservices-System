const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        
        connection.on('close', () => {
            console.error('RabbitMQ connection closed. Reconnecting...');
            channel = null; // Clear the dead channel
            setTimeout(connectRabbitMQ, 5000);
        });

        channel = await connection.createChannel();
        await channel.assertQueue('notification_queue', { durable: true });
        console.log('[*] Connected to RabbitMQ as Publisher');
    } catch (error) {
        console.error('RabbitMQ Connection Error:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
}

const sendNotification = (message) => {
    if (channel) {
     
        channel.sendToQueue('notification_queue', Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`🚀 Receipt request sent to Notification Service!`);
    } else {

        console.error('⚠️ Cannot send notification: RabbitMQ channel is not ready.');
    }
};

module.exports = { connectRabbitMQ, sendNotification };