// ============ Dashboard ============
const DASHBOARD = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>绘梦 SoulWriter</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#0f0f23;color:#e0e0e0;min-height:100vh}
.c{max-width:1000px;margin:0 auto;padding:20px}
h1{background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2.5em;text-align:center;padding:30px 0}
.bar{display:flex;justify-content:center;gap:20px;margin:20px 0}
.b{background:#1a1a3e;padding:15px 25px;border-radius:12px;text-align:center}
.b .v{font-size:1.8em;font-weight:bold;color:#667eea}
.b .l{color:#888;font-size:0.85em;margin-top:5px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}
.m{background:#1a1a3e;padding:20px;border-radius:12px;text-align:center}
.m h3{color:#667eea;margin:10px 0}
.m p{color:#888;font-size:0.85em}
.test{background:#1a1a3e;padding:20px;border-radius:12px;margin:20px 0}
.test h3{color:#667eea;margin-bottom:15px}
select,input{background:#252552;border:1px solid #333;color:#fff;padding:10px;border-radius:8px;width:100%;margin:5px 0}
.btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;margin:5px}
.result{background:#0d0d1a;padding:15px;border-radius:8px;margin-top:10px;font-family:monospace;font-size:0.85em;max-height:200px;overflow:auto}
.log{background:#0d0d1a;padding:15px;border-radius:8px;max-height:200px;overflow:auto;font-family:monospace;font-size:0.85em}
.log-entry{padding:5px 10px;margin:3px 0;border-radius:5px}
.log-entry.ok{background:#10b98120;border-left:3px solid #10b981}
.log-entry.err{background:#ef444420;border-left:3px solid #ef4444}
.endpoints{display:flex;flex-wrap:wrap;gap:8px}
.endpoints span{background:#252552;padding:5px 10px;border-radius:5px;font-family:monospace;font-size:0.85em}
</style></head><body>
<div class="c">
<h1>🎭 绘梦 SoulWriter</h1>
<div class="bar">
<div class="b"><div class="v" id="status">-</div><div class="l">API状态</div></div>
<div class="b"><div class="v" id="projects">-</div><div class="l">项目</div></div>
<div class="b"><div class="v" id="nvwa">-</div><div class="l">女娲角色</div></div>
<div class="b"><div class="v">v1.0</div><div class="l">版本</div></div>
</div>
<div class="grid">
<div class="m"><h3>🎭 女娲推演</h3><p>角色量子纠缠引擎</p></div>
<div class="m"><h3>🌳 创世树</h3><p>剧情分支管理</p></div>
<div class="m"><h3>📤 导出</h3><p>TXT/JSON/MD</p></div>
</div>
<div class="test">
<h3>🔧 API测试</h3>
<select id="ep">
<option value="/health">/health</option>
<option value="/api/v1/projects">/api/v1/projects</option>
<option value="/api/v1/nvwa/status">/api/v1/nvwa/status</option>
<option value="/api/v1/ai/config">/api/v1/ai/config</option>
<option value="/api/v1/genesis/seeds">/api/v1/genesis/seeds</option>
</select>
<button class="btn" onclick="test()">发送</button>
<button class="btn" onclick="refresh()">刷新</button>
<div id="result" class="result" style="display:none;"></div>
</div>
<div class="test">
<h3>📊 操作日志</h3>
<div id="log" class="log"></div>
</div>
<div class="test">
<h3>🚀 端点</h3>
<div class="endpoints" id="eps"></div>
</div>
</div>
<script>
const API = location.origin;
const logs = [];
function log(msg, type) {
    logs.unshift({t: new Date().toLocaleTimeString(), msg, type});
    if(logs.length > 15) logs.pop();
    document.getElementById("log").innerHTML = logs.map(l=>'<div class="log-entry '+l.type+'">['+l.t+'] '+l.msg+'</div>').join("");
}
async function api(p) {
    try { const r = await fetch(API + p); return await r.json(); }
    catch(e) { return {error: e.message}; }
}
async function test() {
    const ep = document.getElementById("ep").value;
    document.getElementById("result").style.display = "block";
    document.getElementById("result").textContent = "加载中...";
    const d = await api(ep);
    document.getElementById("result").textContent = JSON.stringify(d, null, 2);
    log(ep + " -> " + (d.error ? d.error : "OK"), d.error ? "err" : "ok");
}
async function refresh() {
    log("刷新...", "ok");
    const h = await api("/health");
    document.getElementById("status").textContent = h.status === "ok" ? "✅" : "❌";
    const p = await api("/api/v1/projects");
    document.getElementById("projects").textContent = Array.isArray(p) ? p.length : "?";
    const n = await api("/api/v1/nvwa/status");
    if(n && n.activeCharacters !== undefined) document.getElementById("nvwa").textContent = n.activeCharacters;
}
const eps = ["/health","/api/v1/projects","/api/v1/nvwa/status","/api/v1/ai/config","/api/v1/genesis/seeds"];
document.getElementById("eps").innerHTML = eps.map(e=>'<span>'+e+'</span>').join("");
refresh();
setInterval(refresh, 15000);
</script>
</body></html>`;

fastify.get("/", (req, reply) => { reply.header("Content-Type", "text/html; charset=utf-8"); reply.send(DASHBOARD); });
fastify.get("/dashboard", (req, reply) => { reply.header("Content-Type", "text/html; charset=utf-8"); reply.send(DASHBOARD); });
