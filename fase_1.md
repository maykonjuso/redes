# Fase 1 — Infraestrutura de Rede (Mini-IPTV, Grupo 4)

Ubuntu 22.04 em todas as máquinas. Siga os passos na ordem.

**Como usar:** todo comando fica sob um subtítulo `Em S` / `Em R1` / `Em R2` / `Em X` — procure com Ctrl+F ou pelo outline do editor. Cada bloco começa **limpando** o estado anterior, então pode rodar de novo quantas vezes precisar.

## Topologia

```
S (172.16.0.2) ──cabo──> R1 (172.16.0.1)  ......... LAN#1  172.16.0.0/16
                          R1 ──USB-Eth──> rede do Lab (Internet, Z e W)
                          R1 ──serial 115200──> R2  WAN    10.0.0.1 / 10.0.0.2
R2 (192.168.0.1) ──switch──> X, Y  ................ LAN#2  192.168.0.0/24 (DHCP .100-.200)
```

| Máquina | IP | Roda o quê |
|---|---|---|
| S | 172.16.0.2/16 | DNS, e-mail, VLC/backend |
| R1 | 172.16.0.1/16 + Lab (DHCP) + 10.0.0.1 | WEB/gateway, NAT, tc |
| R2 | 192.168.0.1/24 + 10.0.0.2 | DHCP, multicast |
| X, Y | via DHCP | clientes |

**Antes de começar**, em cada máquina descubra o nome da placa de rede:

```bash
ip a
```

Anote o nome (ex.: `enp0s31f6`, `enx00e04c...`). Nos comandos, troque `IFACE` por ele. Em R1 são duas: a nativa (`IFACE`) e o adaptador USB do Lab (`IFACE_LAB`).

## Índice

| Passo | O quê | Onde |
|---|---|---|
| [1](#1-pacotes) | Pacotes | todas |
| [2](#2-cabos) | Cabos | físico |
| [3](#3-ips) | IPs | S, R1, R2 |
| [4](#4-roteamento) | Ativar roteamento | R1, R2 |
| [5](#5-ppp) | WAN PPP 115200 | R2, depois R1 |
| [6](#6-rotas) | Rotas | R1, R2 |
| [7](#7-nat) | NAT (Internet p/ todos) | R1 |
| [8](#8-dhcp) | DHCP | R2 |
| [9](#9-multicast) | Multicast | R1, R2 |
| [10](#10-tc) | Controle de banda (tc) | R1 |
| [11](#11-dns) | DNS | S |
| [12](#12-e-mail) | E-mail seguro | S + X |
| [13](#13-web) | WEB / API Gateway | R1 |
| [14](#14-verificação) | Verificação final | X |

> Alternativa: `sudo bash scripts/setup-rede.sh` faz os passos 3–13 sozinho (inclusive a limpeza). Este é o caminho manual, útil para entender e para a prova oral.

---

## 1. Pacotes

Com cada máquina ainda com Internet (rede do Lab).

### Em S
```bash
sudo apt update && sudo apt install -y bind9 dnsutils postfix dovecot-imapd mailutils iperf
# postfix: escolha "Internet Site", mail name: grupo4.unb
```

### Em R1
```bash
sudo apt update && sudo apt install -y ppp smcroute apache2 iptables-persistent
```

### Em R2
```bash
sudo apt update && sudo apt install -y ppp smcroute isc-dhcp-server
```

### Em X e Y
```bash
sudo apt update && sudo apt install -y vlc thunderbird iperf
```

---

## 2. Cabos

1. Cabo direto entre **S** e **R1** (LAN#1 — só 2 máquinas, não precisa de switch).
2. Adaptador USB-Ethernet de **R1** na rede do Lab (só R1 toca o Lab).
3. **R2**, **X** e **Y** nas portas LAN do roteador-switch. **Desligue o DHCP do roteador** na administração dele antes (quem dá IP é o R2).
4. Cabo serial **cross RS-232** entre R1 e R2.

Confira em cada máquina: `ip a` → a placa conectada aparece com `state UP`.

---

## 3. IPs

### Em S
```bash
# limpar: zera IPs e rota default de tentativas anteriores
sudo ip addr flush dev IFACE scope global
sudo ip route del default 2>/dev/null

# aplicar
sudo ip addr add 172.16.0.2/16 dev IFACE
sudo ip link set IFACE up
sudo ip route add default via 172.16.0.1
```

### Em R1
```bash
# limpar
sudo ip addr flush dev IFACE scope global
sudo dhclient -r IFACE_LAB 2>/dev/null    # libera lease antigo do Lab

# aplicar: placa nativa (LAN#1)
sudo ip addr add 172.16.0.1/16 dev IFACE
sudo ip link set IFACE up
# aplicar: adaptador USB (Lab) pega IP e rota default por DHCP
sudo dhclient -v IFACE_LAB
```

### Em R2
```bash
# limpar
sudo ip addr flush dev IFACE scope global

# aplicar
sudo ip addr add 192.168.0.1/24 dev IFACE
sudo ip link set IFACE up
```

**Testar — em S:** `ping -c 2 172.16.0.1` (R1 responde).
**Testar — em R1:** `ip route | grep default` (deve apontar para o Lab via `IFACE_LAB`) e `curl -sI http://example.com | head -1` (Internet — use curl, o Lab pode bloquear ping externo).

> R1 sem Internet? Veja [Diagnóstico R1](#diagnóstico--r1-sem-internet) no fim.

---

## 4. Roteamento

### Em R1 e em R2 (mesmo comando nos dois)
```bash
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv4.conf.all.mc_forwarding=1
```

Sem isso o roteador não repassa pacotes entre as placas. (Idempotente — não precisa limpar.)

---

## 5. PPP

Enlace WAN serial a 115200 bps. A porta é `/dev/ttyS0` (nativa) ou `/dev/ttyUSB0` (adaptador USB-serial): `ls /dev/ttyS0 /dev/ttyUSB0`.

Cada lado declara seu par `IP_LOCAL:IP_REMOTO` — por isso a ordem inverte entre R2 e R1. Com os dois explícitos, o ppp0 já sobe com IP (sem depender de negociação).

### Em R2 — PRIMEIRO (fica aguardando; deixe o terminal aberto)
```bash
# limpar: mata pppd antigo
sudo pkill pppd; sleep 1

# aplicar (10.0.0.2 = IP do R2, 10.0.0.1 = do R1)
sudo pppd /dev/ttyS0 115200 10.0.0.2:10.0.0.1 noauth local nocrtscts persist nodetach
```

### Em R1 — depois (deixe o terminal aberto também)
```bash
# limpar
sudo pkill pppd; sleep 1

# aplicar (10.0.0.1 = IP do R1, 10.0.0.2 = do R2)
sudo pppd /dev/ttyS0 115200 10.0.0.1:10.0.0.2 noauth local nocrtscts persist nodetach
```

Opções: `115200` = velocidade exigida · `LOCAL:REMOTO` = endereços do enlace · `noauth` = sem senha · `local nocrtscts` = cabo direto · `persist` = reconecta · `nodetach` = log na tela.

**Testar — em R1:** `ip a show ppp0` → `inet 10.0.0.1 peer 10.0.0.2/32`; depois `ping -c 3 10.0.0.2` (demora é normal, link lento).
**Testar — em R2:** `ip a show ppp0` → `inet 10.0.0.2 peer 10.0.0.1/32`.

> ppp0 existe mas **sem IP**? Um dos lados subiu sem declarar `LOCAL:REMOTO` — mate (`sudo pkill pppd`) e rode os comandos acima nos dois lados.

---

## 6. Rotas

`ip route replace` cria ou substitui — já é a limpeza embutida.

### Em R1
```bash
# como chegar na LAN#2 (atrás do R2)
sudo ip route replace 192.168.0.0/24 via 10.0.0.2
```

### Em R2
```bash
# limpar: default antigo (se houver) sai para entrar o novo via WAN
sudo ip route del default 2>/dev/null

# aplicar: volta para a LAN#1 e sai para a Internet via R1
sudo ip route replace 172.16.0.0/16 via 10.0.0.1
sudo ip route add default via 10.0.0.1
```

**Testar — em S:** `ping -c 2 10.0.0.2` (atravessa a WAN) e `ping -c 2 192.168.0.1` (chega na LAN#2).
Se o ping vai e não volta: falta a rota de retorno no outro roteador.

---

## 7. NAT

Só R1 tem Internet; o NAT faz todo mundo sair pelo IP dele.

### Em R1 (troque IFACE e IFACE_LAB)
```bash
# limpar: zera TODAS as regras de firewall/NAT anteriores
sudo iptables -F
sudo iptables -t nat -F

# aplicar: Source NAT (mascara a origem com o IP de R1 no Lab)
sudo iptables -t nat -A POSTROUTING -o IFACE_LAB -j MASQUERADE
sudo iptables -A FORWARD -i IFACE -o IFACE_LAB -j ACCEPT
sudo iptables -A FORWARD -i ppp0 -o IFACE_LAB -j ACCEPT
sudo iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT

# aplicar: Destination NAT (exigido) — R1:8080 no Lab cai no WEB de S
sudo iptables -t nat -A PREROUTING -i IFACE_LAB -p tcp --dport 8080 -j DNAT --to-destination 172.16.0.2:80
sudo iptables -A FORWARD -p tcp -d 172.16.0.2 --dport 80 -j ACCEPT

# salvar para o reboot
sudo netfilter-persistent save
```

**Testar — em S:** `curl -sI http://example.com | head -1` → agora S tem Internet via R1.

---

## 8. DHCP

R2 entrega IP, gateway e DNS para X e Y.

### Em R2 (troque IFACE)
```bash
# limpar: para o serviço antes de reconfigurar
sudo systemctl stop isc-dhcp-server 2>/dev/null

# aplicar: escreve a configuração (sobrescreve a anterior)
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

# escuta só na placa da LAN#2
echo 'INTERFACESv4="IFACE"' | sudo tee /etc/default/isc-dhcp-server
sudo systemctl restart isc-dhcp-server
systemctl is-active isc-dhcp-server    # active
```

**Testar — em X:** plugue o cabo, `ip a` → IP entre 192.168.0.100–200. Depois `ping -c 2 172.16.0.2` (S pela WAN) e `curl -sI http://example.com | head -1` (Internet).

> IP fora da faixa? O DHCP do roteador-switch ainda está ligado — desative-o e reconecte o cabo.

---

## 9. Multicast

Grupo 4: `239.10.4.x` = LAN rápida (Z/W) · `239.20.4.x` = WAN lenta (X/Y).

### Em R1 (troque IFACE e IFACE_LAB)
```bash
# limpar: reinicia o smcroute (descarta rotas antigas)
sudo systemctl restart smcroute
sudo systemctl enable smcroute 2>/dev/null

# aplicar
sudo smcroutectl add IFACE 239.10.4.0/24 IFACE_LAB   # canais HD -> Z/W no Lab
sudo smcroutectl add IFACE 239.20.4.0/24 ppp0        # canais LD -> LAN#2 pela WAN
```

### Em R2 (troque IFACE)
```bash
# limpar
sudo systemctl restart smcroute
sudo systemctl enable smcroute 2>/dev/null

# aplicar
sudo smcroutectl add ppp0 239.20.4.0/24 IFACE
sudo smcroutectl join IFACE 239.20.4.1
```

**Testar (sem VLC) — em X:** `iperf -s -u -B 239.20.4.1 -i 1` (deixe rodando).
**— em S:** `iperf -c 239.20.4.1 -u -T 5 -t 15 -b 80k`.
**— em R1 e R2:** `sudo smcroutectl show` (contadores subindo).

---

## 10. tc

Limita a WAN a 115200 bps (demonstra a API de traffic control, exigida no projeto).

### Em R1
```bash
# limpar: remove qdisc anterior (se houver)
sudo tc qdisc del dev ppp0 root 2>/dev/null

# aplicar
sudo tc qdisc add dev ppp0 root tbf rate 115200bit burst 4kb latency 400ms
tc -s qdisc show dev ppp0    # confere
```

`tbf` = balde de tokens · `rate` = teto de banda · `burst` = rajada · `latency` = fila máxima.

**Testar:** `iperf -s` em X, `iperf -c 192.168.0.1xx` em S → ~115 kbps.

---

## 11. DNS

S resolve os nomes da intranet e repassa o resto para a Internet.

### Em S
```bash
# limpar + aplicar: sobrescreve os 4 arquivos por completo (rodar de novo é seguro)

# zonas declaradas
sudo tee /etc/bind/named.conf.local >/dev/null <<'EOF'
zone "grupo4.unb" { type master; file "/etc/bind/db.grupo4.unb"; };
zone "16.172.in-addr.arpa" { type master; file "/etc/bind/db.172.16"; };
EOF

# zona direta (nome -> IP)
sudo tee /etc/bind/db.grupo4.unb >/dev/null <<'EOF'
$TTL 604800
@   IN  SOA s.grupo4.unb. admin.grupo4.unb. ( 2 604800 86400 2419200 604800 )
@   IN  NS  s.grupo4.unb.
s   IN  A   172.16.0.2
r1  IN  A   172.16.0.1
r2  IN  A   192.168.0.1
EOF

# zona reversa (IP -> nome)
sudo tee /etc/bind/db.172.16 >/dev/null <<'EOF'
$TTL 604800
@   IN  SOA s.grupo4.unb. admin.grupo4.unb. ( 2 604800 86400 2419200 604800 )
@   IN  NS  s.grupo4.unb.
2.0 IN  PTR s.grupo4.unb.
1.0 IN  PTR r1.grupo4.unb.
EOF

# consultas da intranet + repasse de nomes externos ao 8.8.8.8
sudo tee /etc/bind/named.conf.options >/dev/null <<'EOF'
options {
    directory "/var/cache/bind";
    allow-query { 172.16.0.0/16; 192.168.0.0/24; 10.0.0.0/30; localhost; };
    recursion yes;
    forwarders { 8.8.8.8; };
    dnssec-validation no;
    listen-on-v6 { any; };
};
EOF

# valida a sintaxe e reinicia
sudo named-checkconf && sudo named-checkzone grupo4.unb /etc/bind/db.grupo4.unb
sudo systemctl restart bind9
```

**Testar — de qualquer máquina:**
```bash
nslookup s.grupo4.unb 172.16.0.2      # 172.16.0.2
nslookup 172.16.0.1 172.16.0.2        # r1.grupo4.unb (reverso)
nslookup google.com 172.16.0.2        # nome externo (forwarder)
```

---

## 12. E-mail

SMTP (postfix) + IMAP (dovecot) com TLS em S, demonstrado no Thunderbird.

### Em S
```bash
# certificado TLS (sobrescreve o anterior se existir)
sudo openssl req -new -x509 -days 365 -nodes -subj "/CN=s.grupo4.unb" \
  -out /etc/ssl/certs/mail.pem -keyout /etc/ssl/private/mail.key

# postfix (postconf substitui os valores — idempotente)
sudo postconf -e "myhostname = s.grupo4.unb" \
             -e "mydomain = grupo4.unb" \
             -e "mydestination = \$myhostname, grupo4.unb, localhost" \
             -e "mynetworks = 127.0.0.0/8 172.16.0.0/16 192.168.0.0/24 10.0.0.0/30" \
             -e "smtpd_tls_cert_file=/etc/ssl/certs/mail.pem" \
             -e "smtpd_tls_key_file=/etc/ssl/private/mail.key" \
             -e "smtpd_tls_security_level=may"
sudo systemctl restart postfix

# dovecot (IMAP + TLS)
sudo sed -i 's|^ssl_cert =.*|ssl_cert = </etc/ssl/certs/mail.pem|;
             s|^ssl_key =.*|ssl_key = </etc/ssl/private/mail.key|;
             s|^ssl =.*|ssl = yes|' /etc/dovecot/conf.d/10-ssl.conf
sudo systemctl restart dovecot

# caixas de e-mail (só cria se não existir)
id aluno1 2>/dev/null || sudo adduser aluno1
id aluno2 2>/dev/null || sudo adduser aluno2
```

**Testar — em S:**
```bash
echo "teste" | mail -s "oi" aluno2@grupo4.unb
sudo tail -n 5 /var/log/mail.log     # status=sent
```

### Em X (Thunderbird)
Conta `aluno1@grupo4.unb` → configuração manual → IMAP `s.grupo4.unb` porta 143 STARTTLS · SMTP `s.grupo4.unb` porta 25 STARTTLS · usuário `aluno1`. Aceite o certificado. Envie de aluno1 para aluno2 e veja chegar.

---

## 13. WEB

Apache em R1: página da intranet + proxy reverso (API Gateway) para o backend em S.

### Em R1
```bash
# limpar: desativa site anterior e o default
sudo a2dissite miniiptv 000-default 2>/dev/null

# aplicar
sudo a2enmod proxy proxy_http ssl
echo '<h1>Intranet Grupo 4 - Mini-IPTV</h1>' | sudo tee /var/www/html/index.html

sudo tee /etc/apache2/sites-available/miniiptv.conf >/dev/null <<'EOF'
<VirtualHost *:80>
    ServerName r1.grupo4.unb
    DocumentRoot /var/www/html
    ProxyPreserveHost On
    ProxyPass        /api http://172.16.0.2:8000/api
    ProxyPassReverse /api http://172.16.0.2:8000/api
</VirtualHost>
EOF
sudo a2ensite miniiptv
sudo systemctl restart apache2
systemctl is-active apache2    # active
```

**Testar — em X:** `curl http://r1.grupo4.unb/` → mostra a página. (`/api` dá 503 até o backend da Fase 2 subir — normal.)

---

## 14. Verificação

### Em X (tudo de uma vez)
```bash
ping -c 2 192.168.0.1                 # R2 (gateway local)
ping -c 2 10.0.0.1                    # R1 pela WAN
ping -c 2 172.16.0.2                  # S (fim-a-fim)
curl -sI http://example.com | head -1 # Internet (NAT)
nslookup s.grupo4.unb                 # DNS
curl http://r1.grupo4.unb/            # WEB
```

Mais o multicast (passo 9), a banda ~115 kbps (passo 10) e o e-mail no Thunderbird (passo 12). Tudo respondendo = Fase 1 concluída. Guarde as saídas (`comando | tee captura.txt`) para o relatório.

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| Máquinas na mesma LAN não se pingam | cabo, placa DOWN ou IP errado | `ip a`; refaça o passo 3 na placa certa |
| IP sumiu | reboot (o `ip addr` não persiste) | rode o passo 3 de novo (ou Anexo A) |
| ppp0 não sobe | porta errada ou cabo não é cross | `dmesg \| grep tty`; cabo null-modem |
| ppp0 sobe **sem IP** | um lado sem `LOCAL:REMOTO` no pppd | passo 5: R2 usa `10.0.0.2:10.0.0.1`, R1 usa `10.0.0.1:10.0.0.2` |
| ping vai e não volta | falta rota de retorno | passo 6 no outro roteador |
| roteador não repassa | esqueceu o passo 4 | `sysctl -w net.ipv4.ip_forward=1` |
| só R1 tem Internet | falta NAT | passo 7 |
| X/Y sem IP ou IP errado | DHCP do roteador-switch ligado, ou `INTERFACESv4` errado | desligue-o; confira o passo 8 |
| multicast não chega | rota smcroute faltando ou TTL 1 no emissor | passo 9; emissor com `--ttl 16` |
| DNS REFUSED | rede fora do `allow-query` | passo 11 |
| e-mail Relay denied | rede fora do `mynetworks` | passo 12 |

## Diagnóstico — R1 sem Internet

Rode em R1, na ordem; pare no primeiro que falhar:

```bash
# 1) O adaptador do Lab tem IP?
ip -brief addr                        # IFACE_LAB precisa ter um IP
#    não tem -> sudo dhclient -v IFACE_LAB  ("No DHCPOFFERS" = cabo/tomada sem link)

# 2) A rota default aponta para o Lab?
ip route | grep default               # "default via <gw> dev IFACE_LAB"
#    não tem      -> sudo dhclient -v IFACE_LAB  (ou: sudo ip route add default via GW dev IFACE_LAB)
#    aponta errado-> sudo ip route del default && sudo dhclient IFACE_LAB

# 3) O gateway do Lab responde?
ping -c 2 GW_DO_LAB                   # o IP do "via" acima
#    gateway ok mas 8.8.8.8 não -> o Lab bloqueia ping externo; teste com:
curl -sI http://example.com | head -1 # HTTP/1.1 200 OK = Internet FUNCIONANDO

# 4) Conflito de faixa: o IP que o Lab deu começa com 172.16?
ip -brief addr | grep 172.16
#    Se o Lab também usa 172.16.x.x, a rota /16 da LAN#1 engole o gateway.
#    Correção: use /24 na LAN#1 (S, R1 e a rota de volta em R2):
#      R1: sudo ip addr del 172.16.0.1/16 dev IFACE; sudo ip addr add 172.16.0.1/24 dev IFACE
#      S : sudo ip addr del 172.16.0.2/16 dev IFACE; sudo ip addr add 172.16.0.2/24 dev IFACE
#           e refaça a default: sudo ip route replace default via 172.16.0.1
#      R2: sudo ip route del 172.16.0.0/16 2>/dev/null; sudo ip route replace 172.16.0.0/24 via 10.0.0.1
```

---

## Anexo A — fixar os IPs (opcional)

Os comandos `ip addr` do passo 3 somem no reboot. Para fixar no Ubuntu Desktop (NetworkManager):

### Em S
```bash
sudo nmcli con delete frc 2>/dev/null   # limpar perfil anterior
sudo nmcli con add type ethernet ifname IFACE con-name frc ipv4.method manual \
     ipv4.addresses 172.16.0.2/16 ipv4.gateway 172.16.0.1 ipv4.dns 172.16.0.2
sudo nmcli con up frc
```

### Em R1
```bash
sudo nmcli con delete frc 2>/dev/null
sudo nmcli con add type ethernet ifname IFACE con-name frc ipv4.method manual \
     ipv4.addresses 172.16.0.1/16
sudo nmcli con up frc
# o adaptador do Lab o NetworkManager já cuida com DHCP
```

### Em R2
```bash
sudo nmcli con delete frc 2>/dev/null
sudo nmcli con add type ethernet ifname IFACE con-name frc ipv4.method manual \
     ipv4.addresses 192.168.0.1/24
sudo nmcli con up frc
```

As rotas (passos 4 e 6) e regras (9 e 10) também são voláteis — no dia da apresentação, rode os passos 4–6 e 9–10 após ligar as máquinas (ou use `scripts/setup-rede.sh`).
