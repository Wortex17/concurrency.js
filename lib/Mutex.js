'use strict'

import { Semaphore } from './Semaphore'

/**
 * @typedef {Object} Concurrency.MutexConstructOptions
 */

/**
 * @class Concurrency.Mutex
 * A semaphore with a capacity of 1 that can be used as a lock for critical sections.
 */
export class Mutex extends Semaphore {
  /**
   * @param {Concurrency.MutexConstructOptions} [options]
   */
  constructor (options) {
    options = Object.assign({}, options, {
      maxCapacity: 1
    })
    super(options)
  }
}
