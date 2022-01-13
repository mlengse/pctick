

exports._getTglDaftar = async({ that }) => {
  let tglDaftar = that.tglDaftarA(`${that.getRandomInt(that.tgl() > 4 ? that.tgl()-4  : 1, that.tgl())}-${that.blnThn()}`)
  let isMasuk = await that.libur({ tgl:  that.reverseFormat(tglDaftar)})
  if(!isMasuk){
    return await that.getTglDaftar()
  }
  return tglDaftar

}



exports._libur =  async ({that, tgl}) => {
  let liburArr = (await that.getLiburnasByThn({
    tahun: that.getTahunBy(tgl)
  })).map( tgl => that.getFormat2(tgl))
  if(liburArr.indexOf(tgl) === -1){
    return true		
  }
  return false
}

exports._getLiburnasByThn = async ({that, tahun}) => {
  let liburArr = that.getLiburArr(tahun)
  if(liburArr && Array.isArray(liburArr) && liburArr.length){
    return liburArr
  } 
  return await that.scrapeLiburnas({tahun})
}

exports._scrapeLiburnas = async ({that, tahun}) => {
  that.spinner.start(`scrape libur nasional tahun ${tahun}`)
  if(!tahun){
    tahun = that.getTahun()
  }
  if(!that.pages){
    await that.initBrowser()
  }

  if(!that.liburPage) {
    while(!that.pages[2]){
      await that.Browser.newPage()
      that.pages = await that.Browser.pages()
    } 
    that.liburPage = that.pages[2]
  }

  let liburArr

  try {
    await that.liburPage.goto(`${that.config.LIBURNAS_URL}-${tahun}/`, that.config.waitOpt)
    liburArr = await that.liburPage.evaluate(()=>{
      let libArr = []
      $($('.row.row-eq-height.libnas-content').html()).map((id, e)=>{
        let ket = $(e).find('strong > a').text()
        let lib = $(e).find('time.libnas-calendar-holiday-datemonth').text()
        if(lib.indexOf('-') > -1) {
          let libRange = lib.split('-')
          let start = Number(libRange[0].trim())
          let endArr = libRange[1].trim().split(' ')
          let tahun = endArr[2]
          let bulan = endArr[1]
          let end = Number(endArr[0])
          for (let i = start; i <= end; i++) {
            libArr.push({
              date: [i, bulan, tahun].join(' '),
              ket: ket,
              tahun: tahun
            })
          }
        } else if(lib){		
          libArr.push({
            date: lib,
            ket: ket,
            tahun: lib.split(' ')[2]
          })
        }
      })
      return libArr
    })
  
    if(that.liburPage) {
      await that.liburPage.close()
      that.pages = await that.Browser.pages()
      that.liburPage = undefined
    }
  
  
  } catch(e) {
    liburArr = await that.reqLiburnas({ tahun })

  }


  liburArr = liburArr.map(e => Object.assign({}, e, {
    id: that.getFormat1(e.date)
  }))

  for (let l of liburArr) {
    that.addLiburnas(l)
  }

  that.spinner.succeed(`${liburArr.length} hari libur nasional`)

  return liburArr

}