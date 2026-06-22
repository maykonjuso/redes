# Guia completo — NAT (MASQUERADE) + SSH sem senha + E-mail seguro

Este guia cobre o projeto inteiro, **máquina por máquina**, com **todos os comandos**.
Topologia: dois roteadores (**R1 #1** e **R2 #2**) interligados por **WAN**, com a LAN do servidor
de um lado e a LAN dos clientes do outro.

Ele **reaproveita** a montagem de WAN (PPP), endereçamento e roteamento do guia anterior
(*Servidor de vídeo em multicast*) e foca nas **três novas tarefas**:

1. **Source NAT** (MASQUERADE em R2)
2. **SSH sem senha** (chave pública entre S, R1 e R2)
3. **E-mail seguro** (Thunderbird em X e Y com comunicação criptografada)

> ⚠️ Quase todos os comandos de rede precisam de **root**. Use `sudo` ou entre com `sudo -i`.

---

## 0. Visão geral da topologia e máquinas

São necessárias **5 máquinas Linux** (as mesmas do projeto anterior).

```mermaid
flowchart LR
    subgraph LAN1["🖧 BANCADA #1 — LAN 172.16.0.0/24"]
        direction TB
        S["💻 S<br/><b>Servidor</b><br/>eth0: 172.16.0.2"]
        R1["🔀 R1 (#1)<br/><b>Roteador</b><br/>eth0: 172.16.0.1<br/>WAN: 10.0.2.1"]
        S ---|switch/hub| R1
    end

    subgraph LAN2["🖧 BANCADA #2 — LAN 192.168.0.0/24"]
        direction TB
        R2["🔀 R2 (#2)<br/><b>Roteador + NAT</b><br/>WAN: 2.2.2.2<br/>eth0: 192.168.0.1"]
        X["💻 X<br/><b>Cliente</b><br/>192.168.0.2"]
        Y["💻 Y<br/><b>Cliente</b><br/>192.168.0.3"]
        R2 ---|switch/hub| X
        R2 ---|switch/hub| Y
    end

    R1 <== "🌐 WAN · enlace ponto-a-ponto<br/>ppp0: 10.0.2.1 ⟷ 2.2.2.2" ==> R2

    classDef server fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;
    classDef router fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef client fill:#dcfce7,stroke:#16a34a,color:#14532d;
    class S server;
    class R1,R2 router;
    class X,Y client;
```

### Tabela de endereçamento (CONFIRMADA pela foto)

| Máquina | Papel | Interface LAN (eth0) | Interface WAN (ppp0) | Gateway padrão |
| ------- | ----------------------------- | -------------------- | -------------------- | -------------- |
| **S**   | Servidor (e servidor de mail) | 172.16.0.2/24        | —                    | 172.16.0.1     |
| **R1** (#1) | Roteador | 172.16.0.1/24        | **10.0.2.1**         | —              |
| **R2** (#2) | Roteador + **NAT** | 192.168.0.1/24       | **2.2.2.2**          | —              |
| **X**   | Cliente (Thunderbird) | 192.168.0.2/24       | —                    | 192.168.0.1    |
| **Y**   | Cliente (Thunderbird) | 192.168.0.3/24       | —                    | 192.168.0.1    |

> 📌 **Sobre os IPs da WAN serem de redes diferentes** (`10.0.2.1` e `2.2.2.2`):
> isso **não é erro**. Em um enlace **PPP ponto-a-ponto** cada ponta pode estar em
> "rede" diferente — o PPP cria automaticamente uma rota /32 para o peer. R2 (#2) simula
> ter um IP "público" (`2.2.2.2`) e por isso é nele que fazemos o **MASQUERADE**.

### O que cada máquina precisa ser / ter

| Máquina | Tipo de máquina | Precisa de GUI? |
| ------- | --------------- | --------------- |
| S | Servidor Linux (pode ser sem GUI) | Não |
| R1 | Roteador Linux (sem GUI) | Não |
| R2 | Roteador Linux (sem GUI) | Não |
| X | Desktop Linux | **Sim** (Thunderbird) |
| Y | Desktop Linux | **Sim** (Thunderbird) |

> **Descubra o nome real da sua placa de rede** antes de começar (`eth0`, `enp3s0`, `ens33`…):
> ```bash
> ip link show
> ```
> Nos comandos abaixo **substitua `eth0`** pelo nome real da sua interface Ethernet.

---

## 1. O que instalar em cada máquina (faça isto primeiro)

Comandos para **Debian/Ubuntu** (`apt`). Em outras distros troque por `dnf install`
(Fedora/RHEL) ou `pacman -S` (Arch).

> Em **todas** as máquinas, primeiro:
> ```bash
> sudo apt-get update
> ```

| Máquina | Pacotes | Para quê |
| ------- | ------- | -------- |
| **S** | `ppp`* `openssh-server` `postfix` `dovecot-imapd` `dovecot-pop3d` `openssl` `mailutils` | enlace, SSH, **servidor de e-mail** com TLS |
| **R1** | `ppp` `iproute2` `openssh-server` `tcpdump` | enlace WAN, roteamento, SSH, diagnóstico |
| **R2** | `ppp` `iproute2` `openssh-server` `iptables` `iptables-persistent` `tcpdump` | enlace WAN, **NAT**, SSH, diagnóstico |
| **X** | `thunderbird` `openssh-client` | cliente de e-mail seguro |
| **Y** | `thunderbird` `openssh-client` | cliente de e-mail seguro |

\* S só precisa de `ppp` se você for fazer login PPP a partir dele; normalmente não.

### Comandos por papel

**Servidor S (mail server):**
```bash
sudo apt-get install -y openssh-server postfix dovecot-imapd dovecot-pop3d openssl mailutils
```

**Roteador R1:**
```bash
sudo apt-get install -y ppp iproute2 openssh-server tcpdump
```

**Roteador R2 (faz NAT):**
```bash
sudo apt-get install -y ppp iproute2 openssh-server iptables iptables-persistent tcpdump
```

**Clientes X e Y:**
```bash
sudo apt-get install -y thunderbird openssh-client
```

---

## 2. Endereçamento IP (todas as máquinas)

Os comandos `ip` são **temporários** (perdem-se ao reiniciar) — perfeitos para o laboratório.

### 2.1. Servidor S
```bash
sudo ip addr flush dev eth0
sudo ip addr add 172.16.0.2/24 dev eth0
sudo ip link set eth0 up
sudo ip route add default via 172.16.0.1
```

### 2.2. Roteador R1 (lado LAN; o `ppp0` vem na Seção 3)
```bash
sudo ip addr flush dev eth0
sudo ip addr add 172.16.0.1/24 dev eth0
sudo ip link set eth0 up
```

### 2.3. Roteador R2 (lado LAN; o `ppp0` vem na Seção 3)
```bash
sudo ip addr flush dev eth0
sudo ip addr add 192.168.0.1/24 dev eth0
sudo ip link set eth0 up
```

### 2.4. Cliente X
```bash
sudo ip addr flush dev eth0
sudo ip addr add 192.168.0.2/24 dev eth0
sudo ip link set eth0 up
sudo ip route add default via 192.168.0.1
```

### 2.5. Cliente Y
```bash
sudo ip addr flush dev eth0
sudo ip addr add 192.168.0.3/24 dev eth0
sudo ip link set eth0 up
sudo ip route add default via 192.168.0.1
```

### 2.6. Verificação
```bash
ip addr show eth0      # confere o IP
ip route               # confere as rotas
# Primeiro salto dentro de cada LAN:
ping -c 3 172.16.0.1   # em S → R1
ping -c 3 192.168.0.1  # em X/Y → R2
```

---

## 3. Enlace WAN via PPP (R1 e R2)

O PPP cria a interface virtual `ppp0` sobre o cabo serial cross, formando a "WAN".
**Diferente** do guia anterior, aqui as pontas usam `10.0.2.1` (R1) e `2.2.2.2` (R2).

### 3.1. Pré-requisitos
```bash
which pppd || sudo apt-get install -y ppp
ls -l /dev/ttyS*        # COM1 normalmente = /dev/ttyS0
```
Cabo serial **cross (null-modem)** entre as duas máquinas, na COM1.

### 3.2. Subir o PPP (execute **simultaneamente** nas duas pontas)

Em **R1** (local 10.0.2.1, peer 2.2.2.2):
```bash
sudo pppd /dev/ttyS0 115200 10.0.2.1:2.2.2.2 noauth local lock nodetach debug
```

Em **R2** (local 2.2.2.2, peer 10.0.2.1):
```bash
sudo pppd /dev/ttyS0 115200 2.2.2.2:10.0.2.1 noauth local lock nodetach debug
```

> ⚠️ **Erro comum: `No suitable secret found for authenticating with the peer`.**
> O `noauth` precisa estar nas **duas** pontas. Se houver `auth`, `require-pap` ou
> `require-chap` em `/etc/ppp/options`, comente com `#`.

### 3.3. Verificação
```bash
ip addr show ppp0          # R1 mostra 10.0.2.1, R2 mostra 2.2.2.2
ping -c 3 2.2.2.2          # de R1
ping -c 3 10.0.2.1         # de R2
```

> Alternativa Ethernet (sem cabo serial): use uma **rede interna** ligando R1 e R2,
> com `10.0.2.1/30` em R1 e `2.2.2.2/30`… porém esses IPs não cabem na mesma /30.
> Por isso o **PPP é o caminho recomendado** aqui — ele aceita pontas de redes distintas.
> Se precisar mesmo de Ethernet, dê às pontas IPs de uma mesma sub-rede (ex.: `10.0.2.1/24`
> e `10.0.2.2/24`) e ajuste as rotas; mas a foto pede `2.2.2.2`, então **prefira PPP**.

---

## 4. Roteamento IP e IP forwarding

### 4.1. Habilitar encaminhamento (em R1 e R2)
```bash
sudo sysctl -w net.ipv4.ip_forward=1
cat /proc/sys/net/ipv4/ip_forward   # deve mostrar 1
```

### 4.2. Rotas entre as LANs

Em **R1** (alcançar a LAN dos clientes):
```bash
sudo ip route add 192.168.0.0/24 via 2.2.2.2 dev ppp0
```

Em **R2** (alcançar a LAN do servidor):
```bash
sudo ip route add 172.16.0.0/24 via 10.0.2.1 dev ppp0
```

> 💡 Com o **NAT da Seção 5** ativo, R1 nem precisa de rota de volta para `192.168.0.0/24`,
> porque o tráfego de X/Y chega a S **mascarado como `2.2.2.2`** (e R1 já sabe chegar em
> `2.2.2.2` pela rota /32 do PPP). Mantenha a rota acima mesmo assim — ela é necessária
> para testes diretos (ping/SSH de S para dentro da rede de R2).

### 4.3. Teste fim-a-fim (antes de qualquer tarefa)
```bash
# De X até o servidor:
ping -c 3 172.16.0.2
# De S até R2:
ping -c 3 2.2.2.2
```

---

## 5. TAREFA 1 — Source NAT (MASQUERADE em R2)

**Objetivo:** fazer X e Y acessarem a "internet" (a rede além de R2) usando o IP público
de R2 (`2.2.2.2`). O R2 reescreve o IP de origem dos pacotes que saem pela WAN.

### 5.1. Pré-requisito
`ip_forward=1` em R2 (feito na Seção 4.1).

### 5.2. Comando da atividade (exatamente como na foto)
```bash
sudo iptables -A POSTROUTING -t nat -j MASQUERADE
```
Isso mascara **todo** tráfego roteado, em qualquer interface de saída. Funciona para o lab.

### 5.3. Versão recomendada (mais correta — só na WAN)
Limite o MASQUERADE à interface de saída WAN para não mascarar tráfego interno:
```bash
sudo iptables -t nat -A POSTROUTING -o ppp0 -j MASQUERADE
```
- `-t nat` → tabela de NAT
- `-A POSTROUTING` → após a decisão de roteamento (na saída)
- `-o ppp0` → apenas pacotes saindo pela WAN
- `-j MASQUERADE` → troca o IP de origem pelo IP da interface de saída (`2.2.2.2`)

### 5.4. Verificação
```bash
# Em R2, veja a regra instalada:
sudo iptables -t nat -L POSTROUTING -n -v

# Em X, gere tráfego em direção a S:
ping -c 3 172.16.0.2

# Em S, capture e confirme que a origem aparece como 2.2.2.2 (e NÃO 192.168.0.x):
sudo tcpdump -n -i eth0 icmp
```
✅ Sucesso = em S os pacotes de X/Y chegam com **origem `2.2.2.2`**.

### 5.5. Tornar o NAT permanente
```bash
# salva as regras atuais:
sudo netfilter-persistent save
# (ou manualmente)
sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
```
Restaura sozinho no boot (pacote `iptables-persistent`). Para recarregar à mão:
```bash
sudo iptables-restore < /etc/iptables/rules.v4
```

> ⚠️ **Não deixe duas regras de MASQUERADE** (a "genérica" da 5.2 **e** a `-o ppp0` da 5.3).
> Escolha **uma**. Para zerar e recomeçar: `sudo iptables -t nat -F`

---

## 6. TAREFA 2 — SSH sem senha (S, R1 e R2)

**Objetivo:** login SSH por **chave pública** entre S, R1 e R2, sem digitar senha.

### 6.1. Garantir o serviço SSH ativo (nas três máquinas)
```bash
sudo systemctl enable --now ssh      # em Debian o serviço chama-se 'ssh'
sudo systemctl status ssh
```

### 6.2. Gerar o par de chaves (em CADA máquina: S, R1 e R2)
Use seu **usuário normal** (não root), sem passphrase para o lab:
```bash
ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)"
# pressione Enter em tudo (sem passphrase → login realmente sem senha)
```
Gera `~/.ssh/id_ed25519` (privada) e `~/.ssh/id_ed25519.pub` (pública).

### 6.3. Copiar a chave pública para os destinos
A primeira cópia **pede a senha uma vez** (depois nunca mais). Endereços que cada máquina usa:

- S ↔ R1 pela LAN: `172.16.0.2` (S) e `172.16.0.1` (R1)
- R1 ↔ R2 pela WAN: `10.0.2.1` (R1) e `2.2.2.2` (R2)

Em **S** (autoriza-se em R1):
```bash
ssh-copy-id usuario@172.16.0.1        # S → R1
```
Em **R1** (autoriza-se em S e em R2):
```bash
ssh-copy-id usuario@172.16.0.2        # R1 → S
ssh-copy-id usuario@2.2.2.2           # R1 → R2
```
Em **R2** (autoriza-se em R1):
```bash
ssh-copy-id usuario@10.0.2.1          # R2 → R1
```
> Troque `usuario` pelo login real de cada máquina. Para acesso **bidirecional** completo,
> rode `ssh-copy-id` em **todos os sentidos** que você for usar.

> 🔁 Se `ssh-copy-id` não existir, faça à mão:
> ```bash
> cat ~/.ssh/id_ed25519.pub | ssh usuario@DESTINO 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
> ```

### 6.4. Verificação
```bash
ssh usuario@172.16.0.1 hostname    # deve entrar SEM pedir senha
```
✅ Sucesso = conecta e roda o comando sem solicitar senha.

### 6.5. (Opcional) Forçar só chave pública (mais seguro)
Em `/etc/ssh/sshd_config`:
```
PasswordAuthentication no
PubkeyAuthentication yes
```
Depois:
```bash
sudo systemctl restart ssh
```
> ⚠️ Só faça isso **depois** de confirmar que a chave funciona, ou você se tranca para fora.

---

## 7. TAREFA 3 — E-mail seguro (Thunderbird em X e Y)

**Objetivo:** X e Y trocam e-mails com **comunicação criptografada**. Há dois níveis de
criptografia, e este guia cobre **os dois cenários**:

- **Cenário A — Criptografia de transporte (TLS/SSL):** o cliente fala com o servidor por
  canal cifrado (SMTPS/IMAPS ou STARTTLS). É o que "configurar Thunderbird com comunicação
  criptografada" pede no mínimo.
- **Cenário B — Criptografia ponta-a-ponta (OpenPGP):** o **conteúdo** da mensagem é
  cifrado entre X e Y, mesmo que o servidor seja comprometido. Cobre o caso mais forte.

Usaremos a máquina **S (172.16.0.2)** como **servidor de e-mail** (SMTP + IMAP).
Como X e Y acessam S **através do NAT da Tarefa 1**, as três tarefas se conectam.

### 7.1. Servidor de e-mail em S — Postfix (SMTP) + Dovecot (IMAP) com TLS

**a) Criar dois usuários de e-mail (contas locais):**
```bash
sudo adduser x        # caixa do cliente X  → x@s.lab
sudo adduser y        # caixa do cliente Y  → y@s.lab
```

**b) Gerar um certificado TLS autoassinado:**
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/mail.key \
  -out /etc/ssl/certs/mail.crt \
  -subj "/CN=172.16.0.2"
sudo chmod 600 /etc/ssl/private/mail.key
```

**c) Postfix — habilitar TLS e a porta submission (587, STARTTLS).**
Edite `/etc/postfix/main.cf` e garanta:
```
myhostname = s.lab
mydestination = s.lab, localhost
inet_interfaces = all
mynetworks = 127.0.0.0/8 172.16.0.0/24 192.168.0.0/24 2.2.2.2/32
home_mailbox = Maildir/
smtpd_tls_cert_file = /etc/ssl/certs/mail.crt
smtpd_tls_key_file  = /etc/ssl/private/mail.key
smtpd_tls_security_level = may
smtpd_tls_auth_only = yes
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
```
> `mynetworks` inclui `2.2.2.2/32` porque é com **esse** IP (mascarado pelo NAT) que X e Y
> chegam ao servidor. Sem isso o Postfix pode recusar o relay.

Habilite a porta **587 (submission)** em `/etc/postfix/master.cf` (descomente o bloco):
```
submission inet n - y - - smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_sasl_type=dovecot
  -o smtpd_sasl_path=private/auth
```

**d) Dovecot — IMAP com SSL e autenticação SASL para o Postfix.**
Em `/etc/dovecot/conf.d/10-ssl.conf`:
```
ssl = required
ssl_cert = </etc/ssl/certs/mail.crt
ssl_key  = </etc/ssl/private/mail.key
```
Em `/etc/dovecot/conf.d/10-mail.conf`:
```
mail_location = maildir:~/Maildir
```
Em `/etc/dovecot/conf.d/10-master.conf`, exponha o socket de auth para o Postfix:
```
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0660
    user = postfix
    group = postfix
  }
}
```
Em `/etc/dovecot/conf.d/10-auth.conf`:
```
disable_plaintext_auth = yes
auth_mechanisms = plain login
```

**e) Reiniciar os serviços:**
```bash
sudo systemctl restart postfix dovecot
sudo systemctl enable postfix dovecot
```

**f) Conferir que as portas estão escutando:**
```bash
sudo ss -tlnp | grep -E ':(587|993|143|25)'
```
Esperado: `25` (SMTP), `587` (submission/STARTTLS), `143` (IMAP), `993` (IMAPS).

### 7.2. Cliente Thunderbird em X e Y (Cenário A — TLS)

Abra o Thunderbird → **Conta de e-mail existente** e configure **manualmente**:

| Campo | Cliente X | Cliente Y |
| ----- | --------- | --------- |
| Seu nome | X | Y |
| E-mail | `x@s.lab` | `y@s.lab` |
| **Servidor de entrada** | IMAP `172.16.0.2` porta **993** SSL/TLS | idem |
| **Servidor de saída** | SMTP `172.16.0.2` porta **587** STARTTLS | idem |
| Autenticação | Senha normal | Senha normal |
| Usuário | `x` | `y` |

> Como o certificado é **autoassinado**, o Thunderbird mostrará um aviso de segurança —
> clique em **Confirmar exceção de segurança**. Em produção usaríamos uma CA real.

**Teste:** de X envie um e-mail para `y@s.lab`. Em Y, clique em **Receber mensagens**.
A mensagem deve chegar, e toda a comunicação cliente↔servidor está cifrada por TLS.

**Confirme a criptografia de transporte (em S):**
```bash
sudo tcpdump -n -i eth0 port 587 or port 993
```
✅ O conteúdo aparece **ilegível** (cifrado) — não dá para ler o texto do e-mail no `tcpdump`.

### 7.3. Cenário B — Criptografia ponta-a-ponta com OpenPGP (Thunderbird nativo)

O Thunderbird (78+) tem **OpenPGP embutido** (sem precisar de Enigmail).

**Em X e em Y:**
1. Menu → **Configurações da conta** → **Criptografia de ponta a ponta**.
2. Clique em **Adicionar chave** → **Criar uma nova chave OpenPGP** → concluir.
3. Cada um **exporta sua chave pública**: botão **Copiar/Exportar chave pública**.
4. **Troquem as chaves públicas** (por e-mail ou pendrive) e **importem** a do outro:
   *Configurações da conta → Criptografia → Gerenciar chaves OpenPGP → Importar*.
5. Marque a chave importada como **confiável/aceita**.

**Enviar cifrado:** ao redigir, ative **Criptografar** (e opcionalmente **Assinar**).
✅ Mesmo capturando o tráfego no servidor, o **corpo da mensagem fica cifrado** (PGP).

> 💡 Para o trabalho, o **Cenário A (TLS)** costuma bastar para "comunicação criptografada".
> O **Cenário B (OpenPGP)** é o diferencial que garante sigilo fim-a-fim.

---

## 8. Diagnóstico — todos os cenários de erro e correção

### 8.1. Rede / WAN / roteamento
| Sintoma | Causa provável | Correção |
| ------- | -------------- | -------- |
| `ping` não passa entre as LANs | `ip_forward=0` | `sudo sysctl -w net.ipv4.ip_forward=1` nos dois roteadores |
| `ping` só vai até o roteador local | falta rota entre LANs | rotas da Seção 4.2 |
| `ppp0` não aparece | dispositivo serial errado / cabo / não disparou nas 2 pontas | confira `/dev/ttyS0`, cabo cross, suba `pppd` simultaneamente |
| `No suitable secret found...` | falta `noauth` | `noauth` nas **duas** pontas; comente `auth/require-*` |
| `pppd` travado | processo antigo preso | `ps aux \| grep pppd` → `sudo kill -9 <PID>` e repita |
| Pacotes somem ao cruzar a WAN | `rp_filter` derrubando | `sudo sysctl -w net.ipv4.conf.all.rp_filter=0` |

### 8.2. NAT (Tarefa 1)
| Sintoma | Causa provável | Correção |
| ------- | -------------- | -------- |
| X/Y não alcançam S | sem MASQUERADE ou sem forward | aplique a regra (5.2/5.3) e `ip_forward=1` |
| Em S a origem ainda é `192.168.0.x` | regra não foi aplicada / interface errada | confira `iptables -t nat -L -n -v`; use `-o ppp0` |
| Funciona, mas após reboot some | regra não persistida | `sudo netfilter-persistent save` |
| Tráfego interno também mascarado | regra "genérica" da 5.2 | troque pela versão `-o ppp0` da 5.3; `iptables -t nat -F` antes |
| Conexão entra mas não volta | falta rota de volta para testes diretos | rota da Seção 4.2 em R1 |

### 8.3. SSH sem senha (Tarefa 2)
| Sintoma | Causa provável | Correção |
| ------- | -------------- | -------- |
| Ainda pede senha | chave não copiada / copiada como root | rode `ssh-copy-id` com o **usuário certo** em cada sentido |
| `Permission denied (publickey)` | permissões erradas | `chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys` |
| `Connection refused` | sshd parado | `sudo systemctl enable --now ssh` |
| Conecta mas pede senha só às vezes | usou IP/usuário diferente do autorizado | autorize **todos** os pares IP+usuário que vai usar |
| Me tranquei após `PasswordAuthentication no` | desabilitou senha sem testar chave | use o console local da VM e reverta o `sshd_config` |

### 8.4. E-mail seguro (Tarefa 3)
| Sintoma | Causa provável | Correção |
| ------- | -------------- | -------- |
| Thunderbird não conecta | portas fechadas / serviço parado | `sudo ss -tlnp \| grep -E ':(587\|993)'`; reinicie `postfix dovecot` |
| Erro de certificado | certificado autoassinado | **Confirmar exceção de segurança** no Thunderbird |
| Envia mas não chega na outra conta | `home_mailbox`/`mail_location` divergentes | use Maildir nos dois (Postfix `home_mailbox = Maildir/`, Dovecot `maildir:~/Maildir`) |
| `Relay access denied` | IP do cliente fora de `mynetworks` | inclua `2.2.2.2/32` (IP do NAT) em `mynetworks` |
| Login IMAP falha | auth em texto puro bloqueada | conecte por **SSL/993** ou **STARTTLS/587**; `disable_plaintext_auth = yes` exige TLS |
| Postfix não autentica via SASL | socket do Dovecot ausente | configure `service auth` em `10-master.conf` e reinicie ambos |
| Não alcança o servidor de mail | NAT/rotas | reveja Seções 4 e 5 (X/Y → R2 → R1 → S) |

### Comandos úteis de inspeção
```bash
ip route ; ip addr show              # endereçamento e rotas
sudo iptables -t nat -L -n -v        # regras de NAT
sudo tcpdump -n -i eth0 icmp         # ver origem dos pacotes (prova do NAT)
sudo journalctl -u postfix -n 50     # logs do Postfix
sudo journalctl -u dovecot -n 50     # logs do Dovecot
sudo tail -f /var/log/mail.log       # log de e-mail em tempo real
```

---

## 9. Checklist final

- [ ] IPs configurados em S, R1, R2, X, Y (Seção 2)
- [ ] `ppp0` ativo entre R1 e R2: ping `10.0.2.1` ↔ `2.2.2.2` ok (Seção 3)
- [ ] `ip_forward=1` em R1 e R2 + rotas entre LANs (Seção 4)
- [ ] **Tarefa 1:** MASQUERADE em R2 — em S os pacotes de X/Y chegam como `2.2.2.2` (Seção 5)
- [ ] NAT persistido (`netfilter-persistent save`)
- [ ] **Tarefa 2:** SSH sem senha funcionando entre S, R1 e R2 (Seção 6)
- [ ] **Tarefa 3a:** Thunderbird em X e Y trocando e-mail por TLS (Seção 7.2)
- [ ] **Tarefa 3b (opcional):** OpenPGP ponta-a-ponta entre X e Y (Seção 7.3)
- [ ] Capturas de tela / `tcpdump` comprovando NAT e e-mail cifrado
