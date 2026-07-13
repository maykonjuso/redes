# Tutorial — Fase 1: Infraestrutura Mini-IPTV (Ubuntu 22.04, Grupo 4)

Runbook direto: siga a ordem, rode os comandos na máquina indicada, valide e siga.

## Topologia e endereços

```mermaid
graph TB
    INET(("Internet"))
    subgraph LAB["Rede do Laboratório (DHCP do Lab)"]
        Z["Z — cliente LAN"]
        W["W — cliente LAN"]
    end
    subgraph LAN1["LAN #1 — 172.16.0.0/16"]
        S["S — 172.16.0.2<br/>DNS · SMTP · VLC Server · backend"]
        SW1[["switch"]]
        R1["R1 — 172.16.0.1<br/>WEB/API Gateway · SNAT/DNAT"]
    end
    subgraph WAN["WAN — enlace PPP serial 115200 bps"]
        direction LR
        P1("ppp0<br/>10.0.0.1") ---|"cabo serial cross RS-232"| P2("ppp0<br/>10.0.0.2")
    end
    subgraph LAN2["LAN #2 — 192.168.0.0/24"]
        R2["R2 — 192.168.0.1<br/>DHCP Server"]
        SW2[["switch"]]
        X["X — DHCP .100–.200"]
        Y["Y — DHCP .100–.200"]
    end
    INET --- LAB
    LAB ---|"USB→Ethernet (único acesso externo)"| R1
    S --- SW1 --- R1
    R1 --- P1
    P2 --- R2
    R2 --- SW2
    SW2 --- X
    SW2 --- Y
```

- DNS/SMTP/VLC/backend em **S** · WEB/API Gateway/NAT em **R1** · DHCP em **R2**
- Multicast: `239.10.4.x` (LAN/Z-W) e `239.20.4.x` (WAN115K/X-Y)
- Domínio: `grupo4.unb`

**Fluxos multicast (Grupo 4):**

```mermaid
graph LR
    S["S<br/>VLC Server"]
    R1["R1"]
    R2["R2"]
    ZW["Z, W<br/>(Lab)"]
    XY["X, Y<br/>(LAN #2)"]
    S -->|"239.10.4.c (HD)"| R1 -->|"USB→Eth"| ZW
    S -->|"239.20.4.c (LD)"| R1 -->|"ppp0 · 115200 bps"| R2 --> XY
```

> **Antes de tudo:** descubra o nome real das interfaces em cada máquina com `ip -brief link` e substitua nos comandos:
> - `LAN1` = interface Ethernet de S e de R1 no switch da LAN#1 (ex.: `enp2s0`)
> - `LAB` = adaptador USB→Ethernet de R1 (ex.: `enx00e04c001122`)
> - `LAN2` = interface Ethernet de R2/X/Y (ex.: `enp3s0`)
> - `SERIAL` = porta serial (`/dev/ttyS0` nativa ou `/dev/ttyUSB0` adaptador)

---

## 0. Instalar pacotes — 📍 cada bloco na máquina indicada no comentário

```bash
# TODAS
sudo apt update

# S
sudo apt install -y bind9 bind9utils dnsutils postfix dovecot-imapd mailutils iperf
#   postfix: escolha "Internet Site", mail name: grupo4.unb

# R1
sudo apt install -y ppp smcroute apache2 iptables iptables-persistent isc-dhcp-client

# R2
sudo apt install -y ppp smcroute isc-dhcp-server

# X e Y
sudo apt install -y vlc thunderbird iperf
```

---

## 1. Cabeamento — 📍 físico (todas as máquinas)

1. S e R1 (`LAN1`) no switch da LAN#1.
2. Adaptador USB→Ethernet de R1 na rede do Lab (só R1 toca o Lab!).
3. R2, X e Y no switch da LAN#2.
4. Cabo serial **cross RS-232** entre R1 e R2.

Valide em cada máquina: `ip -brief link` → interfaces `UP`.

---

## 2. IPs estáticos — 📍 em S, em R1 e em R2 (cada bloco na sua máquina)

### Em S
```bash
sudo tee /etc/netplan/01-frc.yaml >/dev/null <<'EOF'
network:
  version: 2
  renderer: networkd
  ethernets:
    LAN1:
      addresses: [172.16.0.2/16]
      nameservers: {addresses: [172.16.0.2]}
      routes: [{to: default, via: 172.16.0.1}]
EOF
sudo chmod 600 /etc/netplan/01-frc.yaml && sudo netplan apply
```

### Em R1
```bash
sudo tee /etc/netplan/01-frc.yaml >/dev/null <<'EOF'
network:
  version: 2
  renderer: networkd
  ethernets:
    LAN1:
      addresses: [172.16.0.1/16]
    LAB:
      dhcp4: true
EOF
sudo chmod 600 /etc/netplan/01-frc.yaml && sudo netplan apply
```

### Em R2
```bash
sudo tee /etc/netplan/01-frc.yaml >/dev/null <<'EOF'
network:
  version: 2
  renderer: networkd
  ethernets:
    LAN2:
      addresses: [192.168.0.1/24]
EOF
sudo chmod 600 /etc/netplan/01-frc.yaml && sudo netplan apply
```

**Validar:**
```bash
ip -brief addr                 # IPs corretos
ping -c 2 172.16.0.1           # em S: alcança R1
ping -c 2 8.8.8.8              # em R1: Internet via Lab
```

---

## 3. Habilitar roteamento — 📍 em R1 **e** em R2 (rodar nos dois)

```bash
sudo tee /etc/sysctl.d/99-router.conf >/dev/null <<'EOF'
net.ipv4.ip_forward=1
net.ipv4.conf.all.mc_forwarding=1
EOF
sudo sysctl --system | grep -E 'ip_forward|mc_forwarding'
```

---

## 4. Enlace WAN PPP a 115200 bps — 📍 em R2 primeiro, depois em R1

### Em R2 (rode primeiro — fica aguardando)
```bash
sudo pppd SERIAL 115200 noauth local nocrtscts persist nodetach
```

### Em R1 (outro terminal)
```bash
sudo pppd SERIAL 115200 10.0.0.1:10.0.0.2 noauth local nocrtscts persist nodetach
```

**Validar (em R1):**
```bash
ip -brief addr show ppp0       # 10.0.0.1 peer 10.0.0.2
ping -c 3 10.0.0.2             # RTT alto é normal (enlace lento)
```

> Deixe os `pppd` rodando (use `tmux` ou outro terminal). Parar: `Ctrl+C` ou `sudo pkill pppd`.
> Não sobe? Confira o device (`dmesg | grep tty`) e se o cabo é cross/null-modem.

---

## 5. Rotas unicast — 📍 em R1 e em R2 (validação em S)

```bash
# R1: rota para a LAN#2
sudo ip route add 192.168.0.0/24 via 10.0.0.2

# R2: rota de volta para a LAN#1 + saída para Internet via R1
sudo ip route add 172.16.0.0/16 via 10.0.0.1
sudo ip route add default via 10.0.0.1
```

**Validar (fim-a-fim):**
```bash
# Em S:
ping -c 2 10.0.0.2 && ping -c 2 192.168.0.1
```

---

## 6. NAT e firewall — 📍 só em R1

```bash
# Source NAT: todo mundo sai para a Internet com o IP de R1
sudo iptables -t nat -A POSTROUTING -o LAB -j MASQUERADE

# Liberar encaminhamento
sudo iptables -A FORWARD -i LAN1 -o LAB -j ACCEPT
sudo iptables -A FORWARD -i ppp0 -o LAB -j ACCEPT
sudo iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT

# Destination NAT (exemplo p/ demonstração): Lab:8080 -> S:80
sudo iptables -t nat -A PREROUTING -i LAB -p tcp --dport 8080 -j DNAT --to-destination 172.16.0.2:80
sudo iptables -A FORWARD -p tcp -d 172.16.0.2 --dport 80 -j ACCEPT

# Persistir
sudo netfilter-persistent save
```

**Validar:** em S (ou X depois do passo 7): `ping -c 2 8.8.8.8`.

---

## 7. DHCP — 📍 só em R2 (validação em X e Y)

```bash
sudo tee /etc/dhcp/dhcpd.conf >/dev/null <<'EOF'
option domain-name "grupo4.unb";
option domain-name-servers 172.16.0.2;
default-lease-time 600;
max-lease-time 7200;
authoritative;

subnet 192.168.0.0 netmask 255.255.255.0 {
    range 192.168.0.100 192.168.0.200;
    option routers 192.168.0.1;
    option broadcast-address 192.168.0.255;
}
EOF

echo 'INTERFACESv4="LAN2"' | sudo tee /etc/default/isc-dhcp-server
sudo systemctl restart isc-dhcp-server && sudo systemctl enable isc-dhcp-server
```

**Validar em X e Y** (Desktop pega sozinho ao plugar; para forçar):
```bash
ip -brief addr        # deve ter 192.168.0.10x/24
ping -c 2 172.16.0.2  # alcança S através da WAN
ping -c 2 8.8.8.8     # Internet via NAT de R1
```

---

## 8. Roteamento multicast (smcroute) — 📍 em R1 e em R2 (teste: S envia, X recebe)

### Em R1
```bash
sudo systemctl enable --now smcroute
sudo smcroutectl add LAN1 239.10.4.0/24 LAB    # perfil LAN  -> Z/W no Lab
sudo smcroutectl add LAN1 239.20.4.0/24 ppp0   # perfil WAN  -> LAN#2 via WAN
```

### Em R2
```bash
sudo systemctl enable --now smcroute
sudo smcroutectl add ppp0 239.20.4.0/24 LAN2
sudo smcroutectl join LAN2 239.20.4.1
```

**Validar (teste sem VLC):**
```bash
# Em X:
iperf -s -u -B 239.20.4.1 -i 1
# Em S:
iperf -c 239.20.4.1 -u -T 5 -t 15 -b 80k -i 1
# Em R1/R2: contadores subindo
sudo smcroutectl show
```

> Persistir: escreva as rotas em `/etc/smcroute.conf` (`mroute from LAN1 group 239.20.4.0/24 to ppp0`) e reinicie o serviço.

---

## 9. Controle de banda com tc — 📍 só em R1 (interface ppp0)

```bash
# Limitar a 115200 bps no sentido S -> X/Y (interface ppp0 de R1)
sudo tc qdisc add dev ppp0 root tbf rate 115200bit burst 4kb latency 400ms
tc -s qdisc show dev ppp0
```

**Validar:** `iperf -s` em X, `iperf -c <ip-de-X>` em S → taxa ~115 kbps.
Remover: `sudo tc qdisc del dev ppp0 root`.

---

## 10. DNS (bind9) — 📍 só em S

```bash
# Zonas
sudo tee -a /etc/bind/named.conf.local >/dev/null <<'EOF'
zone "grupo4.unb" { type master; file "/etc/bind/db.grupo4.unb"; };
zone "16.172.in-addr.arpa" { type master; file "/etc/bind/db.172.16"; };
EOF

sudo tee /etc/bind/db.grupo4.unb >/dev/null <<'EOF'
$TTL 604800
@   IN  SOA s.grupo4.unb. admin.grupo4.unb. ( 2 604800 86400 2419200 604800 )
@   IN  NS  s.grupo4.unb.
s   IN  A   172.16.0.2
r1  IN  A   172.16.0.1
r2  IN  A   192.168.0.1
EOF

sudo tee /etc/bind/db.172.16 >/dev/null <<'EOF'
$TTL 604800
@   IN  SOA s.grupo4.unb. admin.grupo4.unb. ( 2 604800 86400 2419200 604800 )
@   IN  NS  s.grupo4.unb.
2.0 IN  PTR s.grupo4.unb.
1.0 IN  PTR r1.grupo4.unb.
EOF

# Recursão + forwarders: edite /etc/bind/named.conf.options e, dentro de options { }, adicione:
#   allow-query { 172.16.0.0/16; 192.168.0.0/24; 10.0.0.0/30; localhost; };
#   recursion yes;
#   forwarders { 8.8.8.8; };
sudo nano /etc/bind/named.conf.options

# Checar e reiniciar
sudo named-checkconf && sudo named-checkzone grupo4.unb /etc/bind/db.grupo4.unb
sudo systemctl restart bind9
```

**Validar (de qualquer máquina):**
```bash
nslookup s.grupo4.unb 172.16.0.2     # 172.16.0.2
nslookup 172.16.0.1 172.16.0.2       # r1.grupo4.unb (reverso)
nslookup google.com 172.16.0.2       # externo via forwarder
```

---

## 11. SMTP/IMAP com TLS — 📍 servidor em S · Thunderbird em X

```bash
# Certificado autoassinado
sudo openssl req -new -x509 -days 365 -nodes -subj "/CN=s.grupo4.unb" \
  -out /etc/ssl/certs/mail.pem -keyout /etc/ssl/private/mail.key

# Postfix
sudo postconf -e "myhostname = s.grupo4.unb" \
             -e "mydomain = grupo4.unb" \
             -e "mydestination = \$myhostname, grupo4.unb, localhost" \
             -e "mynetworks = 127.0.0.0/8 172.16.0.0/16 192.168.0.0/24 10.0.0.0/30" \
             -e "smtpd_tls_cert_file=/etc/ssl/certs/mail.pem" \
             -e "smtpd_tls_key_file=/etc/ssl/private/mail.key" \
             -e "smtpd_tls_security_level=may"
sudo systemctl restart postfix

# Dovecot (IMAP + TLS)
sudo sed -i 's|^ssl_cert =.*|ssl_cert = </etc/ssl/certs/mail.pem|;
             s|^ssl_key =.*|ssl_key = </etc/ssl/private/mail.key|;
             s|^ssl =.*|ssl = yes|' /etc/dovecot/conf.d/10-ssl.conf
sudo systemctl restart dovecot

# Caixas de teste
sudo adduser aluno1
sudo adduser aluno2
```

**Thunderbird (em X):** conta `aluno1@grupo4.unb` → configuração manual:
- IMAP `s.grupo4.unb` porta 143 **STARTTLS** · SMTP `s.grupo4.unb` porta 25 **STARTTLS** · usuário `aluno1`
- Aceite a exceção do certificado autoassinado.

**Validar:**
```bash
# Em S:
echo "teste" | mail -s "oi" aluno2@grupo4.unb
sudo tail -n 5 /var/log/mail.log     # status=sent
```
E no Thunderbird: enviar de aluno1 → aluno2 e ver chegar.

---

## 12. WEB + API Gateway (Apache proxy reverso) — 📍 só em R1 (validação em X)

```bash
sudo a2enmod proxy proxy_http headers ssl
echo '<h1>Intranet Grupo 4 - Mini-IPTV</h1>' | sudo tee /var/www/html/index.html

# Proxy reverso: dentro do <VirtualHost *:80> de /etc/apache2/sites-available/000-default.conf
sudo sed -i 's|</VirtualHost>|\tProxyPreserveHost On\n\tProxyPass /api http://172.16.0.2:80/api\n\tProxyPassReverse /api http://172.16.0.2:80/api\n</VirtualHost>|' \
  /etc/apache2/sites-available/000-default.conf

sudo systemctl restart apache2
```

**Validar (de X):**
```bash
curl http://r1.grupo4.unb/        # página da intranet
curl -I http://r1.grupo4.unb/api  # 503 é normal até o backend (Fase 2) existir
```

---

## 13. Bateria final de verificação — 📍 rodar em X

```bash
# De X (cliente da LAN#2):
ping -c 2 192.168.0.1 && ping -c 2 10.0.0.1 && ping -c 2 172.16.0.2 && ping -c 2 8.8.8.8
nslookup s.grupo4.unb
curl -s http://r1.grupo4.unb/ | head -1
# Multicast: iperf (passo 8) recebendo em X
# Banda: iperf unicast S->X limitado a ~115 kbps
```

Tudo ok → Fase 1 concluída. Guarde as saídas (`comando | tee ~/projeto-frc/capturas/arquivo.txt`) como evidência para o relatório e o vídeo.

---

## Problemas comuns

| Sintoma | Causa provável | Correção |
|---|---|---|
| ppp0 não sobe | device errado / cabo não é cross | `dmesg \| grep tty`; usar cabo null-modem |
| ping cruza WAN mas não volta | falta rota de retorno | passo 5 |
| roteador não repassa | `ip_forward=0` | passo 3 |
| só R1 tem Internet | falta MASQUERADE/FORWARD | passo 6 |
| X/Y sem IP | `INTERFACESv4` errado ou R2 sem IP fixo | passos 2 e 7 |
| multicast não chega | rota smcroute ausente / TTL=1 no emissor | passo 8; emissor com TTL ≥ 16 |
| DNS REFUSED | `allow-query` não inclui a rede | passo 10 |
| e-mail "Relay access denied" | rede fora de `mynetworks` | passo 11 |
| `netplan apply` reclama | TAB no YAML ou permissão | usar espaços; `chmod 600` |
