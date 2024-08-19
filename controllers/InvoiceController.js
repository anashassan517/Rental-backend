const PDFDocument = require('pdfkit');
const fs = require('fs');
const Payment = require('../models/Payment');
const path = require('path');

const generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById({_id:paymentId}).select('invoice');
    console.log(payment)
    if (!payment) {
      return res.status(404).send({ error: 'Payment not found' });
    }
    res.status(200).send({ "invoice": payment})
    // Generate the PDF invoice
    // const doc = new PDFDocument();
    // const invoicePath = path.join(__dirname, `../invoices/invoice_${paymentId}.pdf`);
    // const writeStream = fs.createWriteStream(invoicePath);

    // doc.pipe(writeStream);

    // // Add content to the PDF
    // doc
    //   .fontSize(25)
    //   .text('Invoice', { align: 'center' })
    //   .moveDown();
    
    // doc
    //   .fontSize(16)
    //   .text(`Invoice ID: ${paymentId}`)
    //   .moveDown();
    
    // doc
    //   .fontSize(16)
    //   .text(`User ID: ${payment.userId}`)
    //   .moveDown();
    
    // doc
    //   .fontSize(16)
    //   .text(`Rental ID: ${payment.rentalId}`)
    //   .moveDown();
    
    // doc
    //   .fontSize(16)
    //   .text(`Amount: $${payment.amount}`)
    //   .moveDown();
    
    // doc
    //   .fontSize(16)
    //   .text(`Payment Method: ${payment.paymentMethod}`)
    //   .moveDown();
    
    // doc
    //   .fontSize(16)
    //   .text(`Payment Date: ${payment.paymentDate}`)
    //   .moveDown();
    
    // doc.end();

    // // Wait for the file to be written to the server
    // writeStream.on('finish', () => {
    //   // Update the payment record with the invoice URL
    //   payment.invoice = `/invoices/invoice_${paymentId}.pdf`;
    //   payment.save();

    //   res.status(200).send({ success: true, invoiceUrl: payment.invoice });
    // });

    // writeStream.on('error', (error) => {
    //   res.status(500).send({ error: 'Invoice generation failed', details: error.message });
    // });

  } catch (error) {
    res.status(500).send({ error: 'Invoice generation failed', details: error.message });
  }
};

const listInvoices = async (req, res) => {
  try {
    const invoices = await Payment.find({}).select('invoice');

    res.status(200).send({ success: true, invoices });
  } catch (error) {
    res.status(500).send({ error: 'Failed to list invoices', details: error.message });
  }
};


module.exports = {
    generateInvoice,
    listInvoices
}