let express = require('express'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    app = express()

const AUTH_COOKIE = 'iPlanetDirectoryPro'
const LOGIN_URL   = 'http://openam.example.com:8090/openam/XUI/#login/goto='
const AUTH_URL    = 'http://openam.example.com:8090/openam/json/authenticate'
const IDENTITY_URL= 'http://openam.example.com:8090/openam/identity/attributes?refresh=true&subjectid='

app.use(cookieParser())

const PORT = 3000

function getUrl(req){
  return encodeURIComponent(`${req.protocol}://${req.host}:${port}/${req.originalUrl}`)
}

const parseAttributeNames = (attrs) => {
  return attrs.split('\n')
    .filter((u) => /userdetails.attribute.name=(.*)/.test(u))
    .map((u) => {
      const d = u.match('^(.*?)=(.*)').slice(1, 3)
      return { [d[0]]: d[1]}
    })
}

const parseAttributeValues = (attrs) => {
  return attrs.split('\n')
    .filter((u) => /userdetails.attribute.value=(.*)/.test(u))
    .map((u) => {
      const d = u.match('^(.*?)=(.*)').slice(1, 3)
      return { [d[0]]: d[1]}
    })
}

const parseTokenAttributes = (attrs) => {
  return attrs.split('\n')
    .filter((u) => !/userdetails.attribute(.*)/.test(u) && /^(.*?)=(.*)/.test(u))
    .map((u) => {
      const d = u.match('^(.*?)=(.*)').slice(1, 3)
      return { [d[0]]: d[1]}
    })
    .reduce((o, n) => {
      const key = Object.keys(n)[0]
      o[key] = n[key]
      return o
    }, {})
}

app.get('/', (req, res) => {
  const cookieValue = req.cookies[AUTH_COOKIE]

  console.log(req.originalUrl, req.path, req)

  if (!cookieValue)
    res.redirect(LOGIN_URL + getUrl(req))
  else {
    // TODO: check if data in Redis

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
        let obj       = parseTokenAttributes(str)
        const values  = parseAttributeValues(str)
        const names   = parseAttributeNames(str)

        names.forEach((n,i) => {
          obj[n['userdetails.attribute.name']] = values[i]['userdetails.attribute.value']
        })

        // TODO: save in redis
        res.json(obj)
      })
    })

    myreq.end()
  }
})

app.listen(PORT, () => {
  console.log('listening on port: ', PORT)
})