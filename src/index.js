/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/") {
			await increment(env, "visits");
			return html(homePage());
		}

		if (url.pathname === "/submit" && request.method === "POST") {
			const body = await request.json();
			const id = crypto.randomUUID();

			await env.SIGNUPS.put(id, JSON.stringify(body));
			await increment(env, "signups");

			return json({ success: true });
		}

		if (url.pathname === "/download") {
			await increment(env, "downloads");
			return new Response("Download tracked.");
		}

		if (url.pathname === "/stats") {
			return json({
				visits: await get(env, "visits"),
				downloads: await get(env, "downloads"),
				signups: await get(env, "signups"),
			});
		}

		if (url.pathname === "/dashboard") {
			return html(dashboardPage());
		}

		if (url.pathname === "/admin-signups") {
			const list = await env.SIGNUPS.list();
			const items = await Promise.all(
				list.keys.map(async (key) => {
					const value = await env.SIGNUPS.get(key.name);
					return JSON.parse(value);
				})
			);
			return json(items);
		}

		return new Response("Not Found", { status: 404 });
	}
};

async function increment(env, key) {
	const current = parseInt(await env.STATS.get(key)) || 0;
	await env.STATS.put(key, current + 1);
}

async function get(env, key) {
	return parseInt(await env.STATS.get(key)) || 0;
}

function json(obj) {
	return new Response(JSON.stringify(obj), {
		headers: { "content-type": "application/json" },
	});
}

function html(content) {
	return new Response(content, {
		headers: { "content-type": "text/html" },
	});
}

function homePage() {
	return `
<!DOCTYPE html>
<html>
<head>
<title>Work In Progress</title>
<style>
body {
  font-family: system-ui;
  background: #0f172a;
  color: white;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
}
.container {
  background:#1e293b;
  padding:40px;
  border-radius:12px;
  width:420px;
  text-align:center;
}
input {
  width:100%;
  padding:10px;
  margin:8px 0;
  border-radius:6px;
  border:none;
}
button {
  width:100%;
  padding:10px;
  border:none;
  border-radius:6px;
  background:#3b82f6;
  color:white;
  cursor:pointer;
}
button:hover { background:#2563eb; }
</style>
</head>
<body>
<div class="container">
<h1>Hello 👋</h1>
<h2>Work in Progress</h2>
<p>Get ready… more coming soon.</p>

<form id="signup">
<input placeholder="Name" required id="name">
<input placeholder="Email" required type="email" id="email">
<button>Join Project</button>
</form>

<button onclick="window.location='/download'">
Download App
</button>

<p id="msg"></p>
</div>

<script>
document.getElementById("signup").addEventListener("submit", async (e)=>{
e.preventDefault();
const name=document.getElementById("name").value;
const email=document.getElementById("email").value;

const res=await fetch("/submit",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,email})
});

if(res.ok){
document.getElementById("msg").innerText="You're in. More soon.";
e.target.reset();
}
});
</script>
</body>
</html>
`;
}

function dashboardPage() {
	return `
<!DOCTYPE html>
<html>
<head>
<title>Dashboard</title>
<style>
body { font-family:system-ui; background:#111; color:white; padding:40px;}
.stat { font-size:22px; margin:10px 0; }
</style>
</head>
<body>
<h1>Live Metrics</h1>
<div class="stat">Visits: <span id="visits">0</span></div>
<div class="stat">Downloads: <span id="downloads">0</span></div>
<div class="stat">Signups: <span id="signups">0</span></div>

<script>
async function load(){
const res=await fetch("/stats");
const data=await res.json();
document.getElementById("visits").innerText=data.visits;
document.getElementById("downloads").innerText=data.downloads;
document.getElementById("signups").innerText=data.signups;
}
load();
setInterval(load,3000);
</script>
</body>
</html>
`;
}
