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


exports.getStatus = etiket => {
  if(etiket.includes('tidak ditemukan')){
    if(etiket.includes('pada tanggal')){
      return 'Tunggu jadwal'
    }
    return 'Belum D1'
  }
  if(etiket.includes('sudah')){
    if(etiket.includes('digunakan')){
      return 'Sudah booster'
    }
    if(etiket.includes('entry')){
      return 'Proses entry'
    }
  }
  if(etiket.length){
    return 'Belum lengkap'
  }
}

exports._insertCell =  async ({ that, spreadsheetId, range, values }) => {
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
      await that.wait({time})
      res = await that.insertCell({ spreadsheetId, range, values})
    }
    // err && console.log(err)
    resolve(Object.assign({}, res))
  }));
}

exports._insertStatus =  async ({ that, kontak }) => {
  if(kontak.etiket && !kontak.status) {
    kontak.status = that.getStatus(kontak.etiket)
    let res = await that.insertCell({
      spreadsheetId: that.config.SHEET_ID,
      range: `Sheet1!B${kontak.id+2}`,
      values: kontak.status

    })
    that.spinner.succeed(`${kontak.id+2} ${kontak.nik}, ${kontak.nama}, ${kontak.status}, saved ${res.statusText}`)
    return res
  }
}

exports._insertTiket =  async ({ that, kontak }) => {
  if(kontak.etiket) {
    let res = await that.insertCell({
      spreadsheetId: that.config.SHEET_ID,
      range: `Sheet1!C${kontak.id+2}`,
      values: kontak.etiket

    })
    that.spinner.succeed(`${kontak.id+2} ${kontak.nik}, ${kontak.nama}, ${kontak.etiket}, saved ${res.statusText}`)
    return res
  }
}

exports._insertHP =  async ({ that, kontak }) => {
  if(kontak.no_hp){
    let res = await that.insertCell({
      spreadsheetId: that.config.SHEET_ID,
      range: `Sheet1!D${kontak.id+2}`,
      values: kontak.no_hp

    })
    that.spinner.succeed(`${kontak.id+2} ${kontak.nik}, ${kontak.nama}, ${kontak.no_hp}, saved ${res.statusText}`)
    return res
  }
}

exports._insertStatusB =  async ({ that, kontak, spreadsheetId }) => {
  if(kontak.etiket) {
    kontak.status = that.getStatus(kontak.etiket)
    let res = await that.insertCell({
      spreadsheetId,
      range: `ALL DATA!O${kontak.id+2}`,
      values: kontak.status
    })
    that.spinner.succeed(`${kontak.id+2} ${kontak.nik}, ${kontak.nama}, ${kontak.status}, saved ${res.statusText}`)
    return res

  }
}

exports._insertTiketB =  async ({ that, kontak, spreadsheetId }) => {
  if(kontak.etiket) {
    let res = await that.insertCell({
      spreadsheetId,
      range: `ALL DATA!P${kontak.id+2}`,
      values: kontak.etiket
    })
    that.spinner.succeed(`${kontak.id+2} ${kontak.nik}, ${kontak.nama}, ${kontak.etiket}, saved ${res.statusText}`)
    return res
  }
}

exports._insertHPB =  async ({ that, kontak, spreadsheetId }) => {
  if(kontak.no_hp){
    let res = await that.insertCell({
      spreadsheetId,
      range: `ALL DATA!Q${kontak.id+2}`,
      values: kontak.no_hp
    })
    that.spinner.succeed(`${kontak.id+2} ${kontak.nik}, ${kontak.nama}, ${kontak.no_hp}, saved ${res.statusText}`)
    return res
  }
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */


exports._listSheet =  async ({ that, SheetID, sheet }) => {

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
        let objRow = {}
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
      that.spinner.succeed(`data found: ${rows.length}`)
      resolve(rows)

    } else {
      that.spinner.succeed('no data found')
      resolve([]);
    }
  }));
}

exports._listKontak =  async ({ that }) => {

  return await that.listSheet({
    SheetID: that.config.SHEET_ID,
    sheet: 'Sheet1'
  })

}

exports._listSudah =  async ({ that }) => {
  return await that.listSheet({
    SheetID: that.config.SHEET_ID2,
    sheet: 'etiket'
  })

}