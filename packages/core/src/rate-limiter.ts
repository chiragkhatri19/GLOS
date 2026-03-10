import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({ minTime: 7000, maxConcurrent: 1 })

export function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  return limiter.schedule(fn)
}
