# Tasty

A mobile-first food-corner menu prototype built with plain HTML, CSS, and JavaScript.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Future backend integration

UI data is currently provided from `src/data/menu.js` through the `menuApi` interface in `src/services/menu-api.js`. Replace the mock methods in that service with HTTP requests when backend endpoints are ready; UI components only depend on the service interface.
