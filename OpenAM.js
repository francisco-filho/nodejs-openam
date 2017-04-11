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

module.exports = {
  parseAttributeNames,
  parseTokenAttributes,
  parseAttributeValues
}