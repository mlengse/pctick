exports._checkD2 = async({ that }) => {
  await that.page.goto(`${that.config.PCARE_URL}/DaftarPenerimaVaksinKLB`, that.waitOpt)

  // for ([id, kontak] of (await app.listKontak()).entries()){
  //   if(!kontak.etiket){
  //     kontak.id = id
  //     let ver = app.verifynik(kontak.nik)
  //     if(!ver.salah){
  //       kontak.nik = ver.nik
  //       kontak.etiket = await app.checkNIK({ kontak })
  //       await app.wait({time: 5000})
  //     } else {
  //       kontak.etiket = ver.salah
  //     }
  //     kontak.etiket && await app.insertTiket({ kontak })
  //   }

  // }

}