# Vortex Extensions HTTP Client

A simple library powered by Axios to take the boilerplate out of making HTTP API requests from Vortex extensions.

## Usage

> We ***strongly*** recommend using this library with TypeScript extensions and no support will be provided for JS extensions.

Since every extension's use case will be a little different, this library is designed around abstract classes that you can implement and tweak in your own extension. The main component is the `HttpClient` class. Implement a class that `extend`s the `HttpClient` class to get start:

```ts
class ApiClient extends HttpClient {
    constructor() {
        super('MyAwesomeExtension/0.1.0'); // user agent
    }
}

```

Now you can implement your own API surface to match your extension's requirements using the `getApiResponse<T>` function in the base class:

```ts
class ApiClient extends HttpClient {
    // trimmed

    getModDetails = async (modId: string): Promise<IModDetails> | null => {
        var url =  `https://sickmods.com/api/mod/${modId}`;
        var mod = await this.getApiResponse<IModDetails>(url, (data) => data[0])
        return mod;
    }
}
```

The typings (and tsdoc) should make the usage reasonably self-explanatory, but some more documentation should be coming soon.

> There is also a cached HTTP client that can be used in conjunction with the session state to work as a caching layer, but this is in early alpha and is likely unstable.