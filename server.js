const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Google Sheets setup
let sheets;
let gmail;

async function initializeGoogleServices() {
    try {
        // Check if credentials.json exists
        if (!fs.existsSync('credentials.json')) {
            console.error('credentials.json not found. Please provide Google service account credentials.');
            return;
        }

        const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/gmail.send'
            ]
        });

        // Initialize Google Sheets
        sheets = google.sheets({ version: 'v4', auth });

        // Initialize Gmail
        gmail = google.gmail({ version: 'v1', auth });

        console.log('Google services initialized successfully');
    } catch (error) {
        console.error('Error initializing Google services:', error);
    }
}

// Initialize services on startup
initializeGoogleServices().then(() => {
    const hasSpreadsheetId = !!(process.env.SPREADSHEET_ID && process.env.SPREADSHEET_ID.trim());
    console.log('--- Google Sheets config ---');
    console.log('SPREADSHEET_ID in .env:', hasSpreadsheetId ? 'SET' : 'NOT SET (data will NOT save to Sheet)');
    if (hasSpreadsheetId) console.log('SPREADSHEET_ID value:', process.env.SPREADSHEET_ID.trim().substring(0, 20) + '...');
    if (!hasSpreadsheetId) {
        console.log('>>> Create a .env file with SPREADSHEET_ID=your_sheet_id and restart server.');
    }
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields (email is optional)
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required fields.'
            });
        }

        const emailValue = (email && typeof email === 'string' && email.trim()) ? email.trim() : '';

        // Prepare data for Google Sheets
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const rowData = [
            timestamp,
            name,
            emailValue,
            phone,
            message || '',
            'New Contact',
            req.headers['user-agent'] || '',
            req.headers.referer || ''
        ];

        // Save to Google Sheets
        let sheetsResult = null;
        let sheetsSaved = false;
        let sheetsError = null;
        const spreadsheetId = process.env.SPREADSHEET_ID && process.env.SPREADSHEET_ID.trim();
        if (!sheets) {
            sheetsError = 'Google credentials not loaded. Add credentials.json and restart server.';
        } else if (!spreadsheetId) {
            sheetsError = 'SPREADSHEET_ID not set. Add SPREADSHEET_ID=your_sheet_id in .env and restart.';
        } else {
            try {
                const sheetName = await ensureSheetExists(spreadsheetId);
                const range = sheetName + '!A:H';
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: 'RAW',
                    insertDataOption: 'INSERT_ROWS',
                    resource: { values: [rowData] }
                });
                sheetsResult = 'Saved to Google Sheets';
                sheetsSaved = true;
                console.log('Data saved to Google Sheets');
            } catch (sheetsErr) {
                const errMsg = sheetsErr.message || String(sheetsErr);
                const errDetails = sheetsErr.response?.data ? JSON.stringify(sheetsErr.response.data) : '';
                sheetsError = errMsg + (errDetails ? ' ' + errDetails : '');
                sheetsResult = 'Failed to save to Google Sheets';
                console.error('Google Sheets error:', errMsg, errDetails);
            }
        }

        // Send email notification
        let emailResult = null;
        try {
            emailResult = await sendNotificationEmail({
                name,
                email: emailValue,
                phone,
                message: message || '',
                timestamp
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            emailResult = 'Failed to send email';
        }

        // Send confirmation email to user only if they provided email
        let confirmationResult = null;
        if (emailValue) {
            try {
                confirmationResult = await sendConfirmationEmail({
                    name,
                    email: emailValue
                });
            } catch (confirmationError) {
                console.error('Confirmation email error:', confirmationError);
                confirmationResult = 'Failed to send confirmation';
            }
        }

        res.json({
            success: true,
            message: 'Contact form submitted successfully!',
            data: {
                sheets: sheetsResult,
                sheetsSaved,
                sheetsError: sheetsError || undefined,
                notificationEmail: emailResult,
                confirmationEmail: confirmationResult
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request. Please try again later.'
        });
    }
});

// Brochure download: save to Google Sheets (same Contacts sheet, Status = Brochure Download)
app.post('/api/brochure-download', async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required.'
            });
        }
        const emailValue = (email && typeof email === 'string' && email.trim()) ? email.trim() : '';
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const rowData = [
            timestamp,
            name,
            emailValue,
            phone,
            '',
            'Brochure Download',
            req.headers['user-agent'] || '',
            req.headers.referer || ''
        ];
        let sheetsSaved = false;
        let sheetsError = null;
        const spreadsheetId = process.env.SPREADSHEET_ID && process.env.SPREADSHEET_ID.trim();
        if (!sheets) {
            sheetsError = 'Google credentials not loaded. Add credentials.json and restart.';
        } else if (!spreadsheetId) {
            sheetsError = 'SPREADSHEET_ID not set in .env. Add SPREADSHEET_ID=your_sheet_id and restart.';
        } else {
            try {
                const sheetName = await ensureSheetExists(spreadsheetId);
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: sheetName + '!A:H',
                    valueInputOption: 'RAW',
                    insertDataOption: 'INSERT_ROWS',
                    resource: { values: [rowData] }
                });
                sheetsSaved = true;
                console.log('Brochure download saved to Google Sheets');
            } catch (sheetsErr) {
                sheetsError = (sheetsErr.message || String(sheetsErr)) + (sheetsErr.response?.data ? ' ' + JSON.stringify(sheetsErr.response.data) : '');
                console.error('Brochure download Google Sheets error:', sheetsError);
            }
        }
        res.json({
            success: true,
            message: 'Recorded. You can download the brochure.',
            sheetsSaved,
            sheetsError: sheetsError || undefined
        });
    } catch (error) {
        console.error('Brochure download error:', error);
        res.status(500).json({ success: false, message: 'Could not complete. Please try again.' });
    }
});

// Get the sheet name to use (Contacts or first sheet e.g. Sheet1)
function getSheetNameForAppend(spreadsheet) {
    const sheetsList = spreadsheet.data.sheets || [];
    const contactsSheet = sheetsList.find(s => s.properties.title === 'Contacts');
    if (contactsSheet) return 'Contacts';
    if (sheetsList.length > 0) {
        const firstTitle = sheetsList[0].properties.title;
        return firstTitle; // e.g. "Sheet1"
    }
    return 'Contacts';
}

// Ensure the sheet has headers; create Contacts tab if needed. Returns sheet name to use for append.
async function ensureSheetExists(spreadsheetId) {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    let sheetName = getSheetNameForAppend(spreadsheet);

    // If no sheet at all, create Contacts
    if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [{ addSheet: { properties: { title: 'Contacts' } } }]
            }
        });
        sheetName = 'Contacts';
    }

    const headers = [
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Message',
        'Status',
        'User Agent',
        'Referrer'
    ];

    const rangeToUse = sheetName + '!A1:H1';
    try {
        const head = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: rangeToUse
        });
        const firstRow = (head.data.values && head.data.values[0]) || [];
        if (firstRow.length === 0 || !firstRow[0]) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: rangeToUse,
                valueInputOption: 'RAW',
                resource: { values: [headers] }
            });
        }
    } catch (_) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: rangeToUse,
            valueInputOption: 'RAW',
            resource: { values: [headers] }
            });
    }
    return sheetName;
}

// Send notification email to admin
async function sendNotificationEmail(contactData) {
    if (!gmail || !process.env.NOTIFICATION_EMAIL) {
        throw new Error('Gmail not configured');
    }

    const { name, email, phone, message, timestamp } = contactData;

    const subject = `New Contact Form Submission - ${name}`;
    const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a365d;">New Contact Form Submission</h2>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Message:</strong> ${message || 'No message provided'}</p>
                <p><strong>Submitted:</strong> ${timestamp}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
                This email was sent automatically from your website contact form.
            </p>
        </div>
    `;

    const emailMessage = createEmailMessage({
        to: process.env.NOTIFICATION_EMAIL,
        subject,
        html: body
    });

    const response = await gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: emailMessage
        }
    });

    return 'Notification email sent';
}

// Send confirmation email to user
async function sendConfirmationEmail(contactData) {
    if (!gmail) {
        throw new Error('Gmail not configured');
    }

    const { name, email } = contactData;

    const subject = 'Thank you for contacting APEX Greater Noida';
    const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a365d;">Thank You, ${name}!</h2>
            <p>We have received your inquiry about APEX Greater Noida.</p>
            <p>Our team will contact you within 24 hours to discuss your requirements and provide more details about our project.</p>

            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1a365d;">Project Highlights:</h3>
                <ul>
                    <li>Prime location in Greater Noida</li>
                    <li>3 & 4 BHK luxurious apartments</li>
                    <li>Modern amenities and clubhouse</li>
                    <li>APEX Group new launch</li>
                </ul>
            </div>

            <p>For immediate assistance, please contact us.</p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Best regards,<br>
                APEX Greater Noida Team
            </p>
        </div>
    `;

    const emailMessage = createEmailMessage({
        to: email,
        subject,
        html: body
    });

    const response = await gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: emailMessage
        }
    });

    return 'Confirmation email sent';
}

// Helper function to create email message
function createEmailMessage({ to, subject, html }) {
    const email = [
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        html
    ].join('\r\n');

    // Base64 encode the email
    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return encodedEmail;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            sheets: !!sheets,
            gmail: !!gmail,
            spreadsheetId: !!process.env.SPREADSHEET_ID
        }
    });
});

// Check if Google Sheet is reachable (use this to debug "sheet not updating")
app.get('/api/sheets-check', async (req, res) => {
    if (!sheets) {
        return res.json({ ok: false, error: 'Google credentials not loaded. Add credentials.json and restart.' });
    }
    if (!process.env.SPREADSHEET_ID || !process.env.SPREADSHEET_ID.trim()) {
        return res.json({ ok: false, error: 'SPREADSHEET_ID not set. Add SPREADSHEET_ID=your_id in .env and restart.' });
    }
    try {
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: process.env.SPREADSHEET_ID.trim()
        });
        const sheetName = getSheetNameForAppend(spreadsheet);
        res.json({
            ok: true,
            message: 'Sheet is accessible. Data will be saved to tab: "' + sheetName + '"',
            sheetName
        });
    } catch (err) {
        const msg = err.message || String(err);
        const code = err.code || err.response?.status;
        const details = err.response?.data ? JSON.stringify(err.response.data) : '';
        console.error('Sheets check error:', msg, code, details);
        let hint = 'Check: 1) SPREADSHEET_ID is correct (from sheet URL). 2) Share the sheet with the service account email from credentials.json (Editor access).';
        res.json({ ok: false, error: msg, code, details: details || undefined, hint });
    }
});

// Test Sheet write: append one row to verify sheet update works
app.post('/api/sheets-test', async (req, res) => {
    if (!sheets) {
        return res.json({ ok: false, error: 'credentials.json not loaded. Add file and restart.' });
    }
    const spreadsheetId = process.env.SPREADSHEET_ID && process.env.SPREADSHEET_ID.trim();
    if (!spreadsheetId) {
        return res.json({ ok: false, error: 'SPREADSHEET_ID missing in .env. Add SPREADSHEET_ID=your_sheet_id' });
    }
    const testRow = [
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        'Test Name',
        'test@test.com',
        '9999999999',
        'Sheet test',
        'Test',
        '',
        ''
    ];
    try {
        const sheetName = await ensureSheetExists(spreadsheetId);
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: sheetName + '!A:H',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: [testRow] }
        });
        res.json({ ok: true, message: 'Test row added to sheet tab: ' + sheetName });
    } catch (err) {
        const msg = err.message || String(err);
        const details = err.response?.data ? JSON.stringify(err.response.data) : '';
        res.json({
            ok: false,
            error: msg,
            details: details || undefined,
            hint: 'Share the Google Sheet with the service account email from credentials.json (Editor).'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;