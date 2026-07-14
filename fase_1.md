# Fase 1 — Infraestrutura de Rede (Mini-IPTV, Grupo 4)

Ubuntu 22.04 em todas as máquinas. Siga os passos na ordem. Cada bloco diz em qual máquina rodar.

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

**Antes de começar**, descubra o nome da placa de rede em cada máquina:

```bash
ip a
```

Anote o nome (ex.: `enp0s31f6`, `enx00e04c...`). Nos comandos abaixo, troque `IFACE` por esse nome. Em R1 são duas placas: a nativa (`IFACE`) e o adaptador USB (`IFACE_LAB`).

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

> Alternativa: `sudo bash scripts/setup-rede.sh` faz os passos 3–13 sozinho. Este tutorial é o caminho manual, útil para entender e para a prova oral.

---

## 1. Pacotes

Com cada máquina ainda com Internet (rede do Lab):

```bash
# S
sudo apt update && sudo apt install -y bind9 dnsutils postfix dovecot-imapd mailutils iperf
# (postfix: escolha "Internet Site", mail name: grupo4.unb)
```

```bash
# R1
sudo apt update && sudo apt install -y ppp smcroute apache2 iptables-persistent
```

```bash
# R2
sudo apt update && sudo apt install -y ppp smcroute isc-dhcp-server
```

```bash
# X e Y
sudo apt update && sudo apt install -y vlc thunderbird iperf
```

---

## 2. Cabos

1. Cabo direto entre **S** e **R1** (LAN#1 — só 2 máquinas, não precisa de switch).
2. Adaptador USB-Ethernet de **R1** na rede do Lab (só R1 toca o Lab).
3. **R2**, **X** e **Y** nas portas LAN do roteador-switch. **Desligue o DHCP do roteador** na administração dele antes (quem dá IP é o R2).
4. Cabo serial **cross RS-232** entre R1 e R2.

Confira: `ip a` → a placa conectada aparece com `state UP`.

---

## 3. IPs

Comandos diretos — funcionam na hora. (Se reiniciar a máquina, rode de novo; para fixar, veja o Anexo A.)

```bash
# S
sudo ip addr add 172.16.0.2/16 dev IFACE
sudo ip link set IFACE up
sudo ip route add default via 172.16.0.1
```

```bash
# R1 — placa nativa (LAN#1)
sudo ip addr add 172.16.0.1/16 dev IFACE
sudo ip link set IFACE up
# R1 — adaptador USB (Lab): pega IP por DHCP
sudo dhclient IFACE_LAB
```

```bash
# R2
sudo ip addr add 192.168.0.1/24 dev IFACE
sudo ip link set IFACE up
```

**Testar:**

```bash
# em S:
ping -c 2 172.16.0.1     # R1 responde
# em R1:
ping -c 2 8.8.8.8        # Internet via Lab
```

---

## 4. Roteamento

R1 e R2 precisam repassar pacotes entre interfaces:

```bash
# R1 e R2 (mesmo comando nos dois)
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv4.conf.all.mc_forwarding=1
```

---

## 5. PPP

Enlace WAN serial a 115200 bps. A porta serial é `/dev/ttyS0` (nativa) ou `/dev/ttyUSB0` (adaptador USB-serial) — veja com `ls /dev/ttyS0 /dev/ttyUSB0`.

```bash
# R2 PRIMEIRO (fica aguardando; deixe este terminal aberto)
sudo pppd /dev/ttyS0 115200 noauth local nocrtscts persist nodetach
```

```bash
# R1 depois (deixe este terminal aberto também)
sudo pppd /dev/ttyS0 115200 10.0.0.1:10.0.0.2 noauth local nocrtscts persist nodetach
```

O que cada opção faz: `115200` = velocidade exigida; `10.0.0.1:10.0.0.2` = IP local:remoto (só no R1); `noauth` = sem senha; `local nocrtscts` = cabo direto sem controle de modem; `persist` = reconecta se cair; `nodetach` = mostra o log na tela.

**Testar (em R1):**

```bash
ip a show ppp0           # deve ter 10.0.0.1
ping -c 3 10.0.0.2       # R2 responde (demora é normal: link lento)
```

Parar o PPP: `Ctrl+C` ou `sudo pkill pppd`. Não sobe? Confira a porta (`dmesg | grep tty`) e se o cabo é cross/null-modem.

---

## 6. Rotas

Cada lado precisa saber chegar na rede do outro:

```bash
# R1: como chegar na LAN#2
sudo ip route add 192.168.0.0/24 via 10.0.0.2
```

```bash
# R2: como voltar para a LAN#1 e sair para a Internet
sudo ip route add 172.16.0.0/16 via 10.0.0.1
sudo ip route add default via 10.0.0.1
```

**Testar (em S):**

```bash
ping -c 2 10.0.0.2       # atravessa a WAN
ping -c 2 192.168.0.1    # chega na LAN#2
```

Regra de ouro: se o ping vai e não volta, falta a rota de retorno do outro lado.

---

## 7. NAT

Só R1 tem Internet. O NAT faz todo mundo sair pelo IP dele:

```bash
# R1 (troque IFACE e IFACE_LAB pelos nomes reais)
sudo iptables -t nat -A POSTROUTING -o IFACE_LAB -j MASQUERADE
sudo iptables -A FORWARD -i IFACE -o IFACE_LAB -j ACCEPT
sudo iptables -A FORWARD -i ppp0 -o IFACE_LAB -j ACCEPT
sudo iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT

# DNAT (exigido no projeto): quem acessa R1:8080 pelo Lab cai no WEB de S
sudo iptables -t nat -A PREROUTING -i IFACE_LAB -p tcp --dport 8080 -j DNAT --to-destination 172.16.0.2:80
sudo iptables -A FORWARD -p tcp -d 172.16.0.2 --dport 80 -j ACCEPT

sudo netfilter-persistent save   # guarda as regras p/ o reboot
```

**Testar (em S):** `ping -c 2 8.8.8.8` — agora S tem Internet via R1.

---

## 8. DHCP

R2 entrega IP, gateway e DNS para X e Y:

```bash
# R2 — escreve a configuração
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

# escuta só na placa da LAN#2 (troque IFACE)
echo 'INTERFACESv4="IFACE"' | sudo tee /etc/default/isc-dhcp-server
sudo systemctl restart isc-dhcp-server
```

**Testar (em X):** plugue o cabo e rode `ip a` → IP entre 192.168.0.100 e .200. Depois `ping -c 2 172.16.0.2` (S, através da WAN) e `ping -c 2 8.8.8.8` (Internet).

> IP fora da faixa .100-.200? O DHCP do roteador-switch ainda está ligado — desative-o.

---

## 9. Multicast

Rotas estáticas de multicast (Grupo 4: `239.10.4.x` = LAN rápida, `239.20.4.x` = WAN lenta):

```bash
# R1 (troque IFACE = placa da LAN#1, IFACE_LAB = adaptador USB)
sudo systemctl enable --now smcroute
sudo smcroutectl add IFACE 239.10.4.0/24 IFACE_LAB   # canais HD -> Z/W no Lab
sudo smcroutectl add IFACE 239.20.4.0/24 ppp0        # canais LD -> LAN#2 pela WAN
```

```bash
# R2 (troque IFACE = placa da LAN#2)
sudo systemctl enable --now smcroute
sudo smcroutectl add ppp0 239.20.4.0/24 IFACE
sudo smcroutectl join IFACE 239.20.4.1
```

**Testar sem VLC** (S transmite, X recebe):

```bash
# em X (deixe rodando):
iperf -s -u -B 239.20.4.1 -i 1
# em S:
iperf -c 239.20.4.1 -u -T 5 -t 15 -b 80k
# em R1 e R2, os contadores devem subir:
sudo smcroutectl show
```

---

## 10. tc

Limita a WAN a 115200 bps (exigência do projeto — demonstra a API de traffic control):

```bash
# R1
sudo tc qdisc add dev ppp0 root tbf rate 115200bit burst 4kb latency 400ms
tc -s qdisc show dev ppp0    # confere
```

`tbf` = balde de tokens; `rate` = teto de banda; `burst` = rajada permitida; `latency` = tempo máximo na fila.

**Testar:** `iperf -s` em X, `iperf -c 192.168.0.1xx` em S → ~115 kbps. Remover: `sudo tc qdisc del dev ppp0 root`.

---

## 11. DNS

S resolve os nomes da intranet e repassa o resto para a Internet:

```bash
# S — declara as zonas
sudo tee -a /etc/bind/named.conf.local >/dev/null <<'EOF'
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

# permite consultas da intranet e repassa nomes externos ao 8.8.8.8
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

sudo named-checkconf && sudo named-checkzone grupo4.unb /etc/bind/db.grupo4.unb
sudo systemctl restart bind9
```

**Testar (de qualquer máquina):**

```bash
nslookup s.grupo4.unb 172.16.0.2      # 172.16.0.2
nslookup 172.16.0.1 172.16.0.2        # r1.grupo4.unb (reverso)
nslookup google.com 172.16.0.2        # nome externo (forwarder)
```

---

## 12. E-mail

SMTP (postfix) + IMAP (dovecot) com TLS em S, demonstrado no Thunderbird:

```bash
# S — certificado TLS autoassinado
sudo openssl req -new -x509 -days 365 -nodes -subj "/CN=s.grupo4.unb" \
  -out /etc/ssl/certs/mail.pem -keyout /etc/ssl/private/mail.key

# postfix
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

# caixas de e-mail (uma conta linux = uma caixa)
sudo adduser aluno1
sudo adduser aluno2
```

**Testar (em S):**

```bash
echo "teste" | mail -s "oi" aluno2@grupo4.unb
sudo tail -n 5 /var/log/mail.log     # deve mostrar status=sent
```

**Thunderbird (em X):** conta `aluno1@grupo4.unb` → configuração manual → IMAP `s.grupo4.unb` porta 143 STARTTLS · SMTP `s.grupo4.unb` porta 25 STARTTLS · usuário `aluno1`. Aceite o certificado. Envie de aluno1 para aluno2 e veja chegar.

---

## 13. WEB

Apache em R1: página da intranet + proxy reverso (API Gateway) para o backend em S:

```bash
# R1
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
sudo a2dissite 000-default && sudo a2ensite miniiptv
sudo systemctl restart apache2
```

**Testar (em X):** `curl http://r1.grupo4.unb/` → mostra a página. (`/api` dá 503 até o backend da Fase 2 subir — normal.)

---

## 14. Verificação

Tudo de uma vez, a partir de X:

```bash
ping -c 2 192.168.0.1      # R2 (gateway local)
ping -c 2 10.0.0.1         # R1 pela WAN
ping -c 2 172.16.0.2       # S (fim-a-fim)
ping -c 2 8.8.8.8          # Internet (NAT)
nslookup s.grupo4.unb      # DNS
curl http://r1.grupo4.unb/ # WEB
```

Mais o multicast (passo 9), a banda ~115 kbps (passo 10) e o e-mail no Thunderbird (passo 12). Tudo respondendo = Fase 1 concluída. Guarde as saídas (`comando | tee captura.txt`) para o relatório.

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| Máquinas na mesma LAN não se pingam | cabo, placa DOWN ou IP errado | `ip a`; refaça o passo 3 na placa certa |
| IP sumiu | reboot (o `ip addr` não persiste) | rode o passo 3 de novo (ou Anexo A) |
| ppp0 não sobe | porta errada ou cabo não é cross | `dmesg \| grep tty`; cabo null-modem |
| ping vai e não volta | falta rota de retorno | passo 6 no outro roteador |
| roteador não repassa | esqueceu o passo 4 | `sysctl -w net.ipv4.ip_forward=1` |
| só R1 tem Internet | falta NAT | passo 7 |
| X/Y sem IP ou IP errado | DHCP do roteador-switch ligado, ou `INTERFACESv4` errado | desligue-o; confira o passo 8 |
| multicast não chega | rota smcroute faltando ou TTL 1 no emissor | passo 9; emissor com `--ttl 16` |
| DNS REFUSED | rede fora do `allow-query` | passo 11 |
| e-mail Relay denied | rede fora do `mynetworks` | passo 12 |

---

## Anexo A — fixar os IPs (opcional)

Os comandos `ip addr` do passo 3 somem no reboot. Para fixar no Ubuntu Desktop (NetworkManager):

```bash
# S
sudo nmcli con add type ethernet ifname IFACE con-name frc ipv4.method manual \
     ipv4.addresses 172.16.0.2/16 ipv4.gateway 172.16.0.1 ipv4.dns 172.16.0.2
sudo nmcli con up frc
```

```bash
# R1 (LAN#1; o adaptador do Lab o NetworkManager já cuida com DHCP)
sudo nmcli con add type ethernet ifname IFACE con-name frc ipv4.method manual \
     ipv4.addresses 172.16.0.1/16
sudo nmcli con up frc
```

```bash
# R2
sudo nmcli con add type ethernet ifname IFACE con-name frc ipv4.method manual \
     ipv4.addresses 192.168.0.1/24
sudo nmcli con up frc
```

Deu erro "already exists"? `sudo nmcli con delete frc` e rode de novo. As rotas dos passos 4 e 6 e as regras do 9 e 10 também são voláteis — no dia da apresentação, rode os passos 4–6 e 9–10 após ligar as máquinas (ou use `scripts/setup-rede.sh`, que aplica tudo).
