const AUTH_COOKIE = 'iPlanetDirectoryPro'
const LOGIN_URL   = 'http://openam.example.com:8090/openam/XUI/#login/goto='
const AUTH_URL    = 'http://openam.example.com:8090/openam/json/authenticate'
const IDENTITY_URL= 'http://openam.example.com:8090/openam/identity/attributes?refresh=true&subjectid='

module.exports = {
  AUTH_COOKIE: AUTH_COOKIE,
  LOGIN_URL: LOGIN_URL,
  AUTH_URL: AUTH_URL,
  IDENTITY_URL: IDENTITY_URL
}
