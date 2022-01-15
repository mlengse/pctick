const {
  Client
} = require('node-rest-client')
const axios = require('axios')

exports._reqLiburnas = async ({that, tahun}) => {
  if(!tahun){
    tahun = that.getTahun()
  }
  that.spinner.start(`req libur nasional tahun ${tahun}`)

  let liburJSON = await axios.get(that.config.LIBURNAS_JSON)

  // console.log(Object.keys(liburJSON))

  return Object.keys(liburJSON.data).filter(e => !e.includes('created')).map( e => Object.assign({},     {
    date: that.getFormat3(e),
    ket: liburJSON.data[e].deskripsi,
    tahun: e.slice(0, 4),
    id: e
  },))

}
