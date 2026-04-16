// src/api/payment.api.js

export const createCheckoutSession = async (appointmentId) => {
  const token = localStorage.getItem("token"); 
  
  const res = await fetch("http://localhost:5005/api/payment/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ appointmentId })
  });

  if (!res.ok) {
    throw new Error("Failed to initialize payment session from server.");
  }

  return await res.json();
};

export const confirmPaymentToDB = async (paymentData) => {
  const token = localStorage.getItem("token");
  
  // This hits the processPayment controller above
  const res = await fetch("http://localhost:5005/api/payment/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Payment confirmation failed");
  }

  return await res.json();
};