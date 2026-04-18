// ============================================================
//  HolisDen — Google Apps Script Backend
//  File: Code.gs
//  Deploy as: Web App (Execute as Me, Anyone can access)
// ============================================================

// ── CONFIGURATION ────────────────────────────────────────────
const CONFIG = {
  PRACTITIONER_EMAIL : "marina@holisden.com",
  PRACTITIONER_NAME  : "Marina Coetzee",
  BUSINESS_NAME      : "HolisDen",
  WEBSITE            : "www.holisden.com",
  PHONE              : "027 225 2295",

  // Google Sheets — create one Spreadsheet and paste its ID here
  SPREADSHEET_ID     : "YOUR_SPREADSHEET_ID_HERE",

  // Sheet tab names (will be auto-created if missing)
  SHEET_ENQUIRIES    : "Enquiries",
  SHEET_INTAKE       : "Client Intake",
  SHEET_CONSENTS     : "Consents",

  // Brand colours for HTML emails
  COLOR_TEAL         : "#1BADA8",
  COLOR_GOLD         : "#C9924A",
  COLOR_INK          : "#1A2A2A",
};

// ── ENTRY POINTS ─────────────────────────────────────────────

/** Serve the Client Portal (intake + consent form) */
function doGet(e) {
  const page = e.parameter.page || "portal";

  if (page === "thankyou") {
    return HtmlService.createHtmlOutput(thankYouPage())
      .setTitle("Thank You — HolisDen")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return HtmlService.createTemplateFromFile("ClientPortal")
    .evaluate()
    .setTitle("Client Portal — HolisDen")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Handle all POST submissions */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let result;

    switch (data.formType) {
      case "enquiry": result = handleEnquiry(data);  break;
      case "intake":  result = handleIntake(data);   break;
      case "consent": result = handleConsent(data);  break;
      default: throw new Error("Unknown form type: " + data.formType);
    }

    return jsonResponse({ success: true, message: result });

  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── ENQUIRY HANDLER ──────────────────────────────────────────
function handleEnquiry(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_ENQUIRIES, [
    "Timestamp", "First Name", "Last Name", "Email", "Location",
    "Topic", "Format Preference", "Message", "Consent Given", "Status"
  ]);

  sheet.appendRow([
    new Date(),
    data.firstName,
    data.lastName,
    data.email,
    data.location      || "",
    data.topic         || "",
    data.format        || "",
    data.message       || "",
    data.consent ? "Yes" : "No",
    "New"
  ]);

  // Email to Marina
  sendEmail({
    to      : CONFIG.PRACTITIONER_EMAIL,
    subject : `🌿 New Enquiry — ${data.firstName} ${data.lastName}`,
    html    : enquiryNotificationEmail(data),
  });

  // Auto-reply to client
  sendEmail({
    to      : data.email,
    subject : `Thank you for reaching out, ${data.firstName} — HolisDen`,
    html    : enquiryAutoReplyEmail(data),
  });

  return "Enquiry received";
}

// ── INTAKE HANDLER ───────────────────────────────────────────
function handleIntake(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_INTAKE, [
    "Timestamp", "Full Name", "Preferred Name", "Surname", "DOB", "Age",
    "Address", "Relationship Status", "Occupation", "Email", "Phone",
    "Emergency Contact Name", "Emergency Contact Number",
    "Doctor Name", "Doctor Practice", "Last Checkup", "Medications",
    "Health History", "Checked Issues", "Additional Notes", "How Did You Hear"
  ]);

  sheet.appendRow([
    new Date(),
    data.firstName + " " + data.surname,
    data.preferredName     || "",
    data.surname           || "",
    data.dob               || "",
    data.age               || "",
    data.address           || "",
    data.relationshipStatus|| "",
    data.occupation        || "",
    data.email             || "",
    data.phone             || "",
    data.emergencyName     || "",
    data.emergencyNumber   || "",
    data.doctorName        || "",
    data.doctorPractice    || "",
    data.lastCheckup       || "",
    data.medications       || "",
    data.healthHistory     || "",
    (data.checkedIssues || []).join(", "),
    data.additionalNotes   || "",
    data.hearAboutUs       || "",
  ]);

  // Notify Marina
  sendEmail({
    to      : CONFIG.PRACTITIONER_EMAIL,
    subject : `📋 New Intake Form — ${data.firstName} ${data.surname}`,
    html    : intakeNotificationEmail(data),
  });

  // Confirmation to client
  sendEmail({
    to      : data.email,
    subject : "Your intake form has been received — HolisDen",
    html    : intakeConfirmationEmail(data),
  });

  return "Intake form received";
}

// ── CONSENT HANDLER ──────────────────────────────────────────
function handleConsent(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_CONSENTS, [
    "Timestamp", "Client Name", "Email", "Session Recording Agreed",
    "Consent Agreed", "Signature (Base64 ref)", "Consent Date",
    "Guardian Name", "IP Address Ref"
  ]);

  sheet.appendRow([
    new Date(),
    data.clientName        || "",
    data.email             || "",
    data.sessionRecording ? "Yes" : "No",
    data.consentAgreed    ? "Yes" : "No",
    data.signatureRef      || "Signed digitally",
    data.consentDate       || formatDate(new Date()),
    data.guardianName      || "N/A",
    "Logged"
  ]);

  // Notify Marina
  sendEmail({
    to      : CONFIG.PRACTITIONER_EMAIL,
    subject : `✅ Consent Form Signed — ${data.clientName}`,
    html    : consentNotificationEmail(data),
  });

  // Send signed copy to client
  sendEmail({
    to      : data.email,
    subject : "Your signed consent form — HolisDen",
    html    : consentCopyEmail(data),
  });

  return "Consent form received";
}

// ── EMAIL TEMPLATES ──────────────────────────────────────────

function emailWrapper(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#F5F5F5;margin:0;padding:20px;}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
    .header{background:${CONFIG.COLOR_TEAL};padding:32px 36px;color:white;}
    .header h1{margin:0;font-size:22px;font-weight:400;letter-spacing:0.05em;}
    .header p{margin:6px 0 0;font-size:13px;opacity:0.85;}
    .body{padding:32px 36px;color:${CONFIG.COLOR_INK};line-height:1.7;}
    .body h2{color:${CONFIG.COLOR_TEAL};font-size:16px;margin-top:0;}
    .row{display:flex;gap:8px;margin-bottom:6px;font-size:14px;}
    .label{color:#888;min-width:160px;font-size:13px;}
    .val{color:${CONFIG.COLOR_INK};font-weight:500;}
    .box{background:#F8FDFD;border:1px solid #D0EFEE;border-radius:8px;padding:16px;margin:16px 0;font-size:14px;}
    .btn{display:inline-block;background:${CONFIG.COLOR_TEAL};color:white;padding:12px 28px;border-radius:40px;text-decoration:none;font-size:14px;font-weight:500;margin-top:8px;}
    .footer{background:#F0F0F0;padding:20px 36px;font-size:12px;color:#999;text-align:center;}
    .gold{color:${CONFIG.COLOR_GOLD};font-weight:600;}
    hr{border:none;border-top:1px solid #EEE;margin:20px 0;}
    .tag{display:inline-block;background:#E8F8F7;color:${CONFIG.COLOR_TEAL};padding:3px 10px;border-radius:12px;font-size:12px;margin:2px;}
  </style></head><body>
  <div class="wrap">
    <div class="header">
      <h1>🌿 ${CONFIG.BUSINESS_NAME}</h1>
      <p>Healing and Renewal — ${title}</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <strong>${CONFIG.BUSINESS_NAME}</strong> · ${CONFIG.WEBSITE} · ${CONFIG.PHONE}<br>
      New Plymouth, New Zealand · marina@holisden.com
    </div>
  </div></body></html>`;
}

function enquiryNotificationEmail(d) {
  return emailWrapper("New Enquiry", `
    <h2>New Client Enquiry</h2>
    <p>A new enquiry has come through from your website.</p>
    <div class="box">
      <div class="row"><span class="label">Name</span><span class="val">${d.firstName} ${d.lastName}</span></div>
      <div class="row"><span class="label">Email</span><span class="val">${d.email}</span></div>
      <div class="row"><span class="label">Location</span><span class="val">${d.location || "—"}</span></div>
      <div class="row"><span class="label">Topic</span><span class="val">${d.topic || "—"}</span></div>
      <div class="row"><span class="label">Format</span><span class="val">${d.format || "No preference"}</span></div>
    </div>
    <p><strong>Their message:</strong></p>
    <div class="box" style="font-style:italic;">"${d.message}"</div>
    <p>Reply directly to <a href="mailto:${d.email}">${d.email}</a> or log into your Google Sheet to update their status.</p>
    <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}" class="btn">View in Google Sheets</a>
  `);
}

function enquiryAutoReplyEmail(d) {
  return emailWrapper("We've received your message", `
    <h2>Thank you, ${d.firstName}! 💙</h2>
    <p>I've received your enquiry and I'm truly glad you reached out. Taking this first step takes courage, and I want you to know you're in a safe and caring space.</p>
    <div class="box">
      <strong>What happens next:</strong><br>
      I'll be in touch within <strong>24–48 hours</strong> to arrange a free, no-obligation consultation call where we can discuss how I can best support you.
    </div>
    <p><strong>Your enquiry summary:</strong></p>
    <div class="box">
      <div class="row"><span class="label">Area of support</span><span class="val">${d.topic || "—"}</span></div>
      <div class="row"><span class="label">Preferred format</span><span class="val">${d.format || "No preference"}</span></div>
    </div>
    <p>In the meantime, feel free to learn more about RTT® and Hypnotherapy at <a href="https://${CONFIG.WEBSITE}">${CONFIG.WEBSITE}</a></p>
    <p>With warmth,<br><span class="gold">Marina Coetzee</span><br>
    Certified RTT® Practitioner &amp; Hypnotherapist<br>${CONFIG.BUSINESS_NAME}</p>
  `);
}

function intakeNotificationEmail(d) {
  const issues = (d.checkedIssues || []).map(i => `<span class="tag">${i}</span>`).join(" ");
  return emailWrapper("New Client Intake", `
    <h2>New Intake Form Submitted</h2>
    <p><strong>${d.firstName} ${d.surname}</strong> has completed their intake form.</p>
    <div class="box">
      <div class="row"><span class="label">Full Name</span><span class="val">${d.firstName} ${d.preferredName ? "("+d.preferredName+")" : ""} ${d.surname}</span></div>
      <div class="row"><span class="label">Date of Birth</span><span class="val">${d.dob || "—"} (Age: ${d.age || "—"})</span></div>
      <div class="row"><span class="label">Email</span><span class="val">${d.email}</span></div>
      <div class="row"><span class="label">Phone</span><span class="val">${d.phone || "—"}</span></div>
      <div class="row"><span class="label">Emergency Contact</span><span class="val">${d.emergencyName || "—"} · ${d.emergencyNumber || "—"}</span></div>
    </div>
    <hr>
    <p><strong>Medical:</strong> ${d.medications || "None stated"}</p>
    <p><strong>Health history:</strong> ${d.healthHistory || "None stated"}</p>
    <p><strong>Areas checked:</strong><br>${issues || "None selected"}</p>
    <p><strong>Additional notes:</strong> ${d.additionalNotes || "—"}</p>
    <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}" class="btn">View in Sheets</a>
  `);
}

function intakeConfirmationEmail(d) {
  return emailWrapper("Intake form received", `
    <h2>Your intake form has been received, ${d.firstName} 🌿</h2>
    <p>Thank you for taking the time to complete your intake form. This helps me prepare a session that is truly tailored to you.</p>
    <div class="box">
      <strong>Next step — Consent Form</strong><br>
      Before our first session, you'll need to read and sign an informed consent form. I'll send that to you shortly, or you may have already received it alongside this message.
    </div>
    <p>If you have any questions before we begin, please don't hesitate to reach out.</p>
    <p>With warmth,<br><span class="gold">Marina Coetzee</span><br>${CONFIG.BUSINESS_NAME}</p>
  `);
}

function consentNotificationEmail(d) {
  return emailWrapper("Consent Form Signed", `
    <h2>Consent Form Completed ✅</h2>
    <p><strong>${d.clientName}</strong> has signed and submitted their informed consent form.</p>
    <div class="box">
      <div class="row"><span class="label">Client</span><span class="val">${d.clientName}</span></div>
      <div class="row"><span class="label">Email</span><span class="val">${d.email}</span></div>
      <div class="row"><span class="label">Date</span><span class="val">${d.consentDate || formatDate(new Date())}</span></div>
      <div class="row"><span class="label">Session Recording</span><span class="val">${d.sessionRecording ? "✅ Agreed" : "❌ Not agreed"}</span></div>
      <div class="row"><span class="label">Consent</span><span class="val">${d.consentAgreed ? "✅ Agreed" : "❌ Not agreed"}</span></div>
      ${d.guardianName ? `<div class="row"><span class="label">Guardian</span><span class="val">${d.guardianName}</span></div>` : ""}
    </div>
    <p>This client is now ready for their first session. Their signed copy has been emailed to them for their records.</p>
    <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}" class="btn">View in Sheets</a>
  `);
}

function consentCopyEmail(d) {
  return emailWrapper("Your signed consent form", `
    <h2>Your consent form — HolisDen 📄</h2>
    <p>Dear ${d.clientName},</p>
    <p>Thank you for reading and signing your informed consent form. A copy of your signed agreement is recorded below for your reference.</p>
    <div class="box">
      <div class="row"><span class="label">Client Name</span><span class="val">${d.clientName}</span></div>
      <div class="row"><span class="label">Date Signed</span><span class="val">${d.consentDate || formatDate(new Date())}</span></div>
      <div class="row"><span class="label">Session Recording</span><span class="val">${d.sessionRecording ? "Agreed" : "Not agreed"}</span></div>
      <div class="row"><span class="label">Informed Consent</span><span class="val">${d.consentAgreed ? "Agreed" : "Not agreed"}</span></div>
    </div>
    <p>If you have any questions about your consent or wish to withdraw at any time, please contact me directly.</p>
    <p>I look forward to working with you. 💙</p>
    <p>With warmth,<br><span class="gold">Marina Coetzee</span><br>
    Certified RTT® Practitioner &amp; Hypnotherapist<br>${CONFIG.BUSINESS_NAME}<br>
    ${CONFIG.PHONE} · marina@holisden.com</p>
  `);
}

function thankYouPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Thank You</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F8FDFD;margin:0;}
  .box{text-align:center;max-width:460px;padding:48px 32px;background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(27,173,168,0.12);}
  .icon{font-size:3rem;margin-bottom:16px;} h1{color:#1BADA8;font-size:1.8rem;margin:0 0 12px;} p{color:#3A4E4E;line-height:1.7;}
  </style></head><body><div class="box">
  <div class="icon">🌿</div><h1>You're all set!</h1>
  <p>Your forms have been received. Marina will be in touch with you shortly.<br><br>Be gentle with yourself. 💙</p>
  </div></body></html>`;
}

// ── UTILITIES ─────────────────────────────────────────────────

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    const headerRow = sheet.getRange(1, 1, 1, headers.length);
    headerRow.setValues([headers]);
    headerRow.setBackground(CONFIG.COLOR_TEAL);
    headerRow.setFontColor("#FFFFFF");
    headerRow.setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160); // Timestamp
  }
  return sheet;
}

function sendEmail({ to, subject, html }) {
  GmailApp.sendEmail(to, subject, "", {
    htmlBody : html,
    name     : `${CONFIG.PRACTITIONER_NAME} | ${CONFIG.BUSINESS_NAME}`,
    replyTo  : CONFIG.PRACTITIONER_EMAIL,
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy");
}
