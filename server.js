let express = require('express'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    redis = require('redis'),
    app = express(),
    redisClient = redis.createClient()
let openam = require('./OpenAM')
let consts = require('./consts')
app.use(cookieParser())

const PORT = 3000

function getUrl(req){
  return encodeURIComponent(`${req.protocol}://${req.host}:${PORT}/${req.originalUrl}`)
}

app.get('/', (req, res) => {
  const cookieValue = req.cookies[consts.AUTH_COOKIE]

  //console.log(req.originalUrl, req.path, req)

  if (!cookieValue)
    res.redirect(consts.LOGIN_URL + getUrl(req))
  else {
    // TODO: check if data in Redis
    let user = null
    const userKey = 'user:'+ req.cookies[consts.AUTH_COOKIE]
    redisClient.get(userKey, (err, reply) => {
      if (!err && reply != null){
        console.log(err, reply)
        reply = JSON.parse(reply)
        reply['from'] = 'redis'
        res.json(reply)
        return
      }

      let myreq =http.request({
        headers: req.headers,
        host: 'openam.example.com',
        port: '8090',
        path: '/openam/identity/attributes?refresh=true&subjectid=' + cookieValue,
        method: 'GET'
      }, (response) => {
        let str = ''
        response.on('data', (chunk) => {
          str += chunk
        })

        response.on('end', (chunk) => {
          let obj       = openam.parseTokenAttributes(str)
          const values  = openam.parseAttributeValues(str)
          const names   = openam.parseAttributeNames(str)

          names.forEach((n,i) => {
            obj[n['userdetails.attribute.name']] = values[i]['userdetails.attribute.value']
          })

          // TODO: save in redisport
          redisClient.set(userKey, JSON.stringify(obj))
          console.log('obj', obj)
          obj['from'] = 'openam'
          res.json(obj)
        })
      })

      myreq.end()

    })
  }
})

app.listen(PORT, () => {
  console.log('listening on port: ', PORT)
})