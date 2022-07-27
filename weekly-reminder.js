// Original Date: 07/13/2022
// Last Updated: 07/27/2022
// Author: Josh Kim 

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

// Configuration Options
const user = "Josh"
const spreadsheet = SpreadsheetApp.openById("<SPREADHSHEET ID>");
const logistics_sheet = spreadsheet.getSheetByName("<SHEET NAME>");
let rotation_fieldCount = 12; // Update this if you add more fields to the rotation object

/**
 * 1. Post a formatted payload to the Slack destination. In this case, it's a personal DM to myself.
 * 2. Save the timestamp of the message. This is how Slack differentiates one message from another. We 
 *    need the timestamp to update that particular message.
 * 3. Save the channelID. Apparently, the channelID you send the first message to is not the one to use
 *    when updating the message in that particuar channel. You have to use the one returned from the API.
 */
function sendWeeklyRotations() {
  let postMessage_payload = formatPayload_postMessage(user);
  let post_message_request = requestSlack("POST", "chat.postMessage", postMessage_payload);
  Logger.log("Post message request: " + JSON.stringify(post_message_request));
  saveTimestamp(post_message_request.response_data.ts);
  saveChannelID(post_message_request.response_data.channel);
}

/**
 * 1. Read the timestamp of the posted message.
 * 2. Read the channelID that the message is in.
 * 3. Update the message if there were any changes in the Google Spreadsheets.
 * 4. Save the timestamp again. Don't know if this is necessary but don't want to break the code.
 */
function updateHourlyRotations() {
  let ts = readTimestamp();
  let channelID = readChannelID();
  let updateMessage_payload = formatPayload_updatePost(user, ts, channelID);
  let update_message_request = requestSlack("POST", "chat.update", updateMessage_payload);
  Logger.log("Update message request: " + JSON.stringify(update_message_request));
  saveTimestamp(update_message_request.response_data.ts)
  rest(); // To comply with rate-limiting
}

// (Send to multiple people in Slack Workspace)
/* function sendWeeklyRotations() {
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

/**
 * Reads the latest changes from the Google Spreadsheet.
 * 
 * @param {Boolean} updateColCondition condition to read in the next 2 columns or not
 * @return {jQuery.jqXHR} the latest rotations for this upcoming week and next week
 */
function getLatestRotations(updateColCondition) {
  let startingCol = parseInt(readStartingSheetColumn());
  if (startingCol == -1) {
    Logger.log("Key-value pair data not saved. Check the Script Properties in the Settings.")
  }
  Logger.log("Starting col: " + startingCol);
  if (updateColCondition) {
    saveStartingSheetColumn(startingCol + 2);
  }

  // getRange(starting row index, starting column index, num. of rows to return, num. of cols to return)
  let values = logistics_sheet.getRange(1,startingCol,20,4).getValues();
  Logger.log(values);

  let rows = getRows();

  const rotations = {
    first: {
      day: getFormattedDay(values[2][0]),
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
      day: getFormattedDay(values[2][1]),
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
      day: getFormattedDay(values[2][2]),
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
      day: getFormattedDay(values[2][3]),
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
  Logger.log(rotations);
  return rotations;
}

/*==============================
* HELPER FUNCTIONS
==============================*/

/**
 * Gets the rows of each individual object from SHEET_ROWS enum. All of these headers are
 * hard-coded in the Google Spreadsheet, but just in case, someone modifies the sheet, this
 * is what the function is for. I didn't want to hard-code the row values.
 * 
 * @return {jQuery.jqXHR} rows for each object
 */
function getRows() {
  let values = logistics_sheet.getRange(1,1,31).getValues();
  Logger.log(values);

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

/**
 * Saves the column in which to start reading from.
 * 
 * @param {Number} startingCol column to start reading from
 */
function saveStartingSheetColumn(startingCol) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('<KEY NAME>', 162);
  } catch (err) {
    Logger.log('Failed saving starting sheet column: %s', err.message);
  }
}

/**
 * Obtain the column in which to start reading from.
 * 
 * @return {Number} column to start reading from
 */
function readStartingSheetColumn() {
  try {
    // Get the value for the user property 'NEW_COL'.
    const userProperties = PropertiesService.getUserProperties();
    const col = userProperties.getProperty('<KEY NAME>');
    console.log("col: " + col);
    Logger.log("Read starting sheet column: "+ col);
    return col;
  } catch (err) {
    // TODO (developer) - Handle exception
    Logger.log('Failed reading starting sheet column: %s', err.message);
    return -1;
  }
}

/**
 * Saves the timestamp of the message.
 * 
 * @param {String} timestamp timestamp of message
 */
function saveTimestamp(timestamp) {
  try {
    Logger.log("Save timestamp: " + timestamp);
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('<KEY NAME>', timestamp);
  } catch (err) {
    Logger.log('Failed saving timestamp: %s', err.message);
  }
}

/**
 * Obtain the timestamp of the message
 * 
 * @return {String} timestamp of the message
 */
function readTimestamp() {
  try {
    // Get the value for the user property 'Josh_ts'.
    const userProperties = PropertiesService.getUserProperties();
    const ts = userProperties.getProperty('<KEY NAME>');
    Logger.log("Read Josh_timestamp: " + ts);
    return ts;
  } catch (err) {
    // TODO (developer) - Handle exception
    Logger.log('Failed reading Josh_timestamp: %s', err.message);
    return -1;
  }
}

/**
 * Saves the channelID in which to post the message to
 * 
 * @param {String} channelID id of channel 
 */
function saveChannelID(channelID) {
  try {
    Logger.log("Save Josh_channelID: " + channelID);
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('<KEY NAME>', channelID);
  } catch (err) {
    Logger.log('Failed saving Josh_channelID: %s', err.message);
  }
}

/**
 * Obtain the channelID
 * 
 * @return {String} id of channel
 */
function readChannelID() {
  try {
    // Get the value for the user property 'Josh_channelID'.
    const userProperties = PropertiesService.getUserProperties();
    const channelID = userProperties.getProperty('<KEY NAME>');
    Logger.log("Read Josh_channelID: " + channelID);
    return channelID;
  } catch (err) {
    // TODO (developer) - Handle exception
    Logger.log('Failed reading Josh_channelID: %s', err.message);
    return -1;
  }
}

/**
 * Formats the date from "2010-10-11T00:00:00+05:30" to "MM-DD-YY". This function is copy and pasted from the below source.
 * https://stackoverflow.com/questions/11591854/format-date-to-mm-dd-yyyy-in-javascript
 * 
 * @param {String} date date to format
 * @return {String} MM-DD-YY format
 */
function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
  
    return month + '/' + day + '/' + year;
}

/**
 * Basically just formats the word into the capitalization I want
 * 
 * @param {String} day day to format
 * @return {String} formatted day
 */
function getFormattedDay(day) {
  if (day == "FRIDAY") {
    return "Friday";
  } else if (day == "SUNDAY") {
    return "Sunday";
  } else {
    return "Not Friday/Sunday";
  }
}

/**
 * Helper function for rest(). Helps to make to program "sleep" for a specific amount of time.
 * 
 * @param {Number} ms milliseconds to sleep
 * @return {Promise} promise
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make the program "rest" for a specific amount of time. Helps with rate-limiting.
 */
async function rest() {
  console.log('Taking a break...');
  await sleep(5000);
  console.log('Five seconds later');
}

/**
 * Using Markdown, a markup language, format the payload for posting a new message.
 * 
 * @param {String} user determine if user is in rotation
 * @return {jQuery.jqXHR} payload to send via Slack API
 */
function formatPayload_postMessage(user) {
  let rotation = getLatestRotations(true);
  let payload = {
    channel: "<CHANNEL ID>",
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

/**
 * Using Markdown, a markup language, format the payload for updating the message.
 * 
 * @param {String} user determine if user is in rotation
 * @return {jQuery.jqXHR} payload to send via Slack API
 */
function formatPayload_updatePost(user, timestamp, channelID) {
  let rotation = getLatestRotations(false);
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

/**
 * Function to send a POST HTTP request to a Slack API endpoint
 * 
 * @param {String} method in this case, it's POST
 * @param {String} endpoint Slack API endpoint
 * @param {String} params the payload
 * @return {jQuery.jqXHR} response data
 */
function requestSlack(method, endpoint, params) {
  const base_url = "https://slack.com/api/";
  const headers = {
    'Authorization': "Bearer <AUTHORIZATION>",
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
