const {google} = require('googleapis');

// Create authentication object
const auth = new google.auth.GoogleAuth({
    keyFile: "client_secret.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
});

async function accessSpreadsheet() {
    // Create client
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({
        version: "v4", 
        auth: client
    });

    const spreadsheetId = "";

    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
        auth, // equivalent to auth: auth
        spreadsheetId // again, equivalent to spreadsheetId: spreadsheetId
    });
    //console.log(metaData.data.sheets);

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Logistics!FC:FC" // <Exact name of sheet> OR <Exact name of sheet><!><Initial column><:><end column>
    });
    //console.log(getRows.data);

    return getRows.data;
}

(async () => {
    const rotation = await accessSpreadsheet();
    console.log(rotation.values[19].toString());

})();