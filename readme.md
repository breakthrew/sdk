# BreakThrew Tracking Tag

The BreakThrew Tracking Tag is used to send tracking information to the BreakThrew API.

## Tag Usage

Use the following to include the BreakThrew tag in a page:

```
<script type="text/javascript">
  (function(u, i, p) { window.brkthrw = window.brkthrw || (function() { var obj = { q: [], app: i }; obj.push = function() { var args = Array.from(arguments); args.push({ referrer: document.referrer || window.location.href, timestamp: Date.now(), }); obj.q.push(args); }; var s = document.createElement('script'); s.async = 1; s.src = u; p = p || document.getElementsByTagName('script')[0]; p.parentNode.insertBefore(s, p); return obj; })(); })
  ('https://cdn.brkthrw.io/brkthrw.min.js', 'APPKEY');
</script>
```

Where 'APPKEY' is used, be sure to put in the app key that corresponds to your account.

## Development

Make changes to the `/src/index.js` file, run a build and rerun the test server:

```
npm run build && npm run local
```

## Testing

You can create tests in the `/src/test` directory. To run tests:

```
npm run test
```

## Deployment

Run the following command:

```
npm run deploy
```

This will build the code, minify it, and upload it to the CDN as `cdn.brkthrw.io/brkthrw.min.js`
