import test from 'node:test'
import assert from 'node:assert/strict'

import { getRedirectUrl } from './redirect.js'

test('pages.dev 요청을 http 커스텀 도메인으로 리다이렉트한다', () => {
  const redirectUrl = getRedirectUrl('https://pokemon-lookalike.pages.dev/result/25?foo=bar')

  assert.equal(redirectUrl, 'http://pokemon-lookalike.shop/result/25?foo=bar')
})

test('https 커스텀 도메인 요청을 http 커스텀 도메인으로 리다이렉트한다', () => {
  const redirectUrl = getRedirectUrl('https://pokemon-lookalike.shop/ranking')

  assert.equal(redirectUrl, 'http://pokemon-lookalike.shop/ranking')
})

test('이미 http인 커스텀 도메인 요청은 리다이렉트하지 않는다', () => {
  const redirectUrl = getRedirectUrl('http://pokemon-lookalike.shop/')

  assert.equal(redirectUrl, null)
})
