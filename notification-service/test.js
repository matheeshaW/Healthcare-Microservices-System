const amqp = require('amqplib');

async function sendTestMessage() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'notification_queue';

        // The fake appointment data
        const testData = {
            patientEmail: 'warurandima6@gmail.com', 
            message: 'Hello buddy! Your RabbitMQ Notification Service is officially working! 🎉'
        };

        await channel.assertQueue(queue, { durable: true });
        
        // Drop the message into the queue
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(testData)));
        console.log("🚀 Fake message dropped into RabbitMQ!");

        // Close the connection
        setTimeout(() => { 
            connection.close(); 
            process.exit(0); 
        }, 500);

    } catch (error) {
        console.error(error);
    }
}

sendTestMessage();