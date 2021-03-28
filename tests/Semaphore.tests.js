'use strict'

import { describe, it } from 'mocha'
import chai from 'chai'
import spies from 'chai-spies'
import { Semaphore } from '../lib'

chai.use(spies)
const expect = chai.expect

describe('Semaphore', function () {
  it('throws exception if constructed without options', function () {
    expect(() => { return new Semaphore() }).to.throw()
  })
  it('throws exception if constructed without maxCapacity', function () {
    expect(() => { return new Semaphore({}) }).to.throw()
  })
  it('throws exception if constructed with invalid maxCapacity', function () {
    expect(() => { return new Semaphore({ maxCapacity: 'foobar' }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: null }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: {} }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: Number.NEGATIVE_INFINITY }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: Number.POSITIVE_INFINITY }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: Number.NaN }) }).to.throw()
  })
  it('throws exception if constructed with maxCapacity < 0', function () {
    expect(() => { return new Semaphore({ maxCapacity: -1 }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: -2 }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: Number.MIN_VALUE }) }).to.throw()
  })
  it('throws exception if constructed with maxCapacity fraction', function () {
    expect(() => { return new Semaphore({ maxCapacity: 0.5 }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: 3.3 }) }).to.throw()
    expect(() => { return new Semaphore({ maxCapacity: -1.1 }) }).to.throw()
  })
  it('throws no exception if constructed with maxCapacity >= 0', function () {
    expect(() => { return new Semaphore({ maxCapacity: 0 }) }).to.not.throw()
    expect(() => { return new Semaphore({ maxCapacity: 1 }) }).to.not.throw()
    expect(() => { return new Semaphore({ maxCapacity: 2 }) }).to.not.throw()
    expect(() => { return new Semaphore({ maxCapacity: Number.MAX_VALUE }) }).to.not.throw()
  })
  it('initializes maxCapacity from options', function () {
    function test (maxCapacity) {
      expect(new Semaphore({ maxCapacity })).to.have.property('maxCapacity', maxCapacity)
    }
    test(1)
    test(2)
    test(3)
    test(44)
    test(Number.MAX_VALUE)
  })

  describe('freeCapacity', function () {
    it('reflects maxCapacity at construction', function () {
      const sem0 = new Semaphore({ maxCapacity: 0 })
      expect(sem0).to.have.property('freeCapacity', 0)

      const sem1 = new Semaphore({ maxCapacity: 1 })
      expect(sem1).to.have.property('freeCapacity', 1)

      const sem2 = new Semaphore({ maxCapacity: 2 })
      expect(sem2).to.have.property('freeCapacity', 2)
    })
  })

  describe('usedCapacity', function () {
    it('is 0 at construction', function () {
      const sem0 = new Semaphore({ maxCapacity: 0 })
      expect(sem0).to.have.property('usedCapacity', 0)

      const sem1 = new Semaphore({ maxCapacity: 1 })
      expect(sem1).to.have.property('usedCapacity', 0)

      const sem2 = new Semaphore({ maxCapacity: 2 })
      expect(sem2).to.have.property('usedCapacity', 0)
    })
  })

  describe('enter()', function () {
    it('increases usedCapacity & reduces freeCapacity', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      expect(sem1).to.have.property('hasFreeCapacity', true)
      sem1.enter()
      expect(sem1).to.have.property('usedCapacity', 1)
      expect(sem1).to.have.property('freeCapacity', 0)
      expect(sem1).to.have.property('hasFreeCapacity', false)

      const sem2 = new Semaphore({ maxCapacity: 2 })
      expect(sem2).to.have.property('hasFreeCapacity', true)
      sem2.enter()
      expect(sem2).to.have.property('usedCapacity', 1)
      expect(sem2).to.have.property('freeCapacity', 1)
      expect(sem2).to.have.property('hasFreeCapacity', true)
      sem2.enter()
      expect(sem2).to.have.property('usedCapacity', 2)
      expect(sem2).to.have.property('freeCapacity', 0)
      expect(sem2).to.have.property('hasFreeCapacity', false)
    })

    it('throws exception when no capacity left', function () {
      const sem0 = new Semaphore({ maxCapacity: 0 })
      expect(() => { sem0.enter() }).to.throw()

      const sem1 = new Semaphore({ maxCapacity: 1 })
      expect(() => { sem1.enter() }).to.not.throw()
      expect(() => { sem1.enter() }).to.throw()

      const sem3 = new Semaphore({ maxCapacity: 3 })
      expect(() => { sem3.enter() }).to.not.throw()
      expect(() => { sem3.enter() }).to.not.throw()
      expect(() => { sem3.enter() }).to.not.throw()
      expect(() => { sem3.enter() }).to.throw()
    })

    it('returns a valid ticket', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      const sem1ticket1 = sem1.enter()
      expect(sem1ticket1).to.be.an('object')
      expect(sem1ticket1).to.have.property('id').that.is.a('number')
      expect(sem1ticket1).to.have.property('t').that.is.a('number')
      expect(sem1ticket1).to.have.property('dispose').that.is.a('function')
    })

    it('returns a different ticket for every entering', function () {
      const sem3 = new Semaphore({ maxCapacity: 3 })
      const sem3ticket1 = sem3.enter()
      const sem3ticket2 = sem3.enter()

      expect(sem3ticket1).to.be.an('object')
      expect(sem3ticket1).to.have.property('id').that.is.a('number')
      expect(sem3ticket1).to.have.property('t').that.is.a('number')

      expect(sem3ticket2).to.be.an('object')
      expect(sem3ticket2).to.have.property('id').that.is.a('number')
      expect(sem3ticket2).to.have.property('t').that.is.a('number')

      expect(sem3ticket1).to.be.not.equal(sem3ticket2)
      expect(sem3ticket1.id).to.be.not.equal(sem3ticket2.id)
    })

    it('returns a different ticket for re-entering', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      const sem1ticket1 = sem1.enter()
      sem1.leave(sem1ticket1)
      const sem1ticket2 = sem1.enter()

      expect(sem1ticket1).to.be.an('object')
      expect(sem1ticket1).to.have.property('id').that.is.a('number')
      expect(sem1ticket1).to.have.property('t').that.is.a('number')

      expect(sem1ticket2).to.be.an('object')
      expect(sem1ticket2).to.have.property('id').that.is.a('number')
      expect(sem1ticket2).to.have.property('t').that.is.a('number')

      expect(sem1ticket1).to.be.not.equal(sem1ticket2)
      expect(sem1ticket1.id).to.be.not.equal(sem1ticket2.id)
    })
  })

  describe('leave()', function () {
    it('reduces usedCapacity & increases freeCapacity', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      sem1.leave(sem1.enter())
      expect(sem1).to.have.property('usedCapacity', 0)
      expect(sem1).to.have.property('freeCapacity', 1)
      expect(sem1).to.have.property('hasFreeCapacity', true)

      const sem2 = new Semaphore({ maxCapacity: 2 })
      const sem2ticket1 = sem2.enter()
      const sem2ticket2 = sem2.enter()
      sem2.leave(sem2ticket1)
      expect(sem2).to.have.property('usedCapacity', 1)
      expect(sem2).to.have.property('freeCapacity', 1)
      expect(sem2).to.have.property('hasFreeCapacity', true)
      sem2.leave(sem2ticket2)
      expect(sem2).to.have.property('usedCapacity', 0)
      expect(sem2).to.have.property('freeCapacity', 2)
      expect(sem2).to.have.property('hasFreeCapacity', true)
    })

    it('throws exception when used without ticket or ticketId', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      sem1.enter()
      expect(() => { sem1.leave() }).to.throw()
    })

    it('throws exception when used with invalid ticket or ticketId', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      sem1.enter()
      expect(() => { sem1.leave(null) }).to.throw()
      expect(() => { sem1.leave('foobar') }).to.throw()
      expect(() => { sem1.leave(function () {}) }).to.throw()
      expect(() => { sem1.leave({}) }).to.throw()
    })

    it('throws exception when used with unknown ticketId', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      sem1.enter()
      expect(() => { sem1.leave(99) }).to.throw()
      expect(() => { sem1.leave({ id: 99 }) }).to.throw()
    })

    it('throws exception when used twice on same ticket', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      const sem1ticket1 = sem1.enter()

      sem1.leave(sem1ticket1)
      expect(() => { sem1.leave(sem1ticket1) }).to.throw()
    })
  })
})

describe('SemaphoreTicket', function () {
  describe('dispose()', function () {
    it('calls `leave()` on the semaphore', function () {
      const sem1 = new Semaphore({ maxCapacity: 1 })
      const sem1ticket1 = sem1.enter()

      const leaveSpy = chai.spy.on(sem1, 'leave');

      expect(sem1).to.have.property('usedCapacity', 1)
      sem1ticket1.dispose()
      expect(leaveSpy).to.have.been.called();
      expect(sem1).to.have.property('usedCapacity', 0)
    })
  })
})
