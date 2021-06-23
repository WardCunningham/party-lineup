
// https://deno.com/deploy/docs/hello-world

addEventListener("fetch", (event) => event.respondWith(handle(event.request)))
const started = Date.now()

function handle(request) {
  let routes = {
    "/favicon.ico": flag,
    "/new": random,
    "/": redirect
  }
  let client = request.headers.get("x-forwarded-for")
  let { pathname, search, origin } = new URL(request.url)
  post([{eventType:'party-lineup', pathname, search, origin, client, started}])
  try {
    return routes[pathname](search, origin)
  } catch (err) {
    console.log(err)
    return new Response(`<pre>${err}</pre>`, {status:500})
  }
}

// https://css-tricks.com/emojis-as-favicons/

function flag() {
  let text = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>`
  return new Response(text, { headers: { "content-type": "image/svg+xml" } })
}

function redirect(search, origin) {
  return Response.redirect(`http://ward.asia.wiki.org/assets/pages/party-lineup/client.html`, 302)
}

function random(search, origin) {
  let text = `Your number is ${Math.floor(Math.random()*10000)}. Write it down.`
  return new Response(text, { headers: { "content-type": "text/plain" } })
}

function post(data) {
  fetch('https://insights-collector.newrelic.com/v1/accounts/3138524/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Insert-Key': Deno.env.get("INSIGHTS_INSERT_KEY")
    },
    body: JSON.stringify(data),
  })
  .then(res => res.json())
  .then(success => console.log({success}))
  .catch(error => console.error(Date().toLocaleString(),error.message))
}
