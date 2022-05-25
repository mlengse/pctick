exports._listFiles = async ({ that }) =>{
  let files = await that.listFile({
    SheetID: that.config.SHEET_ID2
  })

  if(!that.listSudah){
    that.listSudah = []
  }

  if(!that.listKontak){
    that.listKontak = []
  }

  await Promise.all([...files.map( async file => {
    let ret = await that.listFile({
      SheetID: file.id
    })

    if(ret.length){
      let sudah = ret.filter(k => k.status && k.status.toLowerCase().includes('sudah booster'))
      if(sudah.length){
        that.listSudah = [...that.listSudah, ...sudah]
        that.spinner.succeed(`${file.nama} sudah booster ${sudah.length}`)
      }
      let kontak = ret.filter(k => !k.status && k.nik)
      if(kontak.length){
        that.listKontak = [...that.listKontak, ...kontak]
        that.spinner.succeed(`${file.nama} akan dicek ${kontak.length}`)
      }
    }

  })])

}
exports._insertStatus =  async ({ that, kontak }) => {
  if(kontak.etiket && !kontak.status) {
    kontak.status = that.getStatus(kontak.etiket)
    let res = await that.insertCell({
      spreadsheetId: kontak.SheetID,
      range: `${kontak.sheet}!B${kontak.row}`,
      values: kontak.status

    })
    that.spinner.succeed(`${kontak.id} ${kontak.nik}, ${kontak.nama}, ${kontak.status}, saved ${res.statusText}`)
    return res
  }
}

exports._insertTiket =  async ({ that, kontak }) => {
  if(kontak.etiket) {
    let res = await that.insertCell({
      spreadsheetId: kontak.SheetID,
      range: `${kontak.sheet}!C${kontak.row}`,
      values: kontak.etiket

    })
    that.spinner.succeed(`${kontak.id} ${kontak.nik}, ${kontak.nama}, ${kontak.etiket}, saved ${res.statusText}`)
    return res
  }
}

exports._insertHP =  async ({ that, kontak }) => {
  if(kontak.no_hp){
    if(kontak.no_hp[0] !== '0' && kontak.no_hp[0] !== "'"){
      kontak.no_hp = `'0${kontak.no_hp}`
    } else if(kontak.no_hp[0] === '0'){
      kontak.no_hp = `'${kontak.no_hp}`
    } else if(kontak.no_hp[1] !== '0' && kontak.no_hp[0] === "'"){
      kontak.no_hp = kontak.no_hp.substring(1)
      kontak.no_hp = `'0${kontak.no_hp}`
    }

    let res = await that.insertCell({
      spreadsheetId: kontak.SheetID,
      range: `${kontak.sheet}!D${kontak.row}`,
      values: `${kontak.no_hp}`

    })
    that.spinner.succeed(`${kontak.id} ${kontak.nik}, ${kontak.nama}, ${kontak.no_hp}, saved ${res.statusText}`)
    return res
  }
}

// exports._listKontak =  async ({ that }) => {
//   return await that.listFile({
//     SheetID: that.config.SHEET_ID
//   })

// }

// exports._listSudah =  async ({ that }) => {
//   return await that.listFile({
//     SheetID: that.config.SHEET_ID2
//   })

// }