if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const Core = require('./core')
const config = require('./config')

const app = new Core(config)

module.exports = async (isPM2) => {

  try{
    await app.initBrowser()

    await app.runScript()

    await app.page.goto(`${app.config.PCARE_URL}/EntriPenerimaVaksinKLB/Simplifikasi`, app.waitOpt)

    for ([id, kontak] of (await app.listKontak()).entries()){
      if(!kontak.etiket){
        kontak.id = id
        kontak.etiket = await app.checkNIK({ kontak })

        await app.insertTiket({ kontak })
        // console.log(kontak)

        await app.wait({time: 5000})

      }

    }

    await app.close(isPM2)

    console.log(`scheduled appsheet process done: ${new Date()}`)
  }catch(e){
    console.error(`process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}