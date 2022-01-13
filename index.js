const { schedule } = require('node-cron')
const init = require('./init')
const menit = Math.floor(Math.random() * 60)
process.env.SHEET_ID && console.log(`set cron sheet: ${Math.floor(menit*3/5)} */12 * * 1-6 ${new Date()}`)

process.env.SHEET_ID && schedule(`${Math.floor(menit*3/5)} 8-17 * * 1-6`, ()=>{
	console.log(`running scheduled appsheet: ${new Date()}`)
	init(true)
})