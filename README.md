# GroupBuy

Group buying for housing societies in India: neighbours in one apartment complex pool a grocery order, the price drops as more flats join, and everything arrives at the society gate.

- `index.html`: the landing page
- `app.html` with `app/app.js` and `app/app.css`: the working app (browse group buys, start one, join, live price tiers, basket, UPI checkout, my groups)

## Run it

It is plain HTML, CSS and JavaScript with no build step. Serve the folder over http, for example:

```bash
node .claude/serve.mjs 5178
```

then open http://127.0.0.1:5178/ (landing) or http://127.0.0.1:5178/app.html (app).

## Notes

- Demo data: one society, 18 products and 12 open groups, kept in the browser's localStorage. "Reset demo data" in the app's footer restores it. Neighbours joining is simulated so prices move while you watch.
- Payments are simulated: no UPI request is sent.
- Product photographs are licensed stand-ins from Wikimedia Commons, credited in `credits.html`.
