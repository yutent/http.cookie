/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2015-11-17 13:49:25
 *
 */
'use strict'

const KEY_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/
const SPLIT_REGEXP = /; */
const encode = encodeURIComponent
const decode = decodeURIComponent

/**
 * [parse 格式化字符串]
 */
function parse(str) {
  if (typeof str !== 'string') {
    return {}
  }

  let obj = {}
  let pairs = str.split(SPLIT_REGEXP)

  for (let item of pairs) {
    let id = item.indexOf('=')
    if (id < 0) {
      return {}
    }

    let key = item.slice(0, id).trim()
    let val = item.slice(++id, item.length).trim()

    obj[key] = decode(val)
  }
  return obj
}

/**
 * [serialize 序列化对象]
 */
function serialize(key, val, opts) {
  if (!KEY_REGEXP.test(key)) {
    return ''
  }

  val = encode(val)
  opts = opts || {}

  if (val && !KEY_REGEXP.test(val)) {
    return ''
  }

  let pairs = [key + '=' + val]

  if (opts.hasOwnProperty('expires') && opts.expires) {
    // 有效期, 已不建议使用,改用 max-age
    // pairs.push('Expires=' + opts.expires.toUTCString())
    if (Date.isDate(opts.expires)) {
      opts.maxAge = ((opts.expires - 0) / 1000) >>> 0
    } else {
      opts.maxAge = opts.expires
    }
    delete opts.expires
  }

  if (opts.hasOwnProperty('maxAge') && opts.maxAge) {
    //有效期
    opts.maxAge = opts.maxAge - 0
    pairs.push('Max-Age=' + opts.maxAge)
  }

  if (opts.hasOwnProperty('domain')) {
    //域
    if (!KEY_REGEXP.test(opts.domain)) {
      return ''
    }
    pairs.push('Domain=' + opts.domain)
  }

  if (opts.hasOwnProperty('path')) {
    //目录
    if (!KEY_REGEXP.test(opts.path)) {
      return ''
    }

    pairs.push('Path=' + opts.path)
  } else {
    pairs.push('Path=/')
  }

  if (opts.httpOnly) {
    pairs.push('HttpOnly')
  }

  if (opts.secure) {
    pairs.push('Secure')
  }

  if (opts.firstPartyOnly) {
    pairs.push('First-Party-Only')
  }

  return pairs.join('; ')
}

class Cookies {
  constructor(req, res) {
    this.__cookie__ = req.headers['cookie'] || ''
    this.res = res
  }

  _getHeader(key) {
    return this.res.getHeader(key)
  }
  _setHeader(key, val) {
    let value = Array.isArray(val) ? val.map(String) : String(val)
    this.res.setHeader(key, value)
  }

  /**
   * [get 获取cookie]
   */
  get(key) {
    if (!key) {
      return null
    }

    if (typeof key !== 'string') {
      this.res.writeHead(500, {
        'X-debug': `argument key must be a string in cookie.get(). ${typeof key} given`
      })
      return this.res.end('')
    }

    if (!this.__cookie__) {
      return null
    }

    let cookieObj = parse(this.__cookie__)

    if (cookieObj.hasOwnProperty(key)) {
      return cookieObj[key]
    } else {
      return null
    }
  }

  /**
   * [set 设置cookie]
   * @param {[string]} key
   * @param {[string/number]} val
   * @param {[object]} opts [设置cookie的额外信息,如域,有效期等]
   */
  set(key, val, opts) {
    opts = opts || {}

    //读取之前已经写过的cookie缓存
    let cache = this._getHeader('set-cookie') || []

    if (cache.length > 0) {
      for (let i in cache) {
        let idx = cache[i].indexOf('=')

        //如果之前已经写了一个相同的cookie, 则删除之前的
        //目的是减少向头部发送的数据包大小
        if (cache[i].slice(0, idx).trim() === key) {
          cache.splice(i, 1)
        }
      }
    }

    let cookieStr = serialize(key, val, opts)

    this._setHeader('set-cookie', cache.concat(cookieStr))
  }
}

module.exports = Cookies
