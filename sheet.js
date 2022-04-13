if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const Core = require('./core')
const config = require('./config')
const { promise } = require('ora')

const app = new Core(config)

module.exports = async (isPM2) => {

  try{
    await app.initBrowser()

    await app.runScript()

    // await app.checkD2()

    await app.page.goto(`${app.config.PCARE_URL}/EntriPenerimaVaksinKLB/Simplifikasi`, app.waitOpt)

    for ([id, kontak] of (await app.listKontak()).entries()){
      if(!kontak.etiket && kontak.nik){
        kontak.id = id
        let ver = app.verifynik(kontak.nik)
        if(!ver.salah){
          kontak.nik = ver.nik
          kontak.etiket = await app.checkNIK({ kontak })
          if(kontak.etiket.length && !kontak.etiket.toLowerCase().includes('nik')){
            kontak.no_hp= await app.checkHP()
          }
        } else {
          kontak.etiket = ver.salah
        }
        await Promise.all([
          new Promise( async resolve => {
            kontak.etiket && await app.insertTiket({ kontak })
            resolve()
          }),
          new Promise( async resolve => {
            kontak.no_hp && await app.insertHP({ kontak })
            resolve()
          }),
          app.wait({time: app.getRandomInt(2000, 4000)})
        ])
      }

    }

    await app.close(isPM2)

    console.log(`scheduled appsheet process done: ${new Date()}`)
  }catch(e){
    console.error(`process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}