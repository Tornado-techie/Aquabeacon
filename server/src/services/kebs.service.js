const PDFDocument = require('pdfkit');
const { uploadToS3 } = require('./s3.service');
const { sendEmail } = require('./email.service');
const logger = require('../utils/logger');

const escalateToKEBS = async (complaint) => {
  try {
    logger.info(`Starting KEBS escalation for complaint: ${complaint._id}`);

    const pdfBuffer = await generateComplaintPDF(complaint);

    const pdfKey = `kebs-escalations/${complaint._id}/${Date.now()}.pdf`;
    const pdfUrl = await uploadToS3(pdfBuffer, pdfKey, 'application/pdf');

    logger.info(`PDF generated and uploaded: ${pdfUrl}`);

    const emailSubject = `Water Quality Complaint Escalation - Ref: ${complaint._id}`;
    const emailBody = generateKEBSEmailBody(complaint);

    const emailResult = await sendKEBSEmail({
      subject: emailSubject,
      body: emailBody,
      attachments: [{
        filename: `complaint-${complaint._id}.pdf`,
        content: pdfBuffer
      }]
    });

    return {
      success: true,
      emailSent: emailResult.success,
      pdfUrl,
      messageId: emailResult.messageId
    };

  } catch (error) {
    logger.error('KEBS escalation error:', error);
    throw error;
  }
};

const generateComplaintPDF = async (complaint) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('AquaBeacon', { align: 'center' });
      doc.fontSize(16).text('Water Quality Complaint Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.text(`Complaint ID: ${complaint._id}`, { align: 'right' });
      doc.moveDown(2);

      // Complaint Details Section
      doc.fontSize(14).text('Complaint Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      
      addField(doc, 'Received Date', new Date(complaint.createdAt).toLocaleDateString());
      addField(doc, 'Status', complaint.status.toUpperCase());
      addField(doc, 'Priority', complaint.priority.toUpperCase());
      addField(doc, 'Category', complaint.category.replace('_', ' ').toUpperCase());
      doc.moveDown();

      // Reporter Information
      if (!complaint.isAnonymous) {
        doc.fontSize(14).text('Reporter Information', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        addField(doc, 'Name', complaint.reporterName);
        addField(doc, 'Email', complaint.reporterEmail);
        addField(doc, 'Phone', complaint.reporterPhone);
        doc.moveDown();
      }

      // Plant Information
      if (complaint.plant) {
        doc.fontSize(14).text('Plant Information', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        addField(doc, 'Plant Name', complaint.plant.name || 'N/A');
        addField(doc, 'Registration Number', complaint.plant.registrationNumber || 'N/A');
        addField(doc, 'County', complaint.plant.location?.address?.county || 'N/A');
        doc.moveDown();
      }

      // Product Information
      doc.fontSize(14).text('Product Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      addField(doc, 'Product Name', complaint.productName || 'N/A');
      addField(doc, 'Batch Code', complaint.batchCode || 'N/A');
      addField(doc, 'Product Code', complaint.productCode || 'N/A');
      addField(doc, 'Purchase Date', complaint.purchaseDate ? new Date(complaint.purchaseDate).toLocaleDateString() : 'N/A');
      addField(doc, 'Purchase Location', complaint.purchaseLocation || 'N/A');
      doc.moveDown();

      // Complaint Description
      doc.fontSize(14).text('Complaint Description', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(complaint.description, { align: 'justify' });
      doc.moveDown();

      // Health Impact
      if (complaint.healthImpact?.hasHealthImpact) {
        doc.fontSize(14).text('Health Impact', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        addField(doc, 'Medical Attention Required', complaint.healthImpact.medicalAttention ? 'Yes' : 'No');
        if (complaint.healthImpact.symptoms && complaint.healthImpact.symptoms.length > 0) {
          addField(doc, 'Symptoms', complaint.healthImpact.symptoms.join(', '));
        }
        if (complaint.healthImpact.hospitalName) {
          addField(doc, 'Hospital', complaint.healthImpact.hospitalName);
        }
        doc.moveDown();
      }

      // Lab Results
      if (complaint.labSample) {
        doc.fontSize(14).text('Laboratory Test Results', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        addField(doc, 'Sample ID', complaint.labSample.sampleId);
        addField(doc, 'Laboratory', complaint.labSample.laboratory.name);
        addField(doc, 'Overall Status', complaint.labSample.overallStatus.toUpperCase());
        
        if (complaint.labSample.tests && complaint.labSample.tests.length > 0) {
          doc.moveDown(0.5);
          doc.text('Test Results:', { underline: true });
          complaint.labSample.tests.forEach(test => {
            doc.text(`  • ${test.parameter}: ${test.result} ${test.unit || ''} (Status: ${test.status})`);
          });
        }
        doc.moveDown();
      }

      // Photos
      if (complaint.photos && complaint.photos.length > 0) {
        doc.fontSize(14).text('Photo Evidence', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Number of photos attached: ${complaint.photos.length}`);
        complaint.photos.forEach((photo, index) => {
          doc.text(`  Photo ${index + 1}: ${photo.url}`);
        });
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).text(
        'This report was automatically generated by AquaBeacon Water Quality Management System',
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

const addField = (doc, label, value) => {
  doc.font('Helvetica-Bold').text(label + ': ', { continued: true });
  doc.font('Helvetica').text(value || 'N/A');
};

const generateKEBSEmailBody = (complaint) => {
  return `
Dear Kenya Bureau of Standards Team,

We are escalating a water quality complaint that requires your immediate attention and investigation.

COMPLAINT SUMMARY
-----------------
Complaint ID: ${complaint._id}
Date Received: ${new Date(complaint.createdAt).toLocaleDateString()}
Priority: ${complaint.priority.toUpperCase()}
Category: ${complaint.category.replace('_', ' ')}

${complaint.plant ? `
PLANT INFORMATION
-----------------
Plant Name: ${complaint.plant.name}
Registration Number: ${complaint.plant.registrationNumber || 'N/A'}
County: ${complaint.plant.location?.address?.county || 'N/A'}
` : ''}

PRODUCT INFORMATION
-------------------
Product Name: ${complaint.productName || 'N/A'}
Batch Code: ${complaint.batchCode || 'N/A'}
Product Code: ${complaint.productCode || 'N/A'}

ISSUE DESCRIPTION
-----------------
${complaint.description}

${complaint.healthImpact?.hasHealthImpact ? `
HEALTH IMPACT
-------------
This complaint involves health concerns. Medical attention was ${complaint.healthImpact.medicalAttention ? 'required' : 'not required'}.
` : ''}

${complaint.labSample ? `
LAB TEST RESULTS
----------------
Laboratory test results are included in the attached PDF report.
Overall Status: ${complaint.labSample.overallStatus.toUpperCase()}
` : ''}

Please find the complete complaint report attached as a PDF document, which includes all evidence, photos, and detailed information.

We request your urgent investigation and guidance on this matter.

Best regards,
AquaBeacon System
Water Quality Management Platform

---
This is an automated message from AquaBeacon. For inquiries, please contact: ${process.env.SUPPORT_EMAIL || 'support@aquabeacon.co.ke'}
  `.trim();
};

const sendKEBSEmail = async ({ subject, body, attachments }) => {
  try {
    const kebsEmail = process.env.KEBS_EMAIL || 'info@kebs.org';
    const ccEmails = process.env.KEBS_CC_EMAILS ? process.env.KEBS_CC_EMAILS.split(',') : [];

    if (process.env.NODE_ENV === 'development' && !process.env.KEBS_EMAIL) {
      logger.warn('KEBS_EMAIL not configured. Skipping actual email send in development.');
      logger.info('Email details:', { subject, to: 'info@kebs.org' });
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const result = await sendEmail({
      to: kebsEmail,
      cc: ccEmails,
      subject,
      text: body,
      attachments
    });

    return result;

  } catch (error) {
    logger.error('Failed to send KEBS email:', error);
    throw error;
  }
};

module.exports = {
  escalateToKEBS,
  generateComplaintPDF,
  sendKEBSEmail
};