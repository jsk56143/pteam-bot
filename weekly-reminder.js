// Date: 07/13/2022
// Author: Josh Kim 

/* 1. Add Day and Date in SpreadSheet
*  2. Tag user ID: not a good idea bc if someone updates the schedule, then you'd have to notify a different person
* Text formatting: https://api.slack.com/reference/surfaces/formatting
* Work on adding future rotations
* Work on adding update daily
*/


// Enums for all rows
const SHEET_ROWS = {
  DAY: "Day",
  DATE: "Date",
  ROTATION_STATUS: "Rotation Status",
  PRAYER_LEAD: "Prayer Lead",
  VID_DIRECTOR: "Vid Director",
  PROPRES: "ProPres",
  CAM1OP: "Cam 1 Op",
  CAM2OP: "Cam 2 Op",
  CAM3OP: "Cam 3 Op",
  EDITOR: "Editor",
  HELP: "Help",
  TRAINING: "Shadow/Training",
  YOUTH_ASSISTANTS: "Youth Assistants"
}

const spreadsheet = SpreadsheetApp.openById("1TlPboL6wBnEKFkOQW0rii0aBevuGK4PW0bFW1a8kqA0");
const logistics_sheet = spreadsheet.getSheetByName("Logistics");
let rotation_fieldCount = 12; // Update this if you add more fields to the rotation object

function weeklyRotations() {
  let postMessage_payload = formatPayload();
  let post_message_request = requestSlack("POST", "chat.postMessage", postMessage_payload);
  console.log("POST message request: " + post_message_request);
  rest();
}

function getLatestRotations() {
  let startingCol = parseInt(readStartingSheetColumn());
  if (startingCol == -1) {
    console.log("Key-value pair data not saved. Check the Script Properties in the Settings.")
  }
  console.log("Starting col: " + startingCol);
  //saveStartingSheetColumn(startingCol + 2);

  let values = logistics_sheet.getRange(1,startingCol,20,2).getValues(); // getRange(starting row index, starting column index, num. of rows to return, num. of cols to return)
  //console.log(values);

  let rows = getRows();

  const rotations = {
    first: {
      day: getFormattedDay(values[rows.day][0]),
      date: getFormattedDate(values[3][0]),
      rotationStatus: values[rows.rotationStatus][0],
      prayerLead: values[rows.prayerLead][0],
      vidDirector: values[rows.vidDirector][0],
      proPres: values[rows.proPres][0],
      cam1OP: values[rows.cam1OP][0],
      cam2OP: values[rows.cam2OP][0],
      cam3OP: values[rows.cam3OP][0],
      editor: values[rows.editor][0],
      help: values[rows.help][0],
      training: values[rows.training][0],
      youthAssistants: values[rows.youthAssistants][0]
    },
    second: {
      day: getFormattedDay(values[rows.day][1]),
      date: getFormattedDate(values[3][1]),
      rotationStatus: values[rows.rotationStatus][1],
      prayerLead: values[rows.prayerLead][1],
      vidDirector: values[rows.vidDirector][1],
      proPres: values[rows.proPres][1],
      cam1OP: values[rows.cam1OP][1],
      cam2OP: values[rows.cam2OP][1],
      cam3OP: values[rows.cam3OP][1],
      editor: values[rows.editor][1],
      help: values[rows.help][1],
      training: values[rows.training][1],
      youthAssistants: values[rows.youthAssistants][1]
    }
  }
  //console.log(rotations);
  return rotations;
}

/*==============================
* HELPER FUNCTIONS
==============================*/

// Get row of prayerLead
// Don't want to hardcode row bc of possible changes to spreadsheet (Example: Most recent addition was the role of Editor)
function getRows() {
  let values = logistics_sheet.getRange(1,1,31).getValues();
  //console.log(values);

  const rows = {}; // row for each roles
  for (let i = 0; i < values.length; i++) {
    switch(values[i][0]) {
      case SHEET_ROWS.DAY:
        rows.day = i;
        break;
      case SHEET_ROWS.DATE:
        rows.date = i;
        break;
      case SHEET_ROWS.ROTATION_STATUS:
        rows.rotationStatus = i;
        break;
      case SHEET_ROWS.PRAYER_LEAD:
        rows.prayerLead = i;
        break;
      case SHEET_ROWS.VID_DIRECTOR:
        rows.vidDirector = i;
        break;
      case SHEET_ROWS.PROPRES:
        rows.proPres = i;
        break;
      case SHEET_ROWS.CAM1OP:
        rows.cam1OP = i;
        break;
      case SHEET_ROWS.CAM2OP:
        rows.cam2OP = i;
        break;
      case SHEET_ROWS.CAM3OP:
        rows.cam3OP = i;
        break;
      case SHEET_ROWS.EDITOR: 
        rows.editor = i;
        break;
      case SHEET_ROWS.HELP:
        rows.help = i;
        break;
      case SHEET_ROWS.TRAINING:
        rows.training = i;
        break;
      case SHEET_ROWS.YOUTH_ASSISTANTS:
        rows.youthAssistants = i;
        break;
      default:
        rows.unknown = -1;
        break;
    }
  }
  //console.log(rows);
  return rows;
}

function saveStartingSheetColumn() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('NEW_COL', 162);
  } catch (err) {
    Logger.log('Failed with error %s', err.message);
  }
}

function readStartingSheetColumn() {
  try {
    // Get the value for the user property 'DISPLAY_UNITS'.
    const userProperties = PropertiesService.getUserProperties();
    const col = userProperties.getProperty('NEW_COL');
    console.log("col: " + col);
    return col;
  } catch (err) {
    // TODO (developer) - Handle exception
    console.log("col: " + col);
    return -1;
  }
}

//https://stackoverflow.com/questions/11591854/format-date-to-mm-dd-yyyy-in-javascript
function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
  
    return month + '/' + day + '/' + year;
}

function getFormattedDay(day) {
  if (day == "FRIDAY") {
    return "Friday";
  } else if (day == "SUNDAY") {
    return "Sunday";
  } else {
    return -1;
  }
}

function formatPayload() {
  let rotation = getLatestRotations();
  let payload = {
    channel: "<>",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Weekly Rotations Update* \n"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `` 
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ``
        }
      },
      {
        type: "divider",
        block_id: "divider1"
		  },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `B`
        }
      }
    ]
  };

  let first = `*${rotation.first.day} (${rotation.first.date})*: *_${rotation.first.rotationStatus}_* \n`;
  let second = `*${rotation.second.day} (${rotation.second.date})*: *_${rotation.second.rotationStatus}_* \n`;

  if (rotation.first.prayerLead) {
     first += `>${SHEET_ROWS.PRAYER_LEAD}: *${rotation.first.prayerLead}* \n`;
  }
  if (rotation.first.vidDirector) {
     first += `>${SHEET_ROWS.VID_DIRECTOR}: *${rotation.first.vidDirector}* \n`;
  }
  if (rotation.first.proPres) {
     first += `>${SHEET_ROWS.PROPRES}: *${rotation.first.proPres}* \n`;
  }
  if (rotation.first.cam1OP) {
     first += `>${SHEET_ROWS.CAM1OP}: *${rotation.first.cam1OP}* \n`;
  }
  if (rotation.first.cam2OP) {
     first += `>${SHEET_ROWS.CAM2OP}: *${rotation.first.cam2OP}* \n`;
  }
  if (rotation.first.cam3OP) {
     first += `>${SHEET_ROWS.CAM3OP}: *${rotation.first.cam3OP}* \n`;
  }
  if (rotation.first.editor) {
     first += `>${SHEET_ROWS.EDITOR}: *${rotation.first.editor}* \n`;
  }
  if (rotation.first.help) {
     first += `>${SHEET_ROWS.HELP}: *${rotation.first.help}* \n`;
  }
  if (rotation.first.training) {
     first += `>${SHEET_ROWS.TRAINING}: *${rotation.first.training}* \n`;
  }
  if (rotation.first.youthAssistants) {
     first += `>${SHEET_ROWS.YOUTH_ASSISTANTS}: *${rotation.friday.youthAssistants}* \n`;
  }


  if (rotation.second.prayerLead) {
     second += `>${SHEET_ROWS.PRAYER_LEAD}: *${rotation.second.prayerLead}* \n`;
  }
  if (rotation.second.vidDirector) {
     second += `>${SHEET_ROWS.VID_DIRECTOR}: *${rotation.second.vidDirector}* \n`;
  }
  if (rotation.second.proPres) {
     second += `>${SHEET_ROWS.PROPRES}: *${rotation.second.proPres}* \n`;
  }
  if (rotation.second.cam1OP) {
     second += `>${SHEET_ROWS.CAM1OP}: *${rotation.second.cam1OP}* \n`;
  }
  if (rotation.second.cam2OP) {
     second += `>${SHEET_ROWS.CAM2OP}: *${rotation.second.cam2OP}* \n`;
  }
  if (rotation.second.cam3OP) {
     second += `>${SHEET_ROWS.CAM3OP}: *${rotation.second.cam3OP}* \n`;
  }
  if (rotation.second.editor) {
     second += `>${SHEET_ROWS.EDITOR}: *${rotation.second.editor}* \n`;
  }
  if (rotation.second.help) {
     second += `>${SHEET_ROWS.HELP}: *${rotation.second.help}* \n`;
  }
  if (rotation.second.training) {
     second += `>${SHEET_ROWS.TRAINING}: *${rotation.second.training}* \n`;
  }
  if (rotation.second.youthAssistants) {
     second += `>${SHEET_ROWS.YOUTH_ASSISTANTS}: *${rotation.second.youthAssistants}* \n`;
  }
   
  payload.blocks[1].text.text = first;
  payload.blocks[2].text.text = second;

  return payload;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rest() {
  console.log('Taking a break...');
  await sleep(5000);
  console.log('Five seconds later');
}

function requestSlack(method, endpoint, params) {
  const base_url = "https://slack.com/api/";
  const headers = {
    'Authorization': "<>",
    'Content-Type': 'application/json'
  };
  const options = {
    headers: headers,
    method: method
  };

  let request_url;
  if (method == "POST") {
    request_url = base_url + endpoint;
    options.payload = JSON.stringify(params);
  } else {
    request_url = base_url + endpoint + params;
  }

  const response = UrlFetchApp.fetch(request_url, options).getContentText();
  const json = JSON.parse(response);

  return {
    response_code: json.ok,
    response_data: json
  };
}
