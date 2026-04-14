const amqp = require("amqplib");

let connectionPromise = null;
let channelPromise = null;

async function getChannel() {
  if (channelPromise) {
    return channelPromise;
  }

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error("RABBITMQ_URL is not configured");
  }

  channelPromise = (async () => {
    if (!connectionPromise) {
      connectionPromise = amqp.connect(url);
    }

    const connection = await connectionPromise;
    const channel = await connection.createChannel();
    return channel;
  })();

  return channelPromise;
}

exports.publishAppointmentCreated = async (appointment) => {
  const queueName = process.env.APPOINTMENT_QUEUE_NAME || "appointment.created";
  const channel = await getChannel();

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify({
      event: "appointment.created",
      data: {
        id: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
      },
      timestamp: new Date().toISOString(),
    })),
    { persistent: true }
  );
};
