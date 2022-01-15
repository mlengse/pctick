const moment = require('moment')
moment.locale('id')

const getBaseDate = () => {
  let baseDate = moment().format('DD-MM-YYYY')
  if(process.env.BASE_DATE){
    baseDate = process.env.BASE_DATE
  }
  return baseDate
}

// moment.now = () => +new Date('2021', '2', '28');
exports.unixTime = () => moment().format('x')
exports.getUnix = tgl => Number(moment(tgl, 'DD-MM-YYYY').format('x'))
exports.xTimestamp = () => moment.utc().format('X')
exports.tgl = () => moment(getBaseDate(), 'DD-MM-YYYY').date()
exports.blnThn = () => moment(getBaseDate(), 'DD-MM-YYYY').format('MM-YYYY') // .add(-1, 'd')
exports.tglHariIni = () => `${this.tgl()}-${this.blnThn()}`
exports.now = () => moment(getBaseDate(), 'DD-MM-YYYY').format('D')
exports.end = () => moment(getBaseDate(), 'DD-MM-YYYY').endOf('month').format('D')
exports.reverseFormat = tgl => moment(tgl, 'DD-MM-YYYY').format('YYYY-MM-DD')
exports.tglBlnLalu = () => moment(getBaseDate(), 'DD-MM-YYYY').add(-1, 'month').format('D-MM-YYYY')
