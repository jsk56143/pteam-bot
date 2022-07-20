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

/*
// Enums for all users of this script
const USERS = {
  JEVONS: "Jevons"
}
var userArray = Object.values(USERS);
*/
const user = "Josh"
//const userID = "U03P9EMLB98" // memberID in Slack

const spreadsheet = SpreadsheetApp.openById("1TlPboL6wBnEKFkOQW0rii0aBevuGK4PW0bFW1a8kqA0");
const logistics_sheet = spreadsheet.getSheetByName("Logistics");
let rotation_fieldCount = 12; // Update this if you add more fields to the rotation object

/*
function sendWeeklyRotations() {
  for (let i = 0; i < userArray.length; i++) {
    let postMessage_payload = formatPayload(userArray[i]);
    let post_message_request = requestSlack("POST", "chat.postMessage", postMessage_payload);
    Logger.log("POST message request: " + post_message_request);
    rest();
  }
}

function updateHourlyRotations() {
  for (let i = 0; i < userArray.length; i++) {
    let postMessage_payload = formatPayload(userArray[i]);
    let post_message_request = requestSlack("POST", "chat.update", postMessage_payload);
    Logger.log("POST message request: " + post_message_request);
    rest();
  }
}
*/

function sendWeeklyRotations() {
  let postMessage_payload = formatPayload_postMessage(user);
  let post_message_request = requestSlack("POST", "chat.postMessage", postMessage_payload);
  console.log("AAAAA: " + post_message_request.response_data.ts);
  Logger.log("Post message request: " + JSON.stringify(post_message_request));
  saveTimestamp(post_message_request.response_data.ts);
  saveChannelID(post_message_request.response_data.channel);
}

function updateHourlyRotations() {
  let ts = readTimestamp();
  let channelID = readChannelID();
  let updateMessage_payload = formatPayload_updatePost(user, ts, channelID);
  let update_message_request = requestSlack("POST", "chat.update", updateMessage_payload);
  Logger.log("Update message request: " + JSON.stringify(update_message_request));
  saveTimestamp(update_message_request.response_data.ts)
  rest();
}



function getLatestRotations() {
  let startingCol = parseInt(readStartingSheetColumn());
  if (startingCol == -1) {
    console.log("Key-value pair data not saved. Check the Script Properties in the Settings.")
  }
  console.log("Starting col: " + startingCol);
  saveStartingSheetColumn(startingCol + 2);

  let values = logistics_sheet.getRange(1,startingCol,20,4).getValues(); // getRange(starting row index, starting column index, num. of rows to return, num. of cols to return)
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
    },
    third: {
      day: getFormattedDay(values[rows.day][2]),
      date: getFormattedDate(values[3][2]),
      rotationStatus: values[rows.rotationStatus][2],
      prayerLead: values[rows.prayerLead][2],
      vidDirector: values[rows.vidDirector][2],
      proPres: values[rows.proPres][2],
      cam1OP: values[rows.cam1OP][2],
      cam2OP: values[rows.cam2OP][2],
      cam3OP: values[rows.cam3OP][2],
      editor: values[rows.editor][2],
      help: values[rows.help][2],
      training: values[rows.training][2],
      youthAssistants: values[rows.youthAssistants][2]
    },
    fourth: {
      day: getFormattedDay(values[rows.day][3]),
      date: getFormattedDate(values[3][3]),
      rotationStatus: values[rows.rotationStatus][3],
      prayerLead: values[rows.prayerLead][3],
      vidDirector: values[rows.vidDirector][3],
      proPres: values[rows.proPres][3],
      cam1OP: values[rows.cam1OP][3],
      cam2OP: values[rows.cam2OP][3],
      cam3OP: values[rows.cam3OP][3],
      editor: values[rows.editor][3],
      help: values[rows.help][3],
      training: values[rows.training][3],
      youthAssistants: values[rows.youthAssistants][3]
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

function saveStartingSheetColumn(startingCol) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('NEW_COL', startingCol);
  } catch (err) {
    Logger.log('Failed saving starting sheet column: %s', err.message);
  }
}

function readStartingSheetColumn() {
  try {
    // Get the value for the user property 'NEW_COL'.
    const userProperties = PropertiesService.getUserProperties();
    const col = userProperties.getProperty('NEW_COL');
    console.log("col: " + col);
    Logger.log("Read starting sheet column: "+ col);
    return col;
  } catch (err) {
    // TODO (developer) - Handle exception
    Logger.log('Failed reading starting sheet column: %s', err.message);
    return -1;
  }
}

function saveTimestamp(timestamp) {
  try {
    Logger.log("Save timestamp: " + timestamp);
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('Josh_ts', timestamp);
  } catch (err) {
    Logger.log('Failed saving timestamp: %s', err.message);
  }
}

function readTimestamp() {
  try {
    // Get the value for the user property 'Josh_ts'.
    const userProperties = PropertiesService.getUserProperties();
    const ts = userProperties.getProperty('Josh_ts');
    Logger.log("Read Josh_timestamp: " + ts);
    return ts;
  } catch (err) {
    // TODO (developer) - Handle exception
    Logger.log('Failed reading Josh_timestamp: %s', err.message);
    return -1;
  }
}

function saveChannelID(channelID) {
  try {
    Logger.log("Save Josh_channelID: " + channelID);
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('Josh_channelID', channelID);
  } catch (err) {
    Logger.log('Failed saving Josh_channelID: %s', err.message);
  }
}

function readChannelID() {
  try {
    // Get the value for the user property 'Josh_channelID'.
    const userProperties = PropertiesService.getUserProperties();
    const channelID = userProperties.getProperty('Josh_channelID');
    Logger.log("Read Josh_channelID: " + channelID);
    return channelID;
  } catch (err) {
    // TODO (developer) - Handle exception
    Logger.log('Failed reading Josh_channelID: %s', err.message);
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
    return "Not Friday/Sunday";
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rest() {
  console.log('Taking a break...');
  await sleep(5000);
  console.log('Five seconds later');
}

function formatPayload_postMessage(user) {
  let rotation = getLatestRotations();
  let payload = {
    channel: "U03P9EMLB98",
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
          text: ``
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ``
        }
      }
    ]
  };

  let first = `*${rotation.first.day} (${rotation.first.date})*: *_${rotation.first.rotationStatus}_* \n`;
  let second = `*${rotation.second.day} (${rotation.second.date})*: *_${rotation.second.rotationStatus}_* \n`;
  let third = `*${rotation.third.day} (${rotation.third.date})*: *_${rotation.third.rotationStatus}_* \n`;
  let fourth = `*${rotation.fourth.day} (${rotation.fourth.date})*: *_${rotation.fourth.rotationStatus}_* \n`;

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

  if (rotation.third.prayerLead.includes(user, 0)) {
     third += `>${SHEET_ROWS.PRAYER_LEAD}: *${rotation.third.prayerLead}* \n`;
  }
  if (rotation.third.vidDirector.includes(user, 0)) {
     third += `>${SHEET_ROWS.VID_DIRECTOR}: *${rotation.third.vidDirector}* \n`;
  }
  if (rotation.third.proPres.includes(user, 0)) {
     third += `>${SHEET_ROWS.PROPRES}: *${rotation.third.proPres}* \n`;
  }
  if (rotation.third.cam1OP.includes(user, 0)) {
     third += `>${SHEET_ROWS.CAM1OP}: *${rotation.third.cam1OP}* \n`;
  }
  if (rotation.third.cam2OP.includes(user, 0)) {
     third += `>${SHEET_ROWS.CAM2OP}: *${rotation.third.cam2OP}* \n`;
  }
  if (rotation.third.cam3OP.includes(user, 0)) {
     third += `>${SHEET_ROWS.CAM3OP}: *${rotation.third.cam3OP}* \n`;
  }
  if (rotation.third.editor.includes(user, 0)) {
     third += `>${SHEET_ROWS.EDITOR}: *${rotation.third.editor}* \n`;
  }
  if (rotation.third.help.includes(user, 0)) {
     third += `>${SHEET_ROWS.HELP}: *${rotation.third.help}* \n`;
  }
  if (rotation.third.training.includes(user, 0)) {
     third += `>${SHEET_ROWS.TRAINING}: *${rotation.third.training}* \n`;
  }
  if (rotation.third.youthAssistants.includes(user, 0)) {
     third += `>${SHEET_ROWS.YOUTH_ASSISTANTS}: *${rotation.third.youthAssistants}* \n`;
  }

  if (rotation.fourth.prayerLead.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.PRAYER_LEAD}: *${rotation.fourth.prayerLead}* \n`;
  }
  if (rotation.fourth.vidDirector.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.VID_DIRECTOR}: *${rotation.fourth.vidDirector}* \n`;
  }
  if (rotation.fourth.proPres.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.PROPRES}: *${rotation.fourth.proPres}* \n`;
  }
  if (rotation.fourth.cam1OP.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.CAM1OP}: *${rotation.fourth.cam1OP}* \n`;
  }
  if (rotation.fourth.cam2OP.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.CAM2OP}: *${rotation.fourth.cam2OP}* \n`;
  }
  if (rotation.fourth.cam3OP.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.CAM3OP}: *${rotation.fourth.cam3OP}* \n`;
  }
  if (rotation.fourth.editor.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.EDITOR}: *${rotation.fourth.editor}* \n`;
  }
  if (rotation.fourth.help.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.HELP}: *${rotation.fourth.help}* \n`;
  }
  if (rotation.fourth.training.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.TRAINING}: *${rotation.fourth.training}* \n`;
  }
  if (rotation.fourth.youthAssistants.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.YOUTH_ASSISTANTS}: *${rotation.fourth.youthAssistants}* \n`;
  }
   
  payload.blocks[1].text.text = first;
  payload.blocks[2].text.text = second;
  payload.blocks[4].text.text = third;
  payload.blocks[5].text.text = fourth;

  return payload;
}

function formatPayload_updatePost(user, timestamp, channelID) {
  let rotation = getLatestRotations();
  let payload = {
    channel: channelID,
    ts: timestamp,
    as_user: true,
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
          text: ``
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ``
        }
      }
    ]
  };

  let first = `*${rotation.first.day} (${rotation.first.date})*: *_${rotation.first.rotationStatus}_* \n`;
  let second = `*${rotation.second.day} (${rotation.second.date})*: *_${rotation.second.rotationStatus}_* \n`;
  let third = `*${rotation.third.day} (${rotation.third.date})*: *_${rotation.third.rotationStatus}_* \n`;
  let fourth = `*${rotation.fourth.day} (${rotation.fourth.date})*: *_${rotation.fourth.rotationStatus}_* \n`;

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

  if (rotation.third.prayerLead.includes(user, 0)) {
     third += `>${SHEET_ROWS.PRAYER_LEAD}: *${rotation.third.prayerLead}* \n`;
  }
  if (rotation.third.vidDirector.includes(user, 0)) {
     third += `>${SHEET_ROWS.VID_DIRECTOR}: *${rotation.third.vidDirector}* \n`;
  }
  if (rotation.third.proPres.includes(user, 0)) {
     third += `>${SHEET_ROWS.PROPRES}: *${rotation.third.proPres}* \n`;
  }
  if (rotation.third.cam1OP.includes(user, 0)) {
     third += `>${SHEET_ROWS.CAM1OP}: *${rotation.third.cam1OP}* \n`;
  }
  if (rotation.third.cam2OP.includes(user, 0)) {
     third += `>${SHEET_ROWS.CAM2OP}: *${rotation.third.cam2OP}* \n`;
  }
  if (rotation.third.cam3OP.includes(user, 0)) {
     third += `>${SHEET_ROWS.CAM3OP}: *${rotation.thirdd.cam3OP}* \n`;
  }
  if (rotation.third.editor.includes(user, 0)) {
     third += `>${SHEET_ROWS.EDITOR}: *${rotation.third.editor}* \n`;
  }
  if (rotation.third.help.includes(user, 0)) {
     third += `>${SHEET_ROWS.HELP}: *${rotation.third.help}* \n`;
  }
  if (rotation.third.training.includes(user, 0)) {
     third += `>${SHEET_ROWS.TRAINING}: *${rotation.third.training}* \n`;
  }
  if (rotation.third.youthAssistants.includes(user, 0)) {
     third += `>${SHEET_ROWS.YOUTH_ASSISTANTS}: *${rotation.third.youthAssistants}* \n`;
  }

  if (rotation.fourth.prayerLead.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.PRAYER_LEAD}: *${rotation.fourth.prayerLead}* \n`;
  }
  if (rotation.fourth.vidDirector.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.VID_DIRECTOR}: *${rotation.fourth.vidDirector}* \n`;
  }
  if (rotation.fourth.proPres.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.PROPRES}: *${rotation.fourth.proPres}* \n`;
  }
  if (rotation.fourth.cam1OP.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.CAM1OP}: *${rotation.fourth.cam1OP}* \n`;
  }
  if (rotation.fourth.cam2OP.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.CAM2OP}: *${rotation.fourth.cam2OP}* \n`;
  }
  if (rotation.fourth.cam3OP.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.CAM3OP}: *${rotation.fourth.cam3OP}* \n`;
  }
  if (rotation.fourth.editor.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.EDITOR}: *${rotation.fourth.editor}* \n`;
  }
  if (rotation.fourth.help.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.HELP}: *${rotation.fourth.help}* \n`;
  }
  if (rotation.fourth.training.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.TRAINING}: *${rotation.fourth.training}* \n`;
  }
  if (rotation.fourth.youthAssistants.includes(user, 0)) {
     fourth += `>${SHEET_ROWS.YOUTH_ASSISTANTS}: *${rotation.fourth.youthAssistants}* \n`;
  }
  
  Logger.log("payload timestamp: " + timestamp);
  payload.blocks[1].text.text = first;
  payload.blocks[2].text.text = second;
  payload.blocks[4].text.text = third;
  payload.blocks[5].text.text = fourth;

  return payload;
}

function requestSlack(method, endpoint, params) {
  const base_url = "https://slack.com/api/";
  const headers = {
    'Authorization': "Bearer xoxb-3804154765057-3791572762146-PPnge7Boa8lqOsfAfFciPVhq",
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
