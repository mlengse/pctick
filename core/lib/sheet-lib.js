
exports.getStatus = etiket => {
  if(etiket.toLowerCase().includes('tidak ditemukan')){
    if(etiket.toLowerCase().includes('pada tanggal')){
      return 'Tunggu jadwal'
    }
    return 'Belum D1'
  }
  if(etiket.toLowerCase().includes('sudah')){
    if(etiket.toLowerCase().includes('gunakan')){
      return 'Sudah booster'
    }
    if(etiket.toLowerCase().includes('entry')){
      return 'Proses entry'
    }
  }
  if(etiket.length){
    return 'Belum lengkap'
  }
}

exports._insertStatus =  async ({ that, kontak }) => {
  if(kontak.etiket && !kontak.status) {
    kontak.status = that.getStatus(kontak.etiket)
    let res = await that.insertCell({
      spreadsheetId: that.config.SHEET_ID,
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
      spreadsheetId: that.config.SHEET_ID,
      range: `${kontak.sheet}!C${kontak.row}`,
      values: kontak.etiket

    })
    that.spinner.succeed(`${kontak.id} ${kontak.nik}, ${kontak.nama}, ${kontak.etiket}, saved ${res.statusText}`)
    return res
  }
}

exports._insertHP =  async ({ that, kontak }) => {
  if(kontak.no_hp){
    let res = await that.insertCell({
      spreadsheetId: that.config.SHEET_ID,
      range: `${kontak.sheet}!D${kontak.row}`,
      values: kontak.no_hp

    })
    that.spinner.succeed(`${kontak.id} ${kontak.nik}, ${kontak.nama}, ${kontak.no_hp}, saved ${res.statusText}`)
    return res
  }
}

exports._listKontak =  async ({ that }) => {
  return await that.listFile({
    SheetID: that.config.SHEET_ID
  })

}

exports._listSudah =  async ({ that }) => {
  return await that.listFile({
    SheetID: that.config.SHEET_ID2
  })

}