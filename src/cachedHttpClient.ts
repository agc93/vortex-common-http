import { log, util } from 'vortex-api';
import { IExtensionApi } from 'vortex-api/lib/types/api';
import * as Redux from 'redux';
import { HttpClient, IHttpClientOptions } from './httpClient';

/**
 * A simple object representing data stored in a state for caching.
 */
 export interface ICacheDetails<T> {
    statePath: string[];
    cacheAction: Redux.Action<T>;
}

export abstract class CachedHttpClient extends HttpClient {
    protected _api: IExtensionApi;
    /**
     *
     */
    constructor(api: IExtensionApi, userAgent: string) {
        super(userAgent);
        this._api = api;
    }

    protected checkCache<TCache, T>(statePath: string[], stateHandler?: (cache: TCache) => T) {
        stateHandler = stateHandler ?? ((cache) => cache as any);
        if (this._api) {
            var cache = util.getSafeCI<TCache>(this._api.getState(), statePath, undefined);
            if (cache != undefined && cache) {
                return stateHandler(cache);
            }
        }
        return null;
    }

    protected getCachedApiResponse = async <T>(cache: ICacheDetails<T>, url: string, returnHandler?: (data: any) => T, onError?: (err: Error) => any, options?: IHttpClientOptions): Promise<T | null> | null => {
        var cachedMap = this.checkCache<T, T>(cache.statePath);
        if (cachedMap) {
            return cachedMap;
        }
        try {
            var resp = await this.getApiResponse<T>(url, returnHandler, onError, options);
            this.updateCache(cache.cacheAction, () => resp != null);
            return resp;
        } catch (err) {
            log('error', 'error fetching response from API', { err });
            return null;
        }
    };

    protected updateCache = (dispatchAction: Redux.Action, checkAction?: () => boolean) => {
        checkAction = checkAction ?? (() => true);
        if (this._api && checkAction) {
            // traceLog('adding entry to cache', {ident: mapKey, key: resp.key});
            this._api.store.dispatch(dispatchAction);
        }
    };
}

export abstract class CachedActionHttpClient<T> extends HttpClient {
    private _cacheDetails: ICacheDetails<T>;
    protected _api: IExtensionApi;
    /**
     *
     */
    constructor(api: IExtensionApi, cacheDetails: ICacheDetails<T>, httpUserAgent: string) {
        super(httpUserAgent);
        this._api = api;
        this._cacheDetails = cacheDetails;
    }

    protected checkCache<TCache, T>(stateHandler?: (cache: TCache) => T) {
        stateHandler = stateHandler ?? ((cache) => cache as any);
        if (this._api) {
            var cache = util.getSafeCI<TCache>(this._api.getState(), this._cacheDetails.statePath, undefined);
            if (cache != undefined && cache) {
                return stateHandler(cache);
            }
        }
        return null;
    }

    protected getCachedApiResponse = async <T>(url: string, returnHandler?: (data: any) => T, onError?: (err: Error) => any, options?: IHttpClientOptions): Promise<T | null> | null => {
        var cachedMap = this.checkCache<T, T>();
        if (cachedMap) {
            return cachedMap;
        }
        try {
            var resp = await this.getApiResponse<T>(url, returnHandler, onError, options);
            this.updateCache(() => resp != null);
            return resp;
        } catch (err) {
            log('error', 'error fetching response from API', { err });
            return null;
        }
    };

    protected updateCache = (checkAction?: () => boolean) => {
        checkAction = checkAction ?? (() => true);
        if (this._api && checkAction) {
            // traceLog('adding entry to cache', {ident: mapKey, key: resp.key});
            this._api.store.dispatch(this._cacheDetails.cacheAction);
        }
    };
}
