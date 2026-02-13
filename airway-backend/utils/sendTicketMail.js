const transporter = require("./mailer");
const path = require("path");

const sendTicketMail = async (email, bookingId, fileName) => {
  const filePath = path.join(__dirname, "../tickets", fileName);

  await transporter.sendMail({
    from: "Airway Reservation <airwaytest007@gmail.com>",
    to: email,
    subject: `Your Flight Ticket - ${bookingId}`,
    html: `
      <h2>Booking Confirmed ✈️</h2>
      <p>Your booking ID: <b>${bookingId}</b></p>
      <p>Your ticket is attached.</p>
    `,
    attachments: [
      {
        filename: fileName,
        path: filePath
      }
    ]
  });
};

module.exports = sendTicketMail;
