const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
const loadCreds = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) reject('Error loading client secret file:', err);
      resolve(JSON.parse(content))
      // Authorize a client with credentials, then call the Google Tasks API.
      // authorize(JSON.parse(content), listConnectionNames);
    });
    
  })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = async () => {
  const { 
    installed: {
      client_secret,
      client_id,
      redirect_uris
    } 
  } = await loadCreds()
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  // Check if we have previously stored a token.
  return await new Promise( resolve => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) {
        resolve( await getNewToken(oAuth2Client))
      };
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    });
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = async oAuth2Client => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return await new Promise ((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) reject('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) reject(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        resolve(oAuth2Client);
      });
    });
  
  })
}

exports.tunggu = false

exports._insertCell =  async ({ that, spreadsheetId, range, values }) => {
  while(that.tunggu){
    await that.wait({time: 100})
  }
  const auth = await authorize()

  const sheets = google.sheets({version: 'v4', auth});
  return await new Promise ( (resolve, reject) => sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption:'USER_ENTERED',
    requestBody: {
      "values": [
        [
          `${values}`
        ]
      ],
      "range": `${range}`
    }

  }, async (err, res) => {
    if(err && JSON.stringify(err).includes('rate')){
      let time = that.getRandomInt(150, 700)
      that.spinner.fail(`kena rate limit, wait for: ${time}`)
      that.tunggu = true
      await that.wait({time})
      that.tunggu = false
      res = await that.insertCell({ spreadsheetId, range, values})
    }
    // err && console.log(err)
    resolve(Object.assign({}, res))
  }));
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */


exports._listFile =  async ({ that, SheetID }) => {
  const auth = await authorize()

  const sheets = google.sheets({version: 'v4', auth});

  const sheetData = await sheets.spreadsheets.get({ 
    spreadsheetId: SheetID
  })

  let sheetProps = sheetData.data.sheets.map((sheet) => {
    return {
      sheet: sheet.properties.title,
      file: sheetData.data.properties.title 
    }
  }).filter( e => {
    if( !e.file.includes('list')){
      return !e.sheet.toLowerCase().includes('pivot')
      // return e.sheet === e.file
    }
    return true
  } )

  let ret = []

  for(let ss of sheetProps){
    let res = await that.listSheet({ SheetID, ss})
    ret = ret.concat(...res)
  }

  return ret
 
}

exports._listSheet = async ({ that, SheetID, ss: {sheet, file} }) => {

  const auth = await authorize()

  const sheets = google.sheets({version: 'v4', auth});
  
  return await new Promise ( (resolve, reject) => sheets.spreadsheets.values.get({
    spreadsheetId: SheetID,
    range: sheet,
  }, (err, res) => {
    that.spinner.start('start listing')
    if (err) reject('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      // Print columns A and E, which correspond to indices 0 and 4.
      const headers = rows[0].map(e => e.toLowerCase().split(' ').join('_'))
      rows.map((row, id) => {
        let objRow = {
          row: id+1,
          sheet,
          file,
          SheetID
        }
        if(id){
          row.map((col, id) => {
            if(col && col.length && headers[id]){
              objRow[headers[id]] = col
            }
          })
          rows[id] = objRow
        }
        // console.log(`${row[0]}, ${row[4]}`);
      });
      rows.shift()
      that.spinner.succeed(`${sheet} data found: ${rows.length}`)
      resolve(rows)

    } else {
      that.spinner.succeed('no data found')
      resolve([]);
    }
  }));
}