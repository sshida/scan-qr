#!/usr/bin/env node
// vi: sw=2 sts=2

const crypto = require('node:crypto')

function _arrayBufferToBase64(arrayBuffer) {
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const bytes         = new Uint8Array(arrayBuffer)
  const byteLength    = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength    = byteLength - byteRemainder

  let a, b, c, d, chunk, base64 = ''

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

async function encryptMessage(plain_text, iv, key, name = "AES-CBC") {
  const encoded_text = new TextEncoder().encode(plain_text)
  const encoded_key = await crypto.subtle.importKey(
    "raw",
    key.buffer,
    "AES-CBC",
    false,
    ["encrypt", "decrypt"]
  )
  return crypto.subtle.encrypt({name, iv}, encoded_key, encoded_text)
}

const arrayBufferToHexString = ab =>
  [... new Uint8Array(ab)].map(v => v.toString(16)).join('')

const arrayBufferToBase64 = arrayBuffer => btoa(
    String.fromCharCode(... new Uint8Array(arrayBuffer))
    //String.fromCharCode.apply(null, new Uint8Array(arrayBuffer))
  )

const fromHexStringToUint8Array = hexString =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))

const cipher_key_hex = "1838cb4996b8da2d65ea5a12df99062299bb9cf34da01c229051795f8f8ad783"
const iv_hex = "1860f14180ea996fa960a16778fb692f"
const cipher_hex = "668316157b24c20774a6b7f70f639b8"
const cipher_key = fromHexStringToUint8Array(cipher_key_hex)
const iv = fromHexStringToUint8Array(iv_hex)
const cipher_ab = fromHexStringToUint8Array(cipher_hex)

console.debug(`cipher_ab:`, cipher_ab)
console.debug(`cipher_base64:`, arrayBufferToBase64(cipher_ab))

const plain_text = "hello world"

let c
encryptMessage(plain_text, iv, cipher_key).then(v => {
  c = v
  console.debug(v)
  console.debug(`hex:`, arrayBufferToHexString(v))
  //console.debug(`base64:`, _arrayBufferToBase64(v))
  console.debug(`bad base64:`, arrayBufferToBase64(v))
})
