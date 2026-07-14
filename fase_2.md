# Fase 2 — Aplicação Mini-IPTV (Grupo 4)

Pré-requisito: Fase 1 funcionando (rede, PPP, multicast, DNS, NAT, Apache em R1).

## Arquitetura

```
Navegador (X/Y/Z/W) ──HTTPS──> R1 Apache (gateway/proxy) ──HTTP──> S Flask :8000 ──> SQLite
VLC Client (X/Y/Z/W) <══ multicast UDP 239.<perfil>.4.<canal>:5004 ══ S cvlc
```

- Backend Flask + SQLite em S (`/opt/miniiptv`). Login OAuth2 (usuário/senha) → token **JWT**.
- Perfil pelo IP do cliente: `192.168.0.x` → **WAN115K** (239.20.4.x, vídeo leve); resto → **LAN** (239.10.4.x, vídeo original).
- Streaming só roda enquanto há espectador. **WAN115K: um canal por vez** (regra do enunciado).
- Usuários: `admin/admin123`, `aluno1/senha1` … `aluno4/senha4`.

## Índice

| Passo | O quê | Onde |
|---|---|---|
| [1](#1-pacotes) | Pacotes | S |
| [2](#2-vídeos) | Vídeos (ffmpeg/ffprobe) | S |
| [3](#3-backend) | Backend + serviço | S |
| [4](#4-testar-a-api) | Testar a API | S |
| [5](#5-gateway-https) | Gateway HTTPS | R1 |
| [6](#6-frontend) | Frontend | R1 |
| [7](#7-usar) | Usar (cliente) | X/Y/Z/W |
| [8](#8-validar-as-regras) | Validar as regras | clientes + S |
| [9](#9-admin) | Visão do admin | qualquer |

> Alternativa: `sudo bash scripts/setup-rede.sh` (papéis S e R1) já faz os passos 1, 3, 5 e 6.

---

## 1. Pacotes

```bash
# S
sudo apt update && sudo apt install -y python3-pip ffmpeg vlc-bin vlc-plugin-base sqlite3
sudo pip3 install flask pyjwt werkzeug

# usuário de serviço (o VLC não roda como root)
sudo useradd -r -m -d /opt/miniiptv iptv
sudo mkdir -p /opt/miniiptv/videos

# multicast sai pela placa da LAN#1 (troque IFACE)
sudo ip route add 239.0.0.0/8 dev IFACE
```

---

## 2. Vídeos

Copie 3 vídeos `.mp4` para `/opt/miniiptv/videos/` com os nomes `filme.mp4`, `aula.mp4`, `show.mp4`. Depois:

```bash
# S — gera a versão leve de cada um (comando do enunciado, cabe nos 115200 bps)
cd /opt/miniiptv/videos
for v in filme aula show; do
  ffmpeg -i ${v}.mp4 -c:v libx264 -b:v 80k -r 10 -s 320x240 \
         -c:a aac -b:a 16k -ac 1 -ar 22050 ${v}_ld.mp4
done

# metadados de um vídeo (duração, resolução, bitrate, codecs — para o cadastro)
ffprobe -v quiet -show_format -show_streams filme.mp4 | grep -E 'duration|bit_rate|codec_name|width|height'

sudo chown -R iptv:iptv /opt/miniiptv/videos
```

---

## 3. Backend

Grava o código, cria o banco e deixa rodando como serviço:

```bash
# S
sudo tee /opt/miniiptv/app.py >/dev/null <<'EOF'
import os, json, sqlite3, subprocess, functools, datetime, jwt
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

SECRET  = "grupo4-troque-este-segredo"
DB      = "/opt/miniiptv/iptv.db"
VIDEOS  = "/opt/miniiptv/videos"
GRUPO   = 4
PORTA_M = 5004
app = Flask(__name__)

# (canal, perfil) -> {"proc": Popen, "addr": str}   [LAN e WAN podem coexistir no mesmo canal]
streams = {}
# (canal, perfil) -> set(usuarios)
viewers = {}

def db():
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row; return c

def perfil():
    ip = request.headers.get("X-Forwarded-For", request.remote_addr).split(",")[0].strip()
    return "WAN115K" if ip.startswith("192.168.0.") else "LAN"

def mcast(canal, prof):
    return f"239.{20 if prof=='WAN115K' else 10}.{GRUPO}.{canal}"

def auth(admin=False):
    def deco(f):
        @functools.wraps(f)
        def w(*a, **kw):
            h = request.headers.get("Authorization", "")
            if not h.startswith("Bearer "):
                return jsonify(error="token ausente"), 401
            try:
                t = jwt.decode(h[7:], SECRET, algorithms=["HS256"])
            except jwt.PyJWTError as e:
                return jsonify(error=f"token invalido: {e}"), 401
            if admin and t["role"] != "admin":
                return jsonify(error="apenas admin"), 403
            g.user, g.role = t["sub"], t["role"]
            return f(*a, **kw)
        return w
    return deco

# ---------- OAuth2 (password grant) -> JWT ----------
@app.post("/api/token")
def token():
    d = request.form if request.form else (request.json or {})
    u = db().execute("SELECT * FROM users WHERE username=?", (d.get("username"),)).fetchone()
    if not u or not check_password_hash(u["pw"], d.get("password", "")):
        return jsonify(error="invalid_grant"), 401
    tok = jwt.encode({"sub": u["username"], "role": u["role"],
                      "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=4)},
                     SECRET, algorithm="HS256")
    return jsonify(access_token=tok, token_type="Bearer", expires_in=14400)

# ---------- Canais ----------
@app.get("/api/channels")
@auth()
def channels():
    prof, out = perfil(), []
    for c in db().execute("SELECT * FROM channels ORDER BY num"):
        v = db().execute("SELECT * FROM videos WHERE channel=?", (c["num"],)).fetchone()
        ativo = any(cn == c["num"] for (cn, _) in streams)
        out.append({"num": c["num"], "nome": c["nome"], "descricao": c["desc"],
                    "video": dict(v) if v else None,
                    "status": "ativo" if ativo else ("disponivel" if v else "indisponivel"),
                    "espectadores": sum(len(s) for (n, p), s in viewers.items() if n == c["num"]),
                    "mcast": mcast(c["num"], prof)})
    return jsonify(perfil=prof, canais=out)

@app.post("/api/channels")
@auth(admin=True)
def add_channel():
    d = request.json
    db().execute("INSERT INTO channels(num,nome,desc) VALUES(?,?,?)",
                 (d["num"], d["nome"], d.get("desc", ""))).connection.commit()
    return jsonify(ok=True), 201

@app.delete("/api/channels/<int:n>")
@auth(admin=True)
def del_channel(n):
    db().execute("DELETE FROM channels WHERE num=?", (n,)).connection.commit()
    return jsonify(ok=True)

# ---------- Vídeos (upload + conversão LD + metadados) ----------
@app.post("/api/videos")
@auth(admin=True)
def add_video():
    f = request.files["file"]; canal = int(request.form["channel"])
    nome = secure_filename(f.filename); orig = os.path.join(VIDEOS, nome)
    f.save(orig)
    ld = orig.rsplit(".", 1)[0] + "_ld.mp4"
    subprocess.run(["ffmpeg", "-y", "-i", orig, "-c:v", "libx264", "-b:v", "80k",
                    "-r", "10", "-s", "320x240", "-c:a", "aac", "-b:a", "16k",
                    "-ac", "1", "-ar", "22050", ld], check=True, capture_output=True)
    p = subprocess.run(["ffprobe", "-v", "quiet", "-print_format", "json",
                        "-show_format", "-show_streams", orig], capture_output=True, text=True)
    meta = json.loads(p.stdout)
    db().execute("INSERT OR REPLACE INTO videos(channel,arq_hd,arq_ld,meta) VALUES(?,?,?,?)",
                 (canal, orig, ld, json.dumps(meta["format"]))).connection.commit()
    return jsonify(ok=True, metadados=meta["format"]), 201

# ---------- Assistir / trocar / sair ----------
def start_stream(canal, prof):
    v = db().execute("SELECT * FROM videos WHERE channel=?", (canal,)).fetchone()
    if not v: return None
    arq = v["arq_ld"] if prof == "WAN115K" else v["arq_hd"]
    addr = mcast(canal, prof)
    proc = subprocess.Popen(["cvlc", "-I", "dummy", arq, "--loop", "--ttl", "16",
                             "--sout", f"#udp{{mux=ts,dst={addr}:{PORTA_M}}}"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    streams[(canal, prof)] = {"proc": proc, "addr": addr}
    return addr

def stop_if_empty(canal, prof):
    if not viewers.get((canal, prof)) and (canal, prof) in streams:
        streams[(canal, prof)]["proc"].terminate()
        del streams[(canal, prof)]

@app.post("/api/channels/<int:n>/watch")
@auth()
def watch(n):
    prof = perfil()
    if prof == "WAN115K":
        outro = next((c for (c, p) in streams if p == "WAN115K" and c != n), None)
        if outro:
            return jsonify(error=f"WAN ocupada: canal {outro} em exibicao; assista-o ou aguarde",
                           canal_ativo=outro), 409
    # sai de outros canais (troca de canal)
    for k in list(viewers):
        if g.user in viewers[k] and k != (n, prof):
            viewers[k].discard(g.user); stop_if_empty(*k)
    if (n, prof) not in streams:
        if not start_stream(n, prof):
            return jsonify(error="canal sem video"), 404
    viewers.setdefault((n, prof), set()).add(g.user)
    addr = streams[(n, prof)]["addr"]
    m3u = f"#EXTM3U\n#EXTINF:-1,Canal {n}\nudp://@{addr}:{PORTA_M}\n"
    return jsonify(canal=n, perfil=prof, mcast=f"udp://@{addr}:{PORTA_M}", playlist=m3u)

@app.post("/api/channels/<int:n>/leave")
@auth()
def leave(n):
    prof = perfil()
    viewers.get((n, prof), set()).discard(g.user)
    stop_if_empty(n, prof)
    return jsonify(ok=True)

# ---------- Playlist m3u do perfil ----------
@app.get("/api/playlist.m3u")
@auth()
def playlist():
    prof, linhas = perfil(), ["#EXTM3U"]
    for c in db().execute("SELECT * FROM channels ORDER BY num"):
        linhas += [f"#EXTINF:-1,{c['nome']}", f"udp://@{mcast(c['num'], prof)}:{PORTA_M}"]
    return "\n".join(linhas) + "\n", 200, {"Content-Type": "audio/x-mpegurl"}

# ---------- Admin: visão geral ----------
@app.get("/api/admin/status")
@auth(admin=True)
def status():
    vlc = subprocess.run(["pgrep", "-a", "vlc"], capture_output=True, text=True).stdout
    return jsonify(
        usuarios_conectados={f"canal{n}/{p}": sorted(s) for (n, p), s in viewers.items() if s},
        canais_ativos={f"canal{n}/{p}": s["addr"] for (n, p), s in streams.items()},
        processos_vlc=vlc.strip().splitlines())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
EOF
```

Banco com usuários e canais iniciais:

```bash
# S
sudo tee /opt/miniiptv/initdb.py >/dev/null <<'EOF'
import sqlite3
from werkzeug.security import generate_password_hash
c = sqlite3.connect("/opt/miniiptv/iptv.db")
c.executescript("""
CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, pw TEXT, role TEXT);
CREATE TABLE IF NOT EXISTS channels(num INTEGER PRIMARY KEY, nome TEXT, desc TEXT);
CREATE TABLE IF NOT EXISTS videos(channel INTEGER PRIMARY KEY, arq_hd TEXT, arq_ld TEXT, meta TEXT);
""")
for u, p, r in [("admin", "admin123", "admin"), ("aluno1", "senha1", "user"), ("aluno2", "senha2", "user"),
                ("aluno3", "senha3", "user"), ("aluno4", "senha4", "user")]:
    c.execute("INSERT OR REPLACE INTO users VALUES(?,?,?)", (u, generate_password_hash(p), r))
canais = [(1, "Filme", "Canal de filmes", "filme"), (2, "Aula", "Canal de aulas", "aula"), (3, "Show", "Canal de shows", "show")]
for n, nome, d, arq in canais:
    c.execute("INSERT OR REPLACE INTO channels VALUES(?,?,?)", (n, nome, d))
    c.execute("INSERT OR REPLACE INTO videos VALUES(?,?,?,?)",
              (n, f"/opt/miniiptv/videos/{arq}.mp4", f"/opt/miniiptv/videos/{arq}_ld.mp4", "{}"))
c.commit()
print("ok")
EOF

sudo chown -R iptv:iptv /opt/miniiptv
sudo -u iptv python3 /opt/miniiptv/initdb.py
```

Serviço systemd (sobe sozinho no boot):

```bash
# S
sudo tee /etc/systemd/system/miniiptv.service >/dev/null <<'EOF'
[Unit]
Description=Backend Mini-IPTV
After=network.target
[Service]
User=iptv
WorkingDirectory=/opt/miniiptv
ExecStart=/usr/bin/python3 /opt/miniiptv/app.py
Restart=always
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload && sudo systemctl enable --now miniiptv
systemctl is-active miniiptv     # active
```

---

## 4. Testar a API

```bash
# S — pega um token (OAuth2 password grant)
TOK=$(curl -s -X POST http://localhost:8000/api/token -d username=aluno1 -d password=senha1 \
      | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

# lista canais (com token) — deve vir JSON com 3 canais
curl -s -H "Authorization: Bearer $TOK" http://localhost:8000/api/channels | python3 -m json.tool

# sem token -> 401
curl -s http://localhost:8000/api/channels
```

---

## 5. Gateway HTTPS

R1 termina o TLS e repassa `/api` para S (arquitetura da Figura 2 do enunciado):

```bash
# R1
sudo a2enmod ssl proxy proxy_http
sudo openssl req -new -x509 -days 365 -nodes -subj "/CN=r1.grupo4.unb" \
  -out /etc/ssl/certs/r1.pem -keyout /etc/ssl/private/r1.key

sudo tee /etc/apache2/sites-available/miniiptv-ssl.conf >/dev/null <<'EOF'
<VirtualHost *:443>
    ServerName r1.grupo4.unb
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/r1.pem
    SSLCertificateKeyFile /etc/ssl/private/r1.key
    DocumentRoot /var/www/html
    ProxyPreserveHost On
    ProxyPass        /api http://172.16.0.2:8000/api
    ProxyPassReverse /api http://172.16.0.2:8000/api
</VirtualHost>
EOF
sudo a2ensite miniiptv-ssl && sudo systemctl reload apache2
```

**Testar (em X):** `curl -sk https://r1.grupo4.unb/api/token -d username=aluno1 -d password=senha1` → devolve o token (`-k` aceita o certificado autoassinado).

---

## 6. Frontend

Página única servida por R1 — login, lista de canais, assistir/sair:

```bash
# R1
sudo tee /var/www/html/iptv.html >/dev/null <<'EOF'
<!doctype html><meta charset="utf-8"><title>Mini-IPTV Grupo 4</title>
<style>body{font-family:sans-serif;max-width:720px;margin:2em auto}li{margin:.6em 0}
button{margin-left:.5em}#log{color:#06c}</style>
<h1>Mini-IPTV — Grupo 4</h1>
<div id="login"><input id="u" placeholder="usuário"> <input id="p" type="password" placeholder="senha">
<button onclick="entrar()">Entrar</button></div>
<p id="log"></p><ul id="canais"></ul>
<script>
let tok=null;
const api=(p,opt={})=>fetch("/api"+p,{...opt,headers:{...opt.headers,
  ...(tok?{"Authorization":"Bearer "+tok}:{})}}).then(r=>r.json().then(j=>({s:r.status,j})));
async function entrar(){
  const b=new URLSearchParams({username:u.value,password:p.value});
  const {s,j}=await api("/token",{method:"POST",body:b});
  if(s!=200){log.textContent="login falhou";return}
  tok=j.access_token; login.style.display="none"; listar();
}
async function listar(){
  const {j}=await api("/channels");
  log.textContent="perfil: "+j.perfil;
  canais.innerHTML=j.canais.map(c=>`<li><b>Canal ${c.num} — ${c.nome}</b> (${c.status},
   ${c.espectadores} assistindo) ${c.descricao||""}
   <button onclick="assistir(${c.num})">Assistir</button>
   <button onclick="sair(${c.num})">Sair</button></li>`).join("");
}
async function assistir(n){
  const {s,j}=await api(`/channels/${n}/watch`,{method:"POST"});
  if(s!=200){log.textContent=j.error;return}
  log.textContent=`Canal ${n}: abra no VLC -> ${j.mcast}`;
  const b=new Blob([j.playlist],{type:"audio/x-mpegurl"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);
  a.download=`canal${n}.m3u`;a.click(); listar();
}
async function sair(n){await api(`/channels/${n}/leave`,{method:"POST"});listar()}
setInterval(()=>tok&&listar(),5000);
</script>
EOF
```

---

## 7. Usar

Em qualquer cliente (X, Y, Z, W):

1. Navegador → `https://r1.grupo4.unb/iptv.html` (aceite o certificado).
2. Login (`aluno1/senha1`). A página mostra o **perfil detectado** (WAN115K em X/Y, LAN em Z/W).
3. **Assistir** → baixa `canalN.m3u` → abra no VLC (duplo clique ou `vlc canalN.m3u`).
   Ou direto no VLC: *Mídia → Abrir fluxo de rede* → `udp://@239.20.4.1:5004`.
4. **Sair** ao terminar (libera a WAN para outro canal).

---

## 8. Validar as regras

**WAN115K — um canal por vez** (X e Y no navegador):
1. X assiste canal 1 → ok (recebe `239.20.4.1`, vídeo leve).
2. Y tenta canal 2 → **erro "WAN ocupada: canal 1"**.
3. Y assiste canal 1 → ok, mesmo fluxo multicast de X.
4. Os dois saem → streaming para → agora Y consegue o canal 2.

**LAN — canais simultâneos** (Z e W): Z no canal 1 (`239.10.4.1`, HD) e W no canal 2 (`239.10.4.2`, HD) ao mesmo tempo → ambos funcionam.

**Streaming sob demanda** (em S):

```bash
pgrep -a vlc    # vazio antes de alguém assistir; aparece cvlc ao assistir; some quando todos saem
```

---

## 9. Admin

```bash
# de qualquer máquina — token de admin
TOK=$(curl -sk https://r1.grupo4.unb/api/token -d username=admin -d password=admin123 \
      | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

# usuários conectados, canais ativos, processos VLC
curl -sk -H "Authorization: Bearer $TOK" https://r1.grupo4.unb/api/admin/status | python3 -m json.tool

# cadastrar canal
curl -sk -X POST -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"num":4,"nome":"Esporte","desc":"novo canal"}' https://r1.grupo4.unb/api/channels

# upload de vídeo (converte p/ LD e extrai metadados sozinho)
curl -sk -H "Authorization: Bearer $TOK" \
  -F "file=@novo.mp4" -F "channel=4" https://r1.grupo4.unb/api/videos
```

Ocupação da WAN e fluxos multicast (em R1): `tc -s qdisc show dev ppp0` e `sudo smcroutectl show`.

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| VLC não reproduz | multicast não chega (Fase 1, passo 9) | teste com iperf; contadores em `smcroutectl show` |
| vídeo trava na WAN | bitrate acima de 115 kbps | use a versão `_ld` (passo 2) |
| 401 em tudo | token ausente/expirado (4 h) | pegue outro em `/api/token` |
| perfil errado (X vira LAN) | gateway não repassa o IP do cliente | `ProxyPreserveHost On` no vhost (passo 5) |
| 502/503 no gateway | backend parado | `systemctl status miniiptv`; `journalctl -u miniiptv -e` |
| "canal sem video" | vídeo não está em `/opt/miniiptv/videos` | passo 2 (nomes exatos: filme/aula/show) |
| upload falha | permissão | `sudo chown -R iptv:iptv /opt/miniiptv` |
| cvlc morre na hora | caminho do vídeo errado ou rodando como root | serviço roda como `iptv`; confira o arquivo |
