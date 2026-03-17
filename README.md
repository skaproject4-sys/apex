# SKA Siddharth Vihar - Contact Form Backend

A complete contact form solution with Google Sheets integration and automated email notifications for SKA Siddharth Vihar real estate project.

## Features

- **Contact Form Processing**: Accepts Name, Phone, Email, and Message
- **Google Sheets Integration**: Automatically saves form submissions to Google Sheets
- **Email Notifications**: Sends instant email alerts to admin
- **User Confirmation Emails**: Sends thank you emails to form submitters
- **Form Validation**: Client-side and server-side validation
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface
- **Error Handling**: Comprehensive error handling and user feedback

## Collected Data Fields

The contact form collects and stores:
- **Name**: Contact person's full name
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Message**: Optional message/inquiry
- **Timestamp**: Submission date and time (IST)
- **User Agent**: Browser/device information
- **Referrer**: Page URL where form was submitted

## Project Structure

```
ska-siddharth-vihar/
├── index.html              # Main HTML file with contact form
├── style.css               # Custom styles
├── script.js               # Frontend JavaScript
├── server.js               # Node.js backend server
├── setup-google-sheets.js  # Google Sheets setup script
├── package.json            # Node.js dependencies
├── env.example             # Environment variables template
├── .env                    # Environment variables (create from env.example)
├── credentials.json        # Google API credentials (you provide)
├── .gitignore             # Git ignore rules
├── images/                 # Image assets
│   └── image.png          # Company logo
└── README.md              # This file
```

## Prerequisites

- **Node.js** (version 16 or higher)
- **Google Cloud Project** with Sheets and Gmail APIs enabled
- **Google Service Account** with proper credentials

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Cloud Setup

#### Create a Google Cloud Project:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Gmail API

#### Create Service Account:
1. Go to "IAM & Admin" > "Service Accounts"
2. Create a new service account
3. Generate a JSON key and download `credentials.json`
4. Place `credentials.json` in the project root

#### Configure API Permissions:
1. Share your Google Sheet with the service account email
2. Grant "Editor" access to the service account

### 3. Environment Configuration

```bash
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Google Services Configuration
SPREADSHEET_ID=your_google_sheets_id_here

# Email Configuration
NOTIFICATION_EMAIL=admin@yourcompany.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Setup Google Sheets

```bash
npm run setup-sheets
```

This will:
- Create a new Google Sheet automatically
- Set up headers for contact form data
- Update your `.env` file with the spreadsheet ID

### 5. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to see your website.

## API Endpoints

### POST `/api/contact`
Submits contact form data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-1234567890",
  "message": "Interested in 3BHK apartment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully!",
  "data": {
    "sheets": "Saved to Google Sheets",
    "notificationEmail": "Notification email sent",
    "confirmationEmail": "Confirmation email sent"
  }
}
```

### GET `/api/health`
Health check endpoint for monitoring services.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-17T10:30:00.000Z",
  "services": {
    "sheets": true,
    "gmail": true,
    "spreadsheetId": true
  }
}
```

## Google Sheets Data Structure

The contact form data is saved with the following columns:
- **Timestamp**: Submission date/time (IST)
- **Name**: Contact person's name
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Message**: Additional message/inquiry
- **Status**: Current status (New, Contacted, etc.)
- **User Agent**: Browser/device information
- **Referrer**: URL where form was submitted

## Email Functionality

### Admin Notification Email
- Sent to `NOTIFICATION_EMAIL` when a form is submitted
- Contains all contact details and submission information
- HTML formatted for better readability

### User Confirmation Email
- Sent to the user's email address
- Thanks them for their interest
- Provides project highlights and contact information

## Form Validation

### Client-side Validation
- Required field validation
- Email format validation
- Phone number format validation
- Real-time feedback

### Server-side Validation
- Required field validation
- Data sanitization
- Duplicate submission prevention
- Error logging

## Security Features

- Input sanitization and validation
- CORS protection
- Rate limiting considerations
- Secure credential storage
- Error handling without data leakage

## Monitoring & Logging

- Server logs all form submissions
- Health check endpoint for service monitoring
- Error logging for debugging
- Google API quota monitoring

## Troubleshooting

### Common Issues

1. **Google API Authentication Errors**
   - Verify `credentials.json` is in the correct location
   - Check that APIs are enabled in Google Cloud Console
   - Ensure service account has proper permissions

2. **Email Sending Issues**
   - Verify Gmail API is enabled
   - Check service account permissions
   - Monitor Google Cloud quotas

3. **Google Sheets Access**
   - Share the spreadsheet with the service account email
   - Grant "Editor" permissions to the service account
   - Check spreadsheet ID in `.env` file

4. **Form Submission Errors**
   - Check browser console for JavaScript errors
   - Verify server is running and accessible
   - Check network connectivity

### Logs and Monitoring

- Server logs are output to the console
- Health check endpoint: `GET /api/health`
- Check Google Sheets for form submission data
- Monitor email delivery in Gmail sent items

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Environment Variables for Production
Make sure to set all environment variables in your production environment.

## Customization

### Form Fields
Edit the HTML form in `index.html` to modify:
- Field labels and placeholders
- Required fields
- Form styling

### Email Templates
Modify email templates in `server.js`:
- Admin notification email content
- User confirmation email content
- Email styling and branding

### Google Sheets Structure
Update column headers in `setup-google-sheets.js` and `server.js` to match your requirements.

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Dependencies

### Runtime Dependencies
- **express**: Web framework for Node.js
- **googleapis**: Google APIs client library
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Auto-restart during development

## Security Notes

- Never commit `credentials.json` to version control
- Use environment variables for sensitive data
- Regularly rotate service account keys
- Monitor Google Cloud usage and costs
- Keep server and dependencies updated

## Support

For technical support or customization:
- Check the health endpoint for service status
- Review server logs for error details
- Verify Google API quotas and limits

## License

This project is created for SKA Siddharth Vihar real estate project. All rights reserved.

---

**Disclaimer**: This contact form system is designed for lead generation and customer inquiry management. Ensure compliance with local data protection laws and privacy regulations.