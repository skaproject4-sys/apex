const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

async function setupGoogleSheets() {
    try {
        console.log('🔧 Setting up Google Sheets for APEX Greater Noida contact form...\n');

        // Check if credentials.json exists
        if (!fs.existsSync('credentials.json')) {
            console.error('❌ credentials.json not found!');
            console.log('Please follow these steps:');
            console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
            console.log('2. Create a new project or select existing one');
            console.log('3. Enable Google Sheets API and Gmail API');
            console.log('4. Create a Service Account and download the JSON key as credentials.json');
            console.log('5. Place credentials.json in the project root directory');
            process.exit(1);
        }

        console.log('✅ Found credentials.json');

        // Load credentials
        const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Create new spreadsheet
        console.log('📊 Creating Google Spreadsheet...');
        const spreadsheet = await sheets.spreadsheets.create({
            resource: {
                properties: {
                    title: 'APEX Greater Noida - Contact Form Submissions',
                    locale: 'en_IN'
                },
                sheets: [{
                    properties: {
                        title: 'Contacts',
                        gridProperties: {
                            frozenRowCount: 1
                        }
                    }
                }]
            }
        });

        const spreadsheetId = spreadsheet.data.spreadsheetId;
        const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

        console.log('✅ Spreadsheet created successfully!');
        console.log(`📋 Spreadsheet ID: ${spreadsheetId}`);
        console.log(`🔗 Spreadsheet URL: ${spreadsheetUrl}\n`);

        // Add headers
        console.log('📝 Adding column headers...');
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

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Contacts!A1:H1',
            valueInputOption: 'RAW',
            resource: {
                values: [headers]
            }
        });

        // Format headers
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [{
                    repeatCell: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: 8
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: {
                                    red: 0.2,
                                    green: 0.4,
                                    blue: 0.6
                                },
                                textFormat: {
                                    foregroundColor: {
                                        red: 1,
                                        green: 1,
                                        blue: 1
                                    },
                                    bold: true
                                }
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat)'
                    }
                }, {
                    updateSheetProperties: {
                        properties: {
                            sheetId: 0,
                            title: 'Contacts',
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        },
                        fields: 'title,gridProperties.frozenRowCount'
                    }
                }]
            }
        });

        console.log('✅ Headers formatted successfully!');

        // Update .env file
        console.log('📝 Updating .env file...');
        let envContent = '';
        if (fs.existsSync('.env')) {
            envContent = fs.readFileSync('.env', 'utf8');
        } else {
            envContent = fs.readFileSync('env.example', 'utf8');
        }

        // Update or add SPREADSHEET_ID
        const spreadsheetIdRegex = /^SPREADSHEET_ID=.*/m;
        if (spreadsheetIdRegex.test(envContent)) {
            envContent = envContent.replace(spreadsheetIdRegex, `SPREADSHEET_ID=${spreadsheetId}`);
        } else {
            envContent += `\nSPREADSHEET_ID=${spreadsheetId}`;
        }

        fs.writeFileSync('.env', envContent.trim());
        console.log('✅ .env file updated with spreadsheet ID!');

        // Share spreadsheet with service account
        console.log('🔗 Sharing spreadsheet with service account...');
        const drive = google.drive({ version: 'v3', auth });
        await drive.permissions.create({
            fileId: spreadsheetId,
            resource: {
                type: 'user',
                role: 'writer',
                emailAddress: credentials.client_email
            }
        });

        console.log('✅ Spreadsheet shared with service account!');

        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Copy the spreadsheet URL and keep it safe');
        console.log('2. Update NOTIFICATION_EMAIL in .env file');
        console.log('3. Run the server with: npm start');
        console.log('4. Test the contact form');

        console.log('\n🔐 Important:');
        console.log('- Keep credentials.json secure and never commit it to version control');
        console.log('- Regularly backup your Google Sheets data');
        console.log('- Monitor your Google Cloud usage and quotas');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        if (error.code === 403) {
            console.log('\n🔍 Troubleshooting:');
            console.log('- Make sure Google Sheets API is enabled in Google Cloud Console');
            console.log('- Verify service account has proper permissions');
            console.log('- Check that credentials.json is valid');
        }
        process.exit(1);
    }
}

// Run setup
setupGoogleSheets();