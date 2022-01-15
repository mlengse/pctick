const redis = require('redis')

let subscriber, publisher
if(process.env.REDIS_HOST){
  publisher = redis.createClient({
    host: process.env.REDIS_HOST
  })

}

exports.getSubscriber = () => subscriber

exports.redisPublish = ({ topic, message }) => publisher.publish( topic, message, () => {})

