const OPENAM_HOST   = 'openam.example.com'
const OPENAM_PORT   = 8090
const AUTH_COOKIE   = 'iPlanetDirectoryPro'
const ACR_COOKIE    = 'openam.example.com'
const LOGIN_URL     = 'http://openam.example.com:8090/openam/XUI/#login/goto='
const LOGOUT_URL    = '/openam/XUI/#lgout='
const IDENTITY_URL  = '/openam/identity/attributes?refresh=true&subjectid='

module.exports = {
  OPENAM_HOST: OPENAM_HOST,
  OPENAM_PORT: OPENAM_PORT,
  AUTH_COOKIE: AUTH_COOKIE,
  ACR_COOKIE: ACR_COOKIE,
  LOGIN_URL: LOGIN_URL,
  LOGOUT_URL: LOGOUT_URL,
  IDENTITY_URL: IDENTITY_URL
}