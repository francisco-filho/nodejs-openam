let express = require('express'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    redis = require('redis'),
    app = express(),
    redisClient = redis.createClient(),
    openam = require('./OpenAM'),
    consts = require('./consts')

const PORT = 3000

app.use(cookieParser())

function getUrl(req){
  return encodeURIComponent(`${req.protocol}://${req.host}:${PORT}/${req.originalUrl}`)
}

function getServidor(cookie){
  return  cookie  ? cookie : consts.OPENAM_HOST
}

app.get('/logout', (req, res) => {
  const acrCookie = req.cookies[consts.ACR_COOKIE]

  if (acrCookie)
    http.request({
      headers: req.headers,
      host: getServidor(acrCookie),
      port: consts.OPENAM_PORT,
      path: consts.LOGOUT_URL,
      method: 'GET'
    })
})

app.get('/', (req, res) => {
  const cookieValue = req.cookies[consts.AUTH_COOKIE]

  if (!cookieValue)
    res.redirect(consts.LOGIN_URL + getUrl(req))
  else {
    // TODO: check if data in Redis
    let user = null
    const userKey = 'user:'+ req.cookies[consts.AUTH_COOKIE]
    const servidor = getServidor(req.cookies[consts.ACR_COOKIE])

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
        host: servidor,
        port: consts.OPENAM_PORT,
        path: `${consts.IDENTITY_URL}${cookieValue}`,
        method: 'GET'
      }, (response) => {
        let str = ''
        response.on('data', (chunk) => {
          str += chunk
        })

        response.on('end', (chunk) => {
          console.log(str)
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