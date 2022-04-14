exports._checkFile = async ({ that, SheetID, sheet }) => {

  let [listSheet, listKontak, listSudah] = await Promise.all([
    that.listSheet({
      SheetID,
      sheet
    }),
    that.listKontak(),
    that.listSudah(),
    // that.initBrowser()
  ])
  // await 

  for ([id, kontak] of listSheet.entries()){
    kontak.id = id
    if((!kontak.status || !kontak.etiket) && kontak.nik){
      let ver = that.verifynik(kontak.nik)
      if(!ver.salah){
        let sudah = listSudah.filter( e => e.nik === kontak.nik)
        if(!sudah.length){
          sudah = listKontak.filter( e => e.nik === kontak.nik)
        }
        if(sudah.length){
          // console.log(sudah)
          kontak = Object.assign({}, kontak, sudah[0])
        // } else {
        //   kontak.nik = ver.nik
        //   kontak.etiket = await that.checkNIK({ kontak })
        //   if(kontak.etiket.length && !kontak.etiket.toLowerCase().includes('nik')){
        //     kontak.no_hp= await that.checkHP()
        //   }
        }
      // } else {
      //   kontak.etiket = ver.salah
      }

      let spreadsheetId = SheetID

      await Promise.all([
        that.insertTiketB({ kontak, spreadsheetId }),
        that.insertHPB({ kontak, spreadsheetId }),
        that.insertStatusB({ kontak, spreadsheetId }),
        // that.wait({time: that.getRandomInt(100, 1000)})
      ])

    }


  }


}