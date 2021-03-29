'use strict'

/**
 * @typedef {Object} Concurrency.Semaphore.ConstructOptions
 * @property {number} maxCapacity - The maximum number of entries this semaphore can have at any given moment
 */

/**
 * @typedef {number} Concurrency.Semaphore.TicketId
 */

/**
 * @typedef {Object} Concurrency.Semaphore.Ticket
 * @property {Concurrency.Semaphore.TicketId} id
 * @property {number} t - The timestamp of when the ticket was created
 * @property {function} dispose - Utility function to leave the semaphore with this ticket - compatible with disposable patterns
 */

/**
 * @class Concurrency.Semaphore
 * A counting semaphore that limits the number of concurrent entries of a critical section
 */
export class Semaphore {
  /**
   * @param {Concurrency.Semaphore.ConstructOptions} options
   */
  constructor (options) {
    if (!options) {
      throw new Error('Cannot construct Semaphore without options')
    }

    options = Object.assign({}, options)

    if (!Number.isFinite(options.maxCapacity)) {
      throw new Error(`Cannot construct Semaphore with non-numeric maxCapacity '${options.maxCapacity}'`)
    }
    if (!Number.isInteger(options.maxCapacity)) {
      throw new Error(`Cannot construct Semaphore with non-integer maxCapacity < 0 '${options.maxCapacity}'`)
    }
    if (options.maxCapacity < 0) {
      throw new Error(`Cannot construct Semaphore with maxCapacity < 0 '${options.maxCapacity}'`)
    }

    this._maxCapacity = options.maxCapacity

    /**
     * @type {Array.<Concurrency.Semaphore.Ticket>}
     */
    this._tickets = []
    this._ticketIdIdx = 0
  }

  /**
   * The maximum number of entries this semaphore can have at any given moment
   * @return {number}
   */
  get maxCapacity () {
    return this._maxCapacity
  }

  /**
   * The number of entries this semaphore currently has
   * @return {number}
   */
  get usedCapacity () {
    return this._tickets.length
  }

  /**
   * The number of additional entries this semaphore currently supports
   * @return {number}
   */
  get freeCapacity () {
    return this.maxCapacity - this.usedCapacity
  }

  /**
   * True if any additional entry is currently supported, False otherwise
   * @return {boolean}
   */
  get hasFreeCapacity () {
    return this.freeCapacity > 0
  }

  /**
   * @return {number}
   * @private
   */
  _reserveTicketId () {
    return this._ticketIdIdx++
  }

  /**
   * Atomically enters the critical section once
   * @return {Concurrency.Semaphore.Ticket}
   */
  enter () {
    if (!this.hasFreeCapacity) {
      throw new Error('Cannot enter semaphore at max capacity')
    }
    const semaphore = this
    /**
     * @type {Concurrency.Semaphore.Ticket}
     */
    const newTicket = {
      id: this._reserveTicketId(),
      t: Date.now(),
      dispose () {
        semaphore.leave(newTicket)
      }
    }
    this._tickets.push(newTicket)
    return newTicket
  }

  /**
   * Atomically enters the critical section once, if there is capacity
   * @return {Concurrency.Semaphore.Ticket|boolean} false if there was no capacity and the semaphore was not entered
   */
  tryEnter () {
    if (!this.hasFreeCapacity) {
      return false
    }
    return this.enter()
  }

  /**
   * Atomically leaves the critical section with the given ticket id
   * @param {number|Concurrency.Semaphore.Ticket} ticket - The ticket or ticket id received upon entering
   */
  leave (ticket) {
    let ticketId
    if (ticket && Number.isFinite(ticket.id)) {
      ticketId = ticket.id
    }
    if (Number.isFinite(ticket)) {
      ticketId = ticket
      ticket = undefined
    }

    if (!Number.isFinite(ticketId)) {
      throw new Error(`Cannot leave semaphore with invalid ticketId '${ticketId}'`)
    }

    for (let ticketIndex = 0; ticketIndex < this._tickets.length; ticketIndex++) {
      const ownedTicket = this._tickets[ticketIndex]
      if (ownedTicket.id === ticketId) {
        this._tickets.splice(ticketIndex, 1)
        return
      }
    }
    throw new Error(`Could not leave semaphore with unknown ticketId '${ticketId}'`)
  }

  /**
   * Enters the semaphore to call an function, leaving it upon function completion.
   * This ensures the semaphore is left, even if the function throws an error
   * @template TReturn
   * @param {function(...):TReturn} func - Function to be executed
   * @param [thisArg] The object to be used as the current object.
   * @param [args] - Arguments to be passed to the method.
   * @return {TReturn}
   */
  call (func, thisArg, ...args) {
    const ticket = this.enter()
    let result
    try {
      result = func.call(thisArg, ...args)
    } finally {
      this.leave(ticket)
    }
    return result
  }

  /**
   * Enters the semaphore to call and await an async function, leaving it upon function/promise completion.
   * This ensures the semaphore is left, even if the function throws an error
   * @template TReturn
   * @param {function(...):Promise<TReturn>} func - Function to be executed
   * @param [thisArg] The object to be used as the current object.
   * @param [args] - Arguments to be passed to the method.
   * @return {TReturn}
   */
  async callAsync (func, thisArg, ...args) {
    const ticket = this.enter()
    let result
    try {
      result = await func.call(thisArg, ...args)
    } finally {
      this.leave(ticket)
    }
    return result
  }
}
