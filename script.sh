#!/usr/bin/env bash
# ============================================================
#  setup-rede.sh — Fase 1 Mini-IPTV (Grupo 4, Ubuntu 22.04)
#
#  USO (em cada máquina):   sudo bash setup-rede.sh
#
#  - Detecta interfaces/porta serial sozinho; só pergunta se
#    houver mais de uma opção (menu numerado lido do teclado).
#  - Auto-reparo: remove perfis nmcli quebrados (frc-*),
#    netplan órfão, pppd zumbi, IPs errados na placa.
#  - Aplica pelo caminho certo (Desktop=nmcli, Server=netplan),
#    VERIFICA se o IP entrou e corrige se não entrou.
#  - Idempotente: pode rodar quantas vezes quiser.
# ============================================================
set -u  # (sem -e de propósito: tratamos erros e seguimos reparando)

[ "$(id -u)" -eq 0 ] || { echo "Rode com sudo: sudo bash $0"; exit 1; }
# fd3 = entrada do teclado; fd4 = saída p/ o usuário (tty se houver, senão stderr)
{ exec 3</dev/tty && exec 4>/dev/tty; } 2>/dev/null || { exec 3<&0; exec 4>&2; }

C_OK=$'\e[32m'; C_ERR=$'\e[31m'; C_TIT=$'\e[1;36m'; C_0=$'\e[0m'
# ok/err/tit vão para stderr: nunca são capturados por $( ) por engano
ok(){   echo "${C_OK}[OK]${C_0} $*" >&2; }
err(){  echo "${C_ERR}[ERRO]${C_0} $*" >&2; }
tit(){  { echo; echo "${C_TIT}==== $* ====${C_0}"; } >&2; }

pergunta_num(){ # $1=prompt  $2=max  -> ecoa índice escolhido (1-based)
  local op
  while true; do
    printf "%s " "$1" >&4
    read -r op <&3 || { err "entrada de teclado encerrada — rode o script num terminal interativo"; kill -s TERM $$ 2>/dev/null; exit 1; }
    [[ "$op" =~ ^[0-9]+$ ]] && [ "$op" -ge 1 ] && [ "$op" -le "$2" ] && { echo "$op"; return; }
    echo "Opção inválida (1-$2)." >&4
  done
}

# ---------- inventário de interfaces ----------
# cabeada física = tem /device, não-wireless, não-virtual
CABEADAS=(); USB_ETH=()
for d in /sys/class/net/*; do
  n=$(basename "$d")
  [ -e "$d/device" ] || continue            # exclui lo, docker0, veth, br-, ppp
  [ -d "$d/wireless" ] && continue          # exclui wifi
  CABEADAS+=("$n")
  readlink -f "$d" | grep -q usb && USB_ETH+=("$n")
done
# fallback: nenhum device físico detectado (VM/ambiente exótico) -> filtra por nome
if [ ${#CABEADAS[@]} -eq 0 ]; then
  for d in /sys/class/net/*; do
    n=$(basename "$d")
    case "$n" in lo|ppp*|docker*|br-*|virbr*|tun*|tap*|wl*) continue;; esac
    [ -d "$d/wireless" ] && continue
    CABEADAS+=("$n")
  done
fi

escolhe(){ # $1=descrição  $2..=candidatas  -> ecoa a escolhida (auto se só 1)
  local descr="$1"; shift
  local cands=("$@")
  if [ ${#cands[@]} -eq 0 ]; then err "nenhuma interface para: $descr"; echo ""; return; fi
  if [ ${#cands[@]} -eq 1 ]; then
    echo "Detectado automaticamente para $descr: ${cands[0]}" >&4
    echo "${cands[0]}"; return
  fi
  echo >&4; echo "Escolha a interface para: $descr" >&4
  local i=1 c estado
  for c in "${cands[@]}"; do
    estado=$(cat /sys/class/net/"$c"/operstate 2>/dev/null || echo '?')
    echo "  $i) $c  [cabo: $estado]" >&4
    i=$((i+1))
  done
  local idx; idx=$(pergunta_num "Número:" ${#cands[@]})
  echo "${cands[$((idx-1))]}"
}

escolhe_serial(){
  local devs=() d
  for d in /dev/ttyUSB* /dev/ttyS0 /dev/ttyS1; do [ -e "$d" ] && devs+=("$d"); done
  if [ ${#devs[@]} -eq 0 ]; then err "nenhuma porta serial (conecte o cabo/adaptador)"; echo ""; return; fi
  # preferir USB automaticamente se houver exatamente um
  local usbs=(); for d in "${devs[@]}"; do [[ "$d" == /dev/ttyUSB* ]] && usbs+=("$d"); done
  if [ ${#usbs[@]} -eq 1 ]; then
    echo "Porta serial detectada automaticamente: ${usbs[0]}" >&4
    echo "${usbs[0]}"; return
  fi
  echo >&4; echo "Escolha a porta serial (cabo PPP):" >&4
  local i=1; for d in "${devs[@]}"; do echo "  $i) $d" >&4; i=$((i+1)); done
  local idx; idx=$(pergunta_num "Número:" ${#devs[@]})
  echo "${devs[$((idx-1))]}"
}

# ---------- LIMPEZA / AUTO-REPARO (sempre roda) ----------
limpeza(){
  tit "Limpeza de tentativas anteriores"
  # perfis nmcli frc-* (inclusive duplicados/quebrados)
  if command -v nmcli >/dev/null && systemctl is-active --quiet NetworkManager; then
    nmcli -t -f UUID,NAME con show 2>/dev/null | awk -F: '$2 ~ /^frc/ {print $1}' | \
      while read -r u; do nmcli con delete uuid "$u" >/dev/null 2>&1 && echo "  removido perfil nmcli antigo ($u)"; done
  fi
  # netplan órfão do tutorial
  [ -f /etc/netplan/01-frc.yaml ] && { rm -f /etc/netplan/01-frc.yaml; echo "  removido /etc/netplan/01-frc.yaml antigo"; }
  chmod 600 /etc/netplan/*.yaml 2>/dev/null
  # pppd zumbi
  pkill -x pppd 2>/dev/null && echo "  pppd antigo finalizado"
  ok "limpeza concluída"
}

# ---------- aplicar IP e VERIFICAR (com fallback) ----------
# aplica_ip <iface> <cidr> [gw] [dns]
aplica_ip(){
  local IFACE="$1" CIDR="$2" GW="${3:-}" DNS="${4:-}"
  [ -e "/sys/class/net/$IFACE" ] || { err "interface $IFACE não existe"; return 1; }
  ip link set "$IFACE" up

  if systemctl is-active --quiet NetworkManager; then
    # ---------- Desktop: nmcli ----------
    nmcli dev set "$IFACE" managed yes >/dev/null 2>&1
    local CON="frc-$IFACE" args=(ipv4.method manual ipv4.addresses "$CIDR"
                                 connection.autoconnect yes connection.autoconnect-priority 100)
    [ -n "$GW"  ] && args+=(ipv4.gateway "$GW")
    [ -n "$DNS" ] && args+=(ipv4.dns "$DNS")
    nmcli con add type ethernet ifname "$IFACE" con-name "$CON" "${args[@]}" >/dev/null 2>&1
    # derruba qualquer outro perfil ativo nessa placa e sobe o nosso
    nmcli -t -f NAME,DEVICE con show --active 2>/dev/null | awk -F: -v d="$IFACE" -v c="$CON" '$2==d && $1!=c {print $1}' | \
      while read -r other; do nmcli con down "$other" >/dev/null 2>&1; done
    nmcli con up "$CON" >/dev/null 2>&1
  else
    # ---------- Server: netplan ----------
    mkdir -p /etc/netplan
    touch /etc/netplan/01-frc.yaml
    python3 - "$IFACE" "$CIDR" "$GW" "$DNS" <<'PY'
import sys, re
iface, cidr, gw, dns = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
path = "/etc/netplan/01-frc.yaml"
try: cur = open(path).read()
except: cur = ""
if "network:" not in cur:
    cur = "network:\n  version: 2\n  renderer: networkd\n  ethernets:\n"
if f"    {iface}:" not in cur:
    bloco = f"    {iface}:\n      addresses: [{cidr}]\n"
    if dns: bloco += f"      nameservers: {{addresses: [{dns}]}}\n"
    if gw:  bloco += f"      routes: [{{to: default, via: {gw}}}]\n"
    cur += bloco
open(path, "w").write(cur)
PY
    chmod 600 /etc/netplan/*.yaml
    netplan apply 2>/dev/null
  fi

  # ---------- verificação + fallback ----------
  sleep 2
  if ip -brief addr show "$IFACE" | grep -q "${CIDR%/*}"; then
    ok "$IFACE = $CIDR aplicado e verificado"
  else
    err "$CIDR não entrou em $IFACE pelo caminho normal — aplicando fallback direto"
    ip addr flush dev "$IFACE" scope global 2>/dev/null
    ip addr add "$CIDR" dev "$IFACE"
    [ -n "$GW" ] && ip route replace default via "$GW"
    if ip -brief addr show "$IFACE" | grep -q "${CIDR%/*}"; then
      ok "$IFACE = $CIDR aplicado via fallback (não persiste no reboot — rode o script de novo após reiniciar)"
    else
      err "não consegui setar $CIDR em $IFACE. Cheque cabo/placa: ip -brief link"
      return 1
    fi
  fi
}

aplica_dhcp_cliente(){ # interface do Lab em R1
  local IFACE="$1"
  [ -e "/sys/class/net/$IFACE" ] || { err "interface $IFACE não existe"; return 1; }
  ip link set "$IFACE" up
  if systemctl is-active --quiet NetworkManager; then
    nmcli con add type ethernet ifname "$IFACE" con-name "frc-$IFACE" ipv4.method auto \
          connection.autoconnect yes >/dev/null 2>&1
    nmcli con up "frc-$IFACE" >/dev/null 2>&1
  else
    dhclient -1 "$IFACE" 2>/dev/null
  fi
  sleep 3
  if ip -brief addr show "$IFACE" | grep -qE 'inet? [0-9]|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+'; then
    ok "$IFACE recebeu IP do Lab: $(ip -brief addr show "$IFACE" | awk '{print $3}')"
  else
    err "$IFACE não recebeu IP do Lab — cheque o cabo na rede do laboratório"
  fi
}

sysctl_roteador(){
  cat > /etc/sysctl.d/99-router.conf <<EOF
net.ipv4.ip_forward=1
net.ipv4.conf.all.mc_forwarding=1
EOF
  sysctl --system >/dev/null 2>&1
  [ "$(sysctl -n net.ipv4.ip_forward)" = "1" ] && ok "roteamento habilitado (ip_forward=1)" || err "ip_forward não ativou"
}

cria_frc_ppp(){ # $1=serial $2=args extras do pppd
  cat > /usr/local/bin/frc-ppp <<EOF
#!/bin/bash
sudo pkill -x pppd 2>/dev/null; sleep 1
exec sudo pppd $1 115200 $2 noauth local nocrtscts persist nodetach
EOF
  chmod +x /usr/local/bin/frc-ppp
  ok "comando 'frc-ppp' criado (sobe a WAN; deixe rodando num terminal)"
}

espera_ppp(){ # espera ppp0 até 40s
  echo -n "Aguardando ppp0 subir (rode frc-ppp do outro lado também)"
  for _ in $(seq 1 40); do
    ip link show ppp0 >/dev/null 2>&1 && { echo; ok "ppp0 no ar"; return 0; }
    echo -n "."; sleep 1
  done
  echo; err "ppp0 não subiu em 40s — confira cabo serial e se o outro lado rodou frc-ppp"
  return 1
}

iptables_seguro(){ # adiciona regra só se não existir:  iptables_seguro <tabela|-> <regra...>
  local t="$1"; shift
  if [ "$t" = "-" ]; then
    iptables -C "$@" 2>/dev/null || iptables -A "$@"
  else
    iptables -t "$t" -C "$@" 2>/dev/null || iptables -t "$t" -A "$@"
  fi
}

pergunta_sn(){ # $1=pergunta  -> 0 se sim
  local r; printf "%s [s/n] " "$1" >&4; read -r r <&3
  [[ "$r" =~ ^[sS] ]]
}

# ============================================================
tit "Papel desta máquina"
echo "  1) S   — servidor (172.16.0.2)"
echo "  2) R1  — roteador/gateway (172.16.0.1 + Lab + PPP)"
echo "  3) R2  — roteador/DHCP (192.168.0.1 + PPP)"
echo "  4) X/Y — cliente (DHCP: nada a configurar)"
PAPEL=$(pergunta_num "Número:" 4)

limpeza

case "$PAPEL" in
# ==================== S ====================
1)
  LAN1=$(escolhe "LAN#1 (cabo direto até R1)" "${CABEADAS[@]}")
  [ -n "$LAN1" ] || exit 1
  aplica_ip "$LAN1" 172.16.0.2/16 172.16.0.1 172.16.0.2 || exit 1
  ip route replace 239.0.0.0/8 dev "$LAN1"
  echo "LAN1=$LAN1" > /etc/frc.env
  tit "Validação"
  ping -c 2 -W 2 172.16.0.1 >/dev/null 2>&1 && ok "R1 (172.16.0.1) responde" \
    || err "R1 não responde — configure o R1 e/ou confira o cabo direto"
  ;;
# ==================== R1 ====================
2)
  # USB->Eth vai para o Lab automaticamente se houver exatamente um
  if [ ${#USB_ETH[@]} -eq 1 ]; then
    LAB="${USB_ETH[0]}"; echo "Adaptador USB->Ethernet detectado (Lab): $LAB"
    NAT_CANDS=(); for c in "${CABEADAS[@]}"; do [ "$c" != "$LAB" ] && NAT_CANDS+=("$c"); done
    LAN1=$(escolhe "LAN#1 (cabo direto até S)" "${NAT_CANDS[@]}")
  else
    LAN1=$(escolhe "LAN#1 (cabo direto até S)" "${CABEADAS[@]}")
    LAB_CANDS=(); for c in "${CABEADAS[@]}"; do [ "$c" != "$LAN1" ] && LAB_CANDS+=("$c"); done
    LAB=$(escolhe "rede do LABORATÓRIO (USB->Eth)" "${LAB_CANDS[@]}")
  fi
  [ -n "$LAN1" ] && [ -n "$LAB" ] || exit 1
  SERIAL=$(escolhe_serial); [ -n "$SERIAL" ] || exit 1

  aplica_ip "$LAN1" 172.16.0.1/16 || exit 1
  aplica_dhcp_cliente "$LAB"
  sysctl_roteador
  echo -e "LAN1=$LAN1\nLAB=$LAB\nSERIAL=$SERIAL" > /etc/frc.env
  cria_frc_ppp "$SERIAL" "10.0.0.1:10.0.0.2"

  if pergunta_sn "Subir a WAN agora e aplicar rotas+NAT+multicast+tc? (R2 já deve estar com frc-ppp rodando)"; then
    ( /usr/local/bin/frc-ppp >/var/log/frc-ppp.log 2>&1 & )
    if espera_ppp; then
      ip route replace 192.168.0.0/24 via 10.0.0.2
      iptables_seguro nat POSTROUTING -o "$LAB" -j MASQUERADE
      iptables_seguro - FORWARD -i "$LAN1" -o "$LAB" -j ACCEPT
      iptables_seguro - FORWARD -i ppp0 -o "$LAB" -j ACCEPT
      iptables_seguro - FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
      command -v netfilter-persistent >/dev/null && netfilter-persistent save >/dev/null 2>&1
      ok "rota LAN#2 + Source NAT aplicados"
      if command -v smcroutectl >/dev/null; then
        systemctl enable --now smcroute >/dev/null 2>&1
        smcroutectl add "$LAN1" 239.10.4.0/24 "$LAB"  2>/dev/null
        smcroutectl add "$LAN1" 239.20.4.0/24 ppp0     2>/dev/null
        ok "rotas multicast aplicadas"
      else err "smcroute não instalado (sudo apt install -y smcroute) — multicast pendente"; fi
      tc qdisc del dev ppp0 root 2>/dev/null
      tc qdisc add dev ppp0 root tbf rate 115200bit burst 4kb latency 400ms && ok "tc 115200bit aplicado na WAN"
      tit "Validação"
      ping -c 2 -W 2 10.0.0.2 >/dev/null 2>&1 && ok "R2 via WAN responde" || err "R2 via WAN não responde"
      ping -c 2 -W 3 8.8.8.8  >/dev/null 2>&1 && ok "Internet OK"          || err "sem Internet pelo Lab"
    fi
  else
    echo "Depois: rode 'frc-ppp' num terminal e rode este script de novo respondendo 's'."
  fi
  ;;
# ==================== R2 ====================
3)
  LAN2=$(escolhe "LAN#2 (porta LAN do roteador-switch com X e Y)" "${CABEADAS[@]}")
  [ -n "$LAN2" ] || exit 1
  SERIAL=$(escolhe_serial); [ -n "$SERIAL" ] || exit 1

  aplica_ip "$LAN2" 192.168.0.1/24 || exit 1
  sysctl_roteador
  echo -e "LAN2=$LAN2\nSERIAL=$SERIAL" > /etc/frc.env
  cria_frc_ppp "$SERIAL" ""

  # DHCP server
  if command -v dhcpd >/dev/null; then
    cat > /etc/dhcp/dhcpd.conf <<'EOF'
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
    echo "INTERFACESv4=\"$LAN2\"" > /etc/default/isc-dhcp-server
    systemctl restart isc-dhcp-server; systemctl enable isc-dhcp-server >/dev/null 2>&1
    systemctl is-active --quiet isc-dhcp-server && ok "DHCP ativo em $LAN2 (faixa .100-.200)" \
      || { err "DHCP não subiu; veja: journalctl -u isc-dhcp-server -n 20"; }
  else
    err "isc-dhcp-server não instalado (sudo apt install -y isc-dhcp-server) — DHCP pendente"
  fi

  if pergunta_sn "Subir a WAN agora e aplicar rotas+multicast? (deixe este lado primeiro; depois rode no R1)"; then
    ( /usr/local/bin/frc-ppp >/var/log/frc-ppp.log 2>&1 & )
    if espera_ppp; then
      ip route replace 172.16.0.0/16 via 10.0.0.1
      ip route replace default via 10.0.0.1
      ok "rotas LAN#1 + default aplicadas"
      if command -v smcroutectl >/dev/null; then
        systemctl enable --now smcroute >/dev/null 2>&1
        smcroutectl add ppp0 239.20.4.0/24 "$LAN2" 2>/dev/null
        smcroutectl join "$LAN2" 239.20.4.1        2>/dev/null
        ok "rotas multicast aplicadas"
      else err "smcroute não instalado (sudo apt install -y smcroute) — multicast pendente"; fi
      tit "Validação"
      ping -c 2 -W 2 10.0.0.1   >/dev/null 2>&1 && ok "R1 via WAN responde"  || err "R1 via WAN não responde"
      ping -c 2 -W 3 172.16.0.2 >/dev/null 2>&1 && ok "S através da WAN OK"  || err "S não responde (configure S e as rotas de R1)"
    fi
  else
    echo "Depois: rode 'frc-ppp' num terminal e rode este script de novo respondendo 's'."
  fi
  ;;
# ==================== X/Y ====================
4)
  echo "Cliente: basta plugar o cabo na LAN#2. Verificando DHCP..."
  sleep 2; ip -brief addr
  ip -brief addr | grep -q "192.168.0.1[0-9][0-9]" \
    && ok "IP da faixa correta recebido" \
    || err "sem IP 192.168.0.100-200: R2 pronto? DHCP do roteador-switch desligado? Reconecte o cabo."
  ;;
*) err "papel inválido"; exit 1;;
esac

tit "Resumo final"
[ -f /etc/frc.env ] && cat /etc/frc.env
ip -brief addr
echo "Reexecutar este script é seguro: ele limpa e reaplica tudo."
