/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from './logger';
import { Service } from '../services';
import { trues, falses } from '../constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(`${process.cwd()}/package.json`);

//
// constants
//
const debug = trues.includes(String(process.env.TRACKING_DEBUG).toLowerCase());
const enabled = !falses.includes(String(process.env.TRACKING_ENABLED).toLowerCase());
const prefix = process.env.TRACKING_PREFIX ?? pkg.name ?? 'app';
const URL_PREFIX = '/api/v1/track';

interface Response {
    status: boolean
}

//
// mock class (for enabled cases)
//
const mockTrackingService = {
    post: async () => Promise.resolve({ status: true })
};

//
// main class
//
class Tracking {
    /**
   * Increment: Increments a stat by a value (default is 1)
   *   tracking.increment('my_counter');
   *
   * Incrementing multiple items
   *   tracking.increment(['these', 'are', 'different', 'stats']);
   *
   * Sampling, this will sample 25% of the time the StatsD Daemon will compensate for sampling
   *   tracking.increment('my_counter', 1, 0.25);
   */
    async increment (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/increment`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    /**
   * Decrement: Decrements a stat by a value (default is -1)
   *   tracking.decrement('my_counter');
   */
    async decrement (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/decrement`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    /**
   * Gauge: Gauge a stat by a specified amount
   *   tracking.gauge('my_gauge', 123.45);
   */
    async gauge (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/gauge`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    /**
   * Timing: sends a timing command with the specified milliseconds
   *   tracking.timing('response_time', 42);
   */
    async timing (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/timing`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    /**
   * Histogram: send data for histogram stat
   *   tracking.histogram('my_histogram', 42);
   *
   * Tags, this will add user-defined tags to the data
   *   tracking.histogram('my_histogram', 42, ['foo', 'bar']);
   *
   * Sampling, tags and callback are optional and could be used in any combination
   *   tracking.histogram('my_histogram', 42, 0.25); // 25% Sample Rate
   *   tracking.histogram('my_histogram', 42, ['tag']); // User-defined tag
   *   tracking.histogram('my_histogram', 42, next); // Callback
   *   tracking.histogram('my_histogram', 42, 0.25, ['tag']);
   *   tracking.histogram('my_histogram', 42, 0.25, next);
   *   tracking.histogram('my_histogram', 42, ['tag'], next);
   *   tracking.histogram('my_histogram', 42, 0.25, ['tag'], next);
   *
   */
    async histogram (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/histogram`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    /**
   * Set: Counts unique occurrences of a stat (alias of unique)
   *   tracking.unique('my_unique', 'foobarbaz');
   *   tracking.set('my_unique', 'foobar');
   *   tracking.set(['foo', 'bar'], 42, function(error, bytes){
   *     // this only gets called once after all messages have been sent
   *     if (error) {
   *       console.error('Oh noes! There was an error:', error);
   *     } else {
   *       console.log('Successfully sent', bytes, 'bytes');
   *     }
   *   });
   */
    async set (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/set`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    async unique (stat: string, ...args: any[]): Promise<Response> {
        return this.dispatchEvent(`${URL_PREFIX}/unique`, {
            args: [`${prefix}.${stat}`, ...args],
        });
    }

    /**
   * Events represent how users interact with your application. For example, "Button Clicked" may be an action you want to note.
   *   tracking.track('Button Clicked', eventProperties, {
   *     user_id: 'user@neta.mx',
   *   });
   */
    private async dispatchEvent (url: string, data: { args: [string, ...unknown[] ] }): Promise<Response> {
        try {
            const trackingService = enabled ? Service.get('tracking') : mockTrackingService;
            const res = await trackingService.post<Response>({ url, data });

            if (debug) {
                logger.debug(`Track event [${url.split('/')?.pop()?.toUpperCase()}] with args [${JSON.stringify(data.args)}]`);
            }
            return res;
        } catch (e) {
            if (debug) {
                logger.warn(
                    `Error on tracking event [${url.split('/')?.pop()?.toUpperCase()}] with args [${JSON.stringify(data.args)}]`,
                    e
                );
            }

            return {
                status: false
            };
        }
    }
}

export const tracking = new Tracking();
