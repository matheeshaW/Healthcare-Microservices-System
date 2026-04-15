// test-payment.js
async function testCheckout() {
    const paymentDetails = {
        appointmentId: "APP_998877",
        patientId: "PAT_12345",
        patientEmail: "warurandima6@gmail.com",
        amount: 2500
    };

    try {
        console.log("⏳ Simulating frontend checkout click...");
        const response = await fetch('http://localhost:5005/api/payment/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails)
        });

        const data = await response.json();
        console.log("✅ Server Response:", data);
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testCheckout();