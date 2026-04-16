const { EventEmitter } = require("events");

const appointmentEventBus = new EventEmitter();

// Allow more concurrent SSE subscribers without noisy warnings.
appointmentEventBus.setMaxListeners(200);

exports.publishUpdated = (appointment) => {
  appointmentEventBus.emit("appointment.updated", {
    appointment,
    timestamp: new Date().toISOString(),
  });
};

exports.onUpdated = (listener) => {
  appointmentEventBus.on("appointment.updated", listener);
};

exports.offUpdated = (listener) => {
  appointmentEventBus.off("appointment.updated", listener);
};
