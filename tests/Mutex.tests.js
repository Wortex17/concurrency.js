'use strict'

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Mutex } from '../lib'

describe('Mutex', function () {
  it('throws no exception if constructed without options', function () {
    expect(() => { return new Mutex() }).to.not.throw()
  })
  it('throws no exception if constructed without maxCapacity', function () {
    expect(() => { return new Mutex({}) }).to.not.throw()
  })
  it('always has maxCapacity 1', function () {
    function createMutexWithMaxCapacity (maxCapacity) {
      return new Mutex({ maxCapacity })
    }
    expect(createMutexWithMaxCapacity()).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity(1)).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity(2)).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity(3)).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity(3)).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity(null)).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity('foobar')).to.have.property('maxCapacity', 1)
    expect(createMutexWithMaxCapacity(-4)).to.have.property('maxCapacity', 1)
  })
})
