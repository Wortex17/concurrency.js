'use strict'

/**
 * @typedef {Object} Concurrency.SemaphoreConstructOptions
 * @property {number} maxCapacity - The maximum number of entries this semaphore can have at any given moment
 */

/**
 * @typedef {number} Concurrency.SemaphoreTicketId
 */

/**
 * @typedef {Object} Concurrency.SemaphoreTicket
 * @property {Concurrency.SemaphoreTicketId} id
 * @property {number} t - he timestamp of when the ticket was created
 */

/**
 * @class Concurrency.Semaphore
 * A counting semaphore that limits the number of concurrent entries of a critical section
 */
export class Semaphore {
  /**
   * @param {Concurrency.SemaphoreConstructOptions} options
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
     * @type {Array.<Concurrency.SemaphoreTicket>}
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
   * @return {Concurrency.SemaphoreTicket}
   */
  enter () {
    if (!this.hasFreeCapacity) {
      throw new Error('Cannot enter semaphore at max capacity')
    }
    /**
     * @type {Concurrency.SemaphoreTicket}
     */
    const newTicket = {
      id: this._reserveTicketId(),
      t: Date.now()
    }
    this._tickets.push(newTicket)
    return newTicket
  }

  /**
   * Atomically leaves the critical section with the given ticket id
   * @param {number|Concurrency.SemaphoreTicket} ticket - The ticket or ticket id received upon entering
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
}
