
// https://deno.com/deploy/docs/hello-world
// https://deno.com/deploy/docs/runtime-broadcast-channel

const started = Date.now()
const channel = new BroadcastChannel("party-lineup")

let messages = []
let headers = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "x-isolate-start": started
}
channel.onmessage = (event) => keep(event.data)

addEventListener("fetch", (event) => event.respondWith(handle(event.request)))

function keep(obj) {
  let want = messages.filter(o => o.site != obj.site || o.slug != obj.slug)
  want.unshift(obj)
  messages = want
}

async function handle(request) {
  let routes = {
    "/send": send,
    "/sendarg": sendarg,
    "/recall": recall,
    "/favicon.ico": flag,
    "/": redirect
  }
  let client = request.headers.get("x-forwarded-for")
  let { pathname, search, origin } = new URL(request.url)
  // if (request.method === "OPTIONS") return preflight()
  post([{eventType:'PartyLineup', pathname, search, origin, client, started}])
  try {
    return await routes[pathname]()
  } catch (err) {
    console.log(err)
    return new Response(`<pre>${err}</pre>`, {status:500})
  }

  // function preflight() {
  //   return new Response(null, {
  //     status: 204, // No content
  //     headers: {
  //       "Access-Control-Allow-Origin": request.headers.get('Origin') || "*",
  //       "Access-Control-Allow-Methods": "PUT, GET, OPTIONS",
  //       "Access-Control-Max-Age": "600",
  //     },
  //   })
  // }

  function redirect() {
    return Response.redirect(`http://ward.asia.wiki.org/assets/pages/party-lineup/client.html`, 302)
  }

  async function send() {
    let message = await request.json()
    message.client = client
    keep(message)
    channel.postMessage(message)
    return new Response('{"ok":true}', {headers})
  }

  async function sendarg() {
    // let message = await request.json()
    let message = JSON.parse(atob(search.replace(/\?/,'')))
    message.client = client
    keep(message)
    channel.postMessage(message)
    return new Response(JSON.stringify(messages,null,2), {headers})
  }

  function recall() {
      return new Response(JSON.stringify(messages,null,2), {headers})
  }

  function flag() {
    let text = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">☎️</text></svg>`
    return new Response(text, { headers: { "content-type": "image/svg+xml" } })
  }
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
