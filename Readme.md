![module info](https://nodei.co/npm/http.cookie.png?downloads=true&downloadRank=true&stars=true)

# http.cookie

> `http.cookie` is a bash-like module for reading and writing cookies on http request.

## Installation

```bash
npm i http.cookie
```

## Usage

```javascript
let http = require('http')
let cookie = require('http.cookie')

http
  .createServer((req, res) => {
    let Cookie = new cookie(req, res)

    Cookie.get('foo') //read the cookie
  })
  .listen(3000)
```

## API

### get(key)

* key `<String>`

> Reading cookie from http request.

```javascript
Cookie.get('foo')
```

### set(key, val[, opts])

* key `<String>`
* val `<String>` | `<Number>`
* opts `<Object>`
  * domain
  * path
  * expires
  * maxAge
  * httpOnly
  * secure
  * firstPartyOnly

> Writing cookies. Delete the cookie if val is empty/null.

```javascript
Cookie.set('foo', 'bar')
Cookie.set('foo', 'bar', { path: '/xx' })
Cookie.set('foo', 'bar', { maxAge: 600 }) // the cookie will expires in 600s
```
