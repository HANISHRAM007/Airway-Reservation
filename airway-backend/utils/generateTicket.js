const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateTicket = (booking, flight) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `ticket_${booking.bookingId}.pdf`;
      const filePath = path.join(__dirname, "../tickets", fileName);

      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const accentColor = "#FF5722"; // Orange accent color

      /* ================= HEADER ================= */
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("AIRWAY RESERVATION", { align: "left" })
        .fontSize(10)
        .font("Helvetica")
        .text(`Booking ID: ${booking.bookingId}`, { align: "right" })
        .moveDown(0.3);

      // Divider Line
      doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke("#CCCCCC");
      doc.moveDown(0.8);

      /* ================= FLIGHT ROUTE SECTION ================= */
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`${flight.from}`, { align: "left", width: 200 })
        .fontSize(9)
        .font("Helvetica")
        .text("Departure", { align: "left", width: 200 });

      const leftX = 30;
      const rightX = 350;
      const currentY = doc.y - 30;

      doc.fontSize(16)
        .font("Helvetica-Bold")
        .text(`${flight.to}`, { align: "left", x: rightX, y: currentY, width: 200 })
        .fontSize(9)
        .font("Helvetica")
        .text("Arrival", { align: "left", x: rightX, width: 200 });

      doc.moveDown(1.8);

      // Flight details in a table-like format
      const detailsY = doc.y;
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Flight: ${flight.flightNumber}`, { x: leftX, y: detailsY })
        .text(`${new Date(flight.departureTime).toLocaleTimeString()}`, { x: rightX, y: detailsY });

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(`Airline: ${flight.airline}`, { x: leftX, y: detailsY + 15 })
        .text(`${new Date(flight.departureTime).toLocaleDateString()}`, { x: rightX, y: detailsY + 15 });

      doc
        .fontSize(9)
        .text(`Duration: ~${Math.round(Math.abs((new Date(flight.arrivalTime) - new Date(flight.departureTime)) / 60000))}m`, { x: leftX, y: detailsY + 30 })
        .text(`${new Date(flight.arrivalTime).toLocaleTimeString()}`, { x: rightX, y: detailsY + 30 });

      doc.moveDown(2.5);
      doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke("#CCCCCC");
      doc.moveDown(0.8);

      /* ================= PASSENGERS SECTION ================= */
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Passengers", { underline: false })
        .moveDown(0.3);

      doc
        .fontSize(9)
        .font("Helvetica");

      booking.passengers.forEach((p, index) => {
        doc.text(
          `${index + 1}. ${p.name} (Age: ${p.age}, ${p.gender})`,
          { x: 30 }
        );
      });

      doc.moveDown(0.5);
      doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke("#CCCCCC");
      doc.moveDown(0.8);

      /* ================= BAGGAGE SECTION ================= */
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Baggage Allowance", { underline: false })
        .moveDown(0.3);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text("• Check-in: 15 kg per adult, Cabin: 7 kg per adult")
        .text("• Additional baggage can be purchased at additional cost");

      doc.moveDown(0.5);
      doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke("#CCCCCC");
      doc.moveDown(0.8);

      /* ================= PAYMENT SECTION ================= */
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Payment Details", { underline: false })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Total Amount Paid: ₹${booking.totalAmount}`, { x: 30 })
        .fontSize(9)
        .font("Helvetica")
        .text(`Payment Status: Confirmed`, { x: 30 })
        .text(`Transaction Date: ${new Date().toLocaleDateString()}`, { x: 30 });

      doc.moveDown(0.5);
      doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke("#CCCCCC");
      doc.moveDown(0.8);

      /* ================= IMPORTANT INFORMATION ================= */
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Important Information", { underline: false })
        .moveDown(0.3);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text("• Please carry a valid government ID proof during travel.")
        .text("• For any queries or communication with us regarding this booking, please use your Booking ID.")
        .text("• Check-in closes 60 minutes before departure.")
        .text("• Kindly arrive at airport 2 hours prior to departure.")
        .text("• Travelers must present a valid photo ID/Aadhar at airport and at the time of check-in.")
        .text("• Permitted items are as per our baggage policy. Read our website for more details.")
        .text("• Kindly carry a valid ID proof if booked on behalf of another passenger.")
        .text("• Please refer to the conditions of carriage of the airlines here.");

      doc.moveDown(0.8);
      doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke("#CCCCCC");
      doc.moveDown(0.8);

      /* ================= CANCELLATION INFORMATION ================= */
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("Cancellation Information", { underline: false })
        .moveDown(0.3);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text("• To initiate a booking cancellation, please log in to our page and click 'Manage Booking'.")
        .text("• Please note that in case of cancellation, both the airline and our charges will be deducted.")
        .text("• Once you cancel, the refund will be processed to the original payment method within 3-5 working days.")
        .text("• Airline policies for cancellation will be followed, it means a cancellation fee of ₹500 per traveller per flight will be charged.")
        .text("• If the flight is cancelled by us, the airline or other reasons, refund will be issued with a case reference.")
        .text("• In rare cases where a refund is issued in a credit note form, it can be used for another booking.");

      doc.moveDown(1.5);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text("Thank you for choosing Airway Reservation.", {
          align: "center"
        });

      doc.moveDown(0.5);
      doc
        .fontSize(8)
        .font("Helvetica")
        .text("For support, contact: support@airwayreservation.com", {
          align: "center"
        });

      doc.end();

      stream.on("finish", () => resolve(fileName));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateTicket;
