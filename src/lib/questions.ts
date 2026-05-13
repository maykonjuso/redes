export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple-choice" | "true-false" | "calculation";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  deepDive: string;
  apostilaRef: string;
  keyTerms: string[];
  sourceExcerpt: string;
}

export const questions: QuizQuestion[] = [
  // ─── CAMADA FÍSICA ───────────────────────────────────────────────────
  {
    id: "cf-01",
    topic: "Camada Física",
    subtopic: "Sinais e Largura de Banda",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Um sinal analógico periódico possui frequência fundamental de 1000 Hz. Segundo a análise de Fourier, o sinal é transmitido por um canal com largura de banda de 0 a 3000 Hz. Quantas harmônicas são transmitidas e como isso afeta a fidelidade da reprodução?",
    options: [
      { id: "a", text: "3 harmônicas (1ª, 2ª e 3ª); o sinal é reproduzido com qualidade razoável" },
      { id: "b", text: "1 harmônica (apenas a fundamental); o sinal tem forma quadrada" },
      { id: "c", text: "Infinitas harmônicas; o sinal é perfeitamente reproduzido" },
      { id: "d", text: "2 harmônicas (2ª e 3ª); a fundamental é filtrada pelo canal" },
    ],
    correctAnswer: "a",
    explanation:
      "Com frequência fundamental f=1000 Hz e banda de 0–3000 Hz, cabem as harmônicas de 1000, 2000 e 3000 Hz (1ª, 2ª e 3ª). Fourier demonstra que qualquer sinal periódico é soma de senoides: f, 2f, 3f, ... Quanto mais harmônicas passam, mais 'quadrado' e fiel o sinal resultante. Com apenas 3 harmônicas, a forma de onda é reconhecível mas não perfeita — faltam os 'cantos abruptos' que exigiriam harmônicas muito altas.",
    deepDive:
      "**Série de Fourier**: qualquer sinal periódico g(t) = c + Σ aₙ·sin(2πnft) + bₙ·cos(2πnft). Para um sinal de dados binário (quadrado), os coeficientes decaem como 1/n — a 5ª harmônica já tem apenas 20% da amplitude da fundamental. A **largura de banda** do canal (B = f_max − f_min) limita quais componentes chegam ao receptor. A **taxa de Nyquist** C = 2B·log₂V estabelece a máxima taxa teórica num canal sem ruído. No exemplo: C = 2×3000×log₂2 = 6000 bps se o sinal for binário. A relação B⟷harmônicas explica por que linhas telefônicas (0–4kHz) degradam dados de alta taxa.",
    apostilaRef: "AP_TXDADOS: Seções 2.1–2.3 (Análise de Fourier, Largura de Banda)",
    keyTerms: ["Fourier", "harmônica", "largura de banda", "frequência fundamental", "Nyquist"],
    sourceExcerpt: "Se o canal tiver de f a 3f Hz, passará a 1ª, 2ª e 3ª harmônicas. O sinal reproduzido ficará razoavelmente parecido com o original, mas não perfeito. Quanto mais harmônicas, mais fiel à forma quadrada original.",
  },
  {
    id: "cf-02",
    topic: "Camada Física",
    subtopic: "Teorema de Nyquist e Shannon",
    difficulty: "hard",
    type: "calculation",
    question:
      "Um canal de voz tem largura de banda de 4000 Hz e relação sinal-ruído (SNR) de 30 dB. Qual é a capacidade máxima teórica de Shannon e a taxa de Nyquist para 4 níveis de sinal? Por que as duas capacidades diferem?",
    options: [
      { id: "a", text: "Shannon ≈ 39.86 kbps; Nyquist = 16 kbps; Shannon assume ruído real, Nyquist assume canal ideal" },
      { id: "b", text: "Shannon = 4 kbps; Nyquist = 8 kbps; Shannon é sempre menor" },
      { id: "c", text: "Shannon ≈ 39.86 kbps; Nyquist = 16 kbps; Nyquist é limite prático, Shannon é teórico" },
      { id: "d", text: "Shannon = 16 kbps; Nyquist ≈ 39.86 kbps; Nyquist considera ruído" },
    ],
    correctAnswer: "a",
    explanation:
      "**Shannon**: C = B·log₂(1+SNR). SNR = 10^(30/10) = 1000. C = 4000·log₂(1001) ≈ 4000·9.97 ≈ 39.86 kbps. **Nyquist**: C = 2B·log₂V = 2×4000×log₂4 = 2×4000×2 = 16 kbps. Shannon é um limite teórico considerando ruído gaussiano — é impossível ultrapassá-lo. Nyquist é o limite para canal perfeito sem ruído, mas com V níveis de sinal. Quando Shannon < Nyquist, o ruído é o fator limitante real.",
    deepDive:
      "**Fórmula de Shannon** (1948): C = B·log₂(1+S/N) em bps. Válida para canais com ruído branco gaussiano aditivo (AWGN). É um limite superior absoluto — nenhuma técnica de codificação pode superá-lo. **Fórmula de Nyquist** (1924): C = 2B·log₂V — para canal ideal (sem ruído). A diferença revela o **gap de codificação**: engenheiros buscam aproximar-se de Shannon com técnicas como códigos turbo, LDPC e modulação adaptativa. Em 30 dB SNR, o canal 'suporta' muito mais que 4 níveis — poderíamos usar QAM-1024 e ainda estar dentro do limite de Shannon.",
    apostilaRef: "AP_TXDADOS: Seção 2.4 (Capacidade do Canal, Shannon, Nyquist)",
    keyTerms: ["Shannon", "Nyquist", "SNR", "capacidade do canal", "AWGN", "QAM"],
    sourceExcerpt: "Capacidade de Shannon: C = B × log₂(1 + S/N). Capacidade de Nyquist (canal ideal): C = 2B × log₂V. Shannon impõe um limite superior absoluto — nenhuma técnica de codificação pode superá-lo, independentemente da complexidade do esquema de modulação." ,
  },
  {
    id: "cf-03",
    topic: "Camada Física",
    subtopic: "Codificação Digital",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual a principal vantagem do código Manchester em relação ao NRZ-L em sistemas de comunicação digital?",
    options: [
      { id: "a", text: "Manchester ocupa menos largura de banda que NRZ-L" },
      { id: "b", text: "Manchester tem sincronização de clock embutida em cada bit via transição obrigatória no meio do período" },
      { id: "c", text: "Manchester transmite dois bits por período de sinal" },
      { id: "d", text: "Manchester é imune a ruído, enquanto NRZ-L não é" },
    ],
    correctAnswer: "b",
    explanation:
      "No **Manchester**, cada bit possui transição no meio do período: 0=baixo→alto, 1=alto→baixo (ou o inverso no padrão IEEE 802.3). Essa transição garante que o receptor possa recuperar o clock mesmo com longas sequências do mesmo bit. No **NRZ-L** (Non-Return-to-Zero Level), 0=nível baixo e 1=nível alto — sem transição obrigatória, sequências longas de 0s ou 1s perdem sincronização. A desvantagem do Manchester é que sua largura de banda efetiva é o dobro da do NRZ-L.",
    deepDive:
      "**Tabela de Codificações**:\n- **ON-OFF**: 0=ausência de sinal, 1=presença. Simples mas sem sinc.\n- **NRZ-L**: 0=baixo, 1=alto. Eficiente em banda mas sem sinc.\n- **NRZ-I**: inversão em 1, sem mudança em 0. Usado em USB.\n- **Manchester**: transição no meio de cada período. Usado em Ethernet 10BASE-T.\n- **Manchester Diferencial**: transição no início do período para '0', sem transição para '1'. Mais robusto a inversão de polaridade. Usado em Token Ring.\n- **4B/5B + NRZI**: mapeia 4 bits em 5 bits com no máximo 3 zeros consecutivos. Usado em FDDI e Fast Ethernet.\nA largura de banda do Manchester é 2× a do NRZ para a mesma taxa de dados — essa é a troca entre sincronização e eficiência espectral.",
    apostilaRef: "AP_CODICDADOS: Seções 3.1–3.4 (ON-OFF, NRZ-L, Manchester, Manchester Diferencial)",
    keyTerms: ["Manchester", "NRZ-L", "NRZ-I", "sincronização de clock", "codificação digital"],
    sourceExcerpt: "Manchester: a transição no meio do período de bit garante sincronização. '0' = transição baixo→alto; '1' = transição alto→baixo (IEEE 802.3). Desvantagem: largura de banda efetiva é o dobro do NRZ-L para a mesma taxa de bits.",
  },
  {
    id: "cf-04",
    topic: "Camada Física",
    subtopic: "Modulação",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Em QAM-16, quantos bits são transmitidos por símbolo e quais parâmetros da onda portadora são variados simultaneamente?",
    options: [
      { id: "a", text: "4 bits por símbolo; apenas amplitude é variada" },
      { id: "b", text: "4 bits por símbolo; amplitude e fase são variadas simultaneamente" },
      { id: "c", text: "16 bits por símbolo; frequência e fase são variadas" },
      { id: "d", text: "2 bits por símbolo; apenas fase é variada" },
    ],
    correctAnswer: "b",
    explanation:
      "QAM-16 (Quadrature Amplitude Modulation) possui 16 constelações distintas, cada uma representando 4 bits (2⁴=16). O sinal portador é A·cos(2πft + φ), onde tanto A (amplitude) quanto φ (fase) variam. Tipicamente usa-se duas amplitudes e oito fases, ou quatro amplitudes e quatro fases, gerando 16 pontos no diagrama de constelação. Isso torna o QAM muito eficiente em largura de banda — mais bits por hertz.",
    deepDive:
      "**Comparação de Modulações**:\n- **ASK** (Amplitude Shift Keying): varia amplitude. Simples, sensível a ruído de amplitude.\n- **FSK** (Frequency Shift Keying): varia frequência. Robusta a variações de amplitude, usa mais banda.\n- **PSK** (Phase Shift Keying): varia fase. BPSK=1 bit/símbolo, QPSK=2 bits/símbolo.\n- **QAM**: combina ASK + PSK. QAM-64=6 bits/símbolo, QAM-256=8 bits/símbolo.\nO **diagrama de constelação** mostra pontos no plano I-Q (In-phase × Quadrature). Quanto mais pontos, mais eficiente em banda, porém mais sensível a ruído (pontos ficam mais próximos). O **V.32** usa QAM-32 a 2400 baud = 9600 bps. O **V.90** chega a 56000 bps usando PCM de 8 bits a 8000 amostras/s. Modens cable/DSL modernos usam QAM-256 ou superior.",
    apostilaRef: "AP_CODICDADOS: Seções 4.1–4.5 (ASK, FSK, PSK, QAM, Modulação Digital)",
    keyTerms: ["QAM", "ASK", "FSK", "PSK", "constelação", "símbolo", "baud"],
    sourceExcerpt: "QAM (Quadrature Amplitude Modulation): combina ASK e PSK para obter múltiplos símbolos distintos. QAM-16 usa 16 constelações (4 bits/símbolo), variando simultaneamente amplitude e fase da portadora. Quanto mais pontos no diagrama de constelação, maior a eficiência espectral e maior a sensibilidade ao ruído.",
  },
  {
    id: "cf-05",
    topic: "Camada Física",
    subtopic: "PCM e Digitalização",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "O padrão PCM para telefonia digitaliza voz com 8000 amostras por segundo e 8 bits por amostra. Qual a taxa resultante e por que 8000 amostras/s é suficiente?",
    options: [
      { id: "a", text: "64 kbps; 8000 amostras/s captura frequências até 4000 Hz, cobrindo a voz humana (300–3400 Hz)" },
      { id: "b", text: "8 kbps; 8000 amostras/s é padrão arbitrário definido pela ITU" },
      { id: "c", text: "64 kbps; 8000 amostras/s captura frequências até 16000 Hz" },
      { id: "d", text: "56 kbps; usa apenas 7 bits por amostra para bits de sinalização" },
    ],
    correctAnswer: "a",
    explanation:
      "Taxa = 8000 amostras/s × 8 bits/amostra = **64 kbps**. O teorema de Nyquist-Shannon de amostragem afirma: para reconstruir perfeitamente um sinal de largura de banda B Hz, são necessárias pelo menos 2B amostras por segundo. Voz humana relevante: 300–3400 Hz → canal de voz: 0–4000 Hz → mínimo de 8000 amostras/s. O padrão usa exatamente 8000 para margem de segurança e padronização internacional.",
    deepDive:
      "**PCM (Pulse Code Modulation)** — processo de 3 etapas:\n1. **Amostragem** (Sampling): captura o valor do sinal a cada 1/8000 s = 125 µs.\n2. **Quantização**: cada valor é mapeado para o inteiro mais próximo num conjunto de 2^n níveis. Com 8 bits: 256 níveis. O erro de quantização introduz ruído de quantização ≈ 1/2 LSB.\n3. **Codificação**: cada nível é representado em binário.\nO padrão norte-americano **DS-0** = 64 kbps por canal de voz. O **DS-1 (T1)** = 24 canais DS-0 + overhead = 1.544 Mbps. O padrão europeu **E1** = 30 canais + 2 de sinalização = 2.048 Mbps. O ruído de quantização pode ser reduzido com **compansão** (µ-law nos EUA, A-law na Europa) — compressão não linear que melhora SNR para sinais de baixa amplitude (como conversas sussurradas).",
    apostilaRef: "AP_CODICDADOS: Seção 5 (PCM, Amostragem, Quantização); AP_MULTIPLEX: TDM DS-1",
    keyTerms: ["PCM", "amostragem", "Nyquist", "quantização", "64 kbps", "DS-0", "compansão"],
    sourceExcerpt: "A voz humana tem faixa útil de até 4.000 Hz. Pelo teorema de Nyquist-Shannon de amostragem, são necessárias pelo menos 2 × 4000 = 8000 amostras por segundo. Com 8 bits/amostra: 8000 × 8 = 64.000 bps = 64 kbps por canal de voz (DS-0).",
  },

  // ─── MULTIPLEXAÇÃO ────────────────────────────────────────────────────
  {
    id: "mx-01",
    topic: "Multiplexação",
    subtopic: "FDM",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Em um sistema FDM com 12 canais de voz (cada um ocupando 4 kHz) e guardas-bandas de 0.5 kHz entre canais, qual é a largura de banda total necessária? Qual o problema que as guardas-bandas evitam?",
    options: [
      { id: "a", text: "48 kHz; sem guardas-bandas não há necessidade de banda extra" },
      { id: "b", text: "53.5 kHz; guardas-bandas evitam crosstalk entre canais adjacentes" },
      { id: "c", text: "52 kHz; guardas-bandas evitam interferência com canais não adjacentes" },
      { id: "d", text: "54 kHz; guardas-bandas duplicam a capacidade" },
    ],
    correctAnswer: "b",
    explanation:
      "12 canais × 4 kHz = 48 kHz de dados. Guardas-bandas: há 11 espaços entre 12 canais = 11 × 0.5 kHz = 5.5 kHz. Total = 48 + 5.5 = **53.5 kHz**. As guardas-bandas (guard bands) são faixas de frequência não utilizadas que separam canais adjacentes, evitando **crosstalk** — interferência causada por sobreposição de espectros devido a filtros imperfeitos e não idealidade dos equipamentos.",
    deepDive:
      "**FDM (Frequency Division Multiplexing)** — técnica analógica que divide o espectro em sub-bandas:\n- Cada canal é modulado para sua faixa de frequência via AM/SSB/FM.\n- Todos os sinais são transmitidos simultaneamente pelo mesmo meio.\n- Na telefonia clássica, o **Grupo Básico** = 12 canais de voz × 4 kHz = 48 kHz (banda 60–108 kHz). 5 Grupos Básicos = **Supergrupo** = 60 canais. 5 Supergrupos = **Mastergrupo** = 300 canais.\n- **Crosstalk**: energia de um canal 'vaza' para o canal vizinho — causado por não linearidade dos amplificadores e imperfeição dos filtros. Guard bands criam espaçamento mínimo.\n- **OFDM** (Orthogonal FDM): versão moderna onde subportadoras são matematicamente ortogonais — eliminam guard bands e aumentam eficiência. Usado em 802.11 Wi-Fi e LTE/5G.",
    apostilaRef: "AP_MULTIPLEX: Seções 1–3 (FDM, Grupos, Crosstalk, Guard Bands)",
    keyTerms: ["FDM", "crosstalk", "guard band", "multiplexação por frequência", "OFDM"],
    sourceExcerpt: "FDM: divide a largura de banda total em sub-bandas. Guardas-bandas (guard bands) são faixas de frequência não utilizadas que separam canais adjacentes para evitar crosstalk causado por não linearidade dos filtros e amplificadores.",
  },
  {
    id: "mx-02",
    topic: "Multiplexação",
    subtopic: "TDM e SONET",
    difficulty: "hard",
    type: "calculation",
    question:
      "O padrão DS-1 (T1) multiplexes 24 canais de voz PCM (DS-0 = 64 kbps cada). A taxa do DS-1 é 1.544 Mbps, não 24 × 64 kbps = 1.536 Mbps. De onde vêm os 8 kbps extras?",
    options: [
      { id: "a", text: "De bits de paridade adicionados a cada frame para correção de erros" },
      { id: "b", text: "De 1 bit de framing por frame — cada frame tem 193 bits, transmitidos 8000 vezes/segundo" },
      { id: "c", text: "De overhead de sinalização distribuído nos 24 canais" },
      { id: "d", text: "De bits de sincronização adicionados a cada byte" },
    ],
    correctAnswer: "b",
    explanation:
      "Cada **frame DS-1** contém: 24 canais × 8 bits = 192 bits de dados + **1 bit de framing** = **193 bits**. Frames por segundo = 8000 (taxa de amostragem PCM). Taxa total = 193 × 8000 = **1.544.000 bps = 1.544 Mbps**. O bit extra (F-bit) permite ao receptor identificar o início de cada frame — sem ele seria impossível saber qual octeto pertence a qual canal.",
    deepDive:
      "**Hierarquia TDM americana (PDH)**:\n- **DS-0**: 64 kbps (1 canal de voz)\n- **DS-1 (T1)**: 1.544 Mbps = 24 DS-0 + framing\n- **DS-2 (T2)**: 6.312 Mbps = 4 DS-1 + overhead de stuffing\n- **DS-3 (T3)**: 44.736 Mbps = 28 DS-1\n- **DS-4**: 274.176 Mbps\n\n**SONET** (Synchronous Optical NETwork) — padrão para fibra óptica:\n- **STS-1** (base): 51.84 Mbps\n- **STS-3 / OC-3**: 155.52 Mbps\n- **STS-12 / OC-12**: 622.08 Mbps\n- **STS-48 / OC-48**: 2.488 Gbps\n- **STS-192 / OC-192**: 9.953 Gbps\n\nSONET usa **TDM síncrono** — todos os elementos sincronizados por relógio atômico. Isso permite **add-drop multiplexing**: extrair/inserir um DS-1 sem demultiplexar toda a hierarquia. A diferença com o TDM assíncrono (PDH) é que o SONET usa **stuffing** controlado para ajustar pequenas diferenças de clock.",
    apostilaRef: "AP_MULTIPLEX: Seções 4–6 (TDM, DS-1, SONET, SDH, Hierarquia)",
    keyTerms: ["DS-1", "T1", "TDM", "framing bit", "SONET", "OC-3", "PCM", "hierarquia"],
    sourceExcerpt: "DS-1 (T1): 24 canais DS-0 × 8 bits + 1 bit de enquadramento (framing bit) = 193 bits por quadro. Taxa = 193 bits × 8.000 quadros/s = 1.544.000 bps = 1,544 Mbps. O bit de enquadramento permite ao receptor identificar o início de cada quadro.",
  },
  {
    id: "mx-03",
    topic: "Multiplexação",
    subtopic: "TDM Estatístico",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual a diferença fundamental entre TDM Síncrono e TDM Estatístico (ATDM) em termos de eficiência de banda?",
    options: [
      { id: "a", text: "TDM Síncrono é mais eficiente pois todos os slots são aproveitados" },
      { id: "b", text: "TDM Estatístico é mais eficiente pois aloca slots apenas a canais com dados a transmitir" },
      { id: "c", text: "São equivalentes em eficiência; diferem apenas em custo de implementação" },
      { id: "d", text: "TDM Estatístico desperdiça mais banda por incluir endereços nos pacotes" },
    ],
    correctAnswer: "b",
    explanation:
      "No **TDM Síncrono**, cada canal recebe um slot fixo em cada frame — mesmo quando não há dados, o slot fica vazio. Com N canais de dados bursty, até 70-80% dos slots podem ser desperdiçados. No **TDM Estatístico (ATDM)**, slots são alocados dinamicamente apenas a canais ativos, então a banda é utilizada com maior eficiência. A desvantagem: é necessário adicionar um cabeçalho (endereço do canal) a cada unidade de dados, adicionando overhead.",
    deepDive:
      "**TDM Síncrono**: frame de N slots, canal i sempre usa slot i. Simples, determinístico, sem overhead de endereçamento. Problema: ineficiente com tráfego variável (dados, web, e-mail).\n\n**TDM Estatístico** (também chamado de multiplexação por contention): slots alocados sob demanda. Cada unidade de dados carrega o ID do canal (ex: 4 bits para 16 canais). Overhead = endereço / (endereço + dados). Para slots de 1000 bits + 4 bits de endereço: overhead ≈ 0.4%. Permite **oversubscription**: vender 10 Mbps para 20 usuários que cada um usa em média 0.5 Mbps — estatisticamente eles raramente transmitem todos ao mesmo tempo. Isso é a base de todos os serviços de banda larga modernos (DSL, cabo, fibra FTTH) e está no coração dos switches ATM e roteadores IP.",
    apostilaRef: "AP_MULTIPLEX: Seção 3.3 (TDM Estatístico, ATDM, Eficiência)",
    keyTerms: ["TDM síncrono", "TDM estatístico", "ATDM", "oversubscription", "slot", "frame"],
    sourceExcerpt: "TDM Síncrono: cada canal recebe slot fixo em cada quadro — mesmo sem dados, o slot fica vazio. TDM Estatístico (ATDM): slots alocados dinamicamente apenas a canais ativos. Maior eficiência, mas exige cabeçalho de endereçamento em cada unidade de dados.",
  },

  // ─── CAMADA DE ENLACE ─────────────────────────────────────────────────
  {
    id: "ce-01",
    topic: "Camada de Enlace",
    subtopic: "Enquadramento",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "No enquadramento por bit-stuffing (como no HDLC), a sequência de delimitação de frame é '01111110'. Se os dados contiverem '011111011111101111110', qual é a sequência transmitida após o stuffing?",
    options: [
      { id: "a", text: "011111011111101111110 (sem alteração, pois não há 6 uns consecutivos)" },
      { id: "b", text: "0111110 1 11110 1 11111 0 0 (bit 0 inserido após cada sequência de cinco 1s consecutivos)" },
      { id: "c", text: "011111100111111001111100 (duplicar bytes com flag)" },
      { id: "d", text: "0111110111111011111100 (bit 0 inserido apenas no início de cada grupo de 6 uns)" },
    ],
    correctAnswer: "b",
    explanation:
      "No **bit-stuffing** do HDLC: sempre que o transmissor encontra 5 bits '1' consecutivos nos dados, insere automaticamente um bit '0'. O receptor, ao receber 5 uns seguidos de '0', remove o '0' (destuffing). Se receber 5 uns seguidos de '1' e depois '0' = flag '01111110' = delimitador de frame. Analisando os dados: '01111101' → após 5 uns ('11111'), insere '0' → '011111**0**1'. Continue: '11111' → '11111**0**'. O receptor sempre sabe: 5 uns + 0 = dado normal; 6 uns + 0 = flag.",
    deepDive:
      "**Métodos de Enquadramento**:\n1. **Contagem de caracteres**: campo no header indica tamanho do frame. Frágil — erro no campo corrompe todo o enquadramento.\n2. **Delimitadores com byte-stuffing** (BISYNC, PPP): flags especiais (DLE-STX/ETX ou 0x7E). Bytes de dados iguais ao flag são precedidos por byte de escape (DLE ou 0x7D). Se o próprio byte de escape aparecer nos dados, é duplicado.\n3. **Bit-stuffing** (HDLC): descrito acima. Independente de código de caracteres — funciona com qualquer dado binário.\n4. **Violação de código físico**: usa sinais inválidos como delimitadores (ex: Manchester não tem transição → usado como delimitador em 802.4).\n\n**HDLC** (High-level Data Link Control): protocolo de enlace síncrono. Frame: Flag | Endereço | Controle | Dados | FCS | Flag. O campo Controle contém número de sequência e tipo de frame (I, S, U). Origem do PPP que usa character-stuffing com flag 0x7E.",
    apostilaRef: "FRC_Camada_de_Enlace_Dados_LLC: Slides 3–15 (Enquadramento, Bit-stuffing, HDLC)",
    keyTerms: ["bit-stuffing", "HDLC", "enquadramento", "flag", "byte-stuffing", "DLE"],
    sourceExcerpt: "Bit Stuffing (HDLC): sempre que o transmissor encontra 5 bits '1' consecutivos nos dados, insere automaticamente um bit '0'. O receptor, ao receber 5 uns seguidos de '0', remove o bit inserido. 6 uns seguidos de '0' = flag de delimitação '01111110'.",
  },
  {
    id: "ce-02",
    topic: "Camada de Enlace",
    subtopic: "Controle de Erros",
    difficulty: "hard",
    type: "calculation",
    question:
      "Calcule o CRC-16 para a mensagem '110110011' usando o polinômio gerador CRC-CCITT (x¹⁶+x¹²+x⁵+1 = 10001000000100001 em binário). Qual é a divisão módulo-2 que produz o FCS?",
    options: [
      { id: "a", text: "O FCS é o resto da divisão da mensagem (com 16 zeros anexados) pelo polinômio gerador em aritmética módulo-2" },
      { id: "b", text: "O FCS é o resultado da multiplicação da mensagem pelo polinômio gerador" },
      { id: "c", text: "O FCS é a soma da mensagem com o polinômio gerador sem carry" },
      { id: "d", text: "O FCS é obtido pela tabela de lookup do CRC pré-calculado" },
    ],
    correctAnswer: "a",
    explanation:
      "**Processo CRC**: (1) Anexar r=16 zeros à mensagem M (M × xʳ). (2) Dividir M × xʳ pelo polinômio G em **aritmética módulo-2** (XOR, sem carry/borrow). (3) O resto R é o FCS de 16 bits. O transmissor envia M concatenado com R. O receptor divide (M || R) por G — se resto = 0, sem erro. CRC detecta todos erros em burst de até 16 bits, todos erros em número ímpar de bits, e todos erros em 2 bits isolados.",
    deepDive:
      "**Matemática do CRC**: Trata-se de aritmética polinomial em GF(2) (Galois Field de 2 elementos — 0 e 1). A adição em GF(2) é XOR; multiplicação é AND. Não existe subtração — XOR é sua própria inversa.\n\n**Propriedades de detecção**:\n- Todos os erros simples (1 bit)\n- Todos os erros duplos (se G tem 3+ termos)\n- Todos os erros em número ímpar de bits (se G contém (x+1) como fator)\n- Todos os bursts de erro de comprimento ≤ grau de G\n- Fração (1 − 2^{-r}) de bursts de comprimento r+1\n- Fração (1 − 2^{-r}) de todos os bursts mais longos\n\n**Polinômios padrão**:\n- **CRC-16**: x¹⁶+x¹⁵+x²+1 — usado em Modbus, USB\n- **CRC-CCITT**: x¹⁶+x¹²+x⁵+1 — usado em HDLC, PPP, X.25\n- **CRC-32**: x³²+x²⁶+x²³+...+1 — usado em Ethernet, ZIP\n- **CRC-ITU**: similar ao CCITT com inicialização em 0xFFFF\n\nImplementação eficiente: tabela de 256 entradas pre-calculada, 1 byte processado por iteração = O(n).",
    apostilaRef: "FRC_Camada_de_Enlace_Dados_LLC: Slides 20–35 (CRC, FCS, Polinômios, Detecção de Erros)",
    keyTerms: ["CRC", "FCS", "polinômio gerador", "módulo-2", "GF(2)", "burst de erro", "HDLC"],
    sourceExcerpt: "CRC-CCITT: polinômio gerador x¹⁶ + x¹² + x⁵ + 1. Processo: (1) Anexar r zeros à mensagem M. (2) Dividir M×xʳ pelo polinômio G em aritmética módulo-2 (XOR, sem carry). (3) O resto R é o FCS transmitido. Receptor divide (M‖R) por G — resto zero indica sem erro.",
  },
  {
    id: "ce-03",
    topic: "Camada de Enlace",
    subtopic: "Controle de Fluxo",
    difficulty: "hard",
    type: "calculation",
    question:
      "Em um protocolo Sliding Window Go-Back-N com janela de transmissão W=7 (números de sequência 0–7, logo 3 bits), o transmissor enviou frames 0,1,2,3,4,5,6,0. O receptor descartou o frame 3 (erro). O que acontece e quantos frames são retransmitidos?",
    options: [
      { id: "a", text: "Apenas o frame 3 é retransmitido (Selective Repeat); 1 frame retransmitido" },
      { id: "b", text: "Frames 3,4,5,6,0 são retransmitidos (Go-Back-N retransmite do erro em diante); 5 frames retransmitidos" },
      { id: "c", text: "Frames 3,4,5,6 são retransmitidos; o frame 0 já foi ACKed" },
      { id: "d", text: "O receptor envia NAK e o transmissor para de enviar até receber ACK" },
    ],
    correctAnswer: "b",
    explanation:
      "No **Go-Back-N (GBN)**: quando o receptor detecta erro no frame N, descarta esse frame e todos os subsequentes (mesmo que corretos). Envia NAK(3). O transmissor recebe o NAK (ou timeout de ACK3) e retransmite a partir do frame 3: retransmite 3,4,5,6,0 = **5 frames**. O receptor descartou frames 4,5,6,0 (mesmo corretos) por serem fora de ordem — GBN não possui buffer no receptor para frames fora de ordem.",
    deepDive:
      "**Comparação dos protocolos de janela deslizante**:\n\n**Stop-and-Wait** (W=1):\n- Eficiência: η = 1/(1+2a), a = Tp/Tf (Tp=propagação, Tf=transmissão)\n- Para link satelital: a ≈ 270ms/10ms = 27 → η ≈ 1/55 ≈ 1.8%! Péssimo.\n\n**Go-Back-N**:\n- W ≤ 2^n − 1 (com n bits de sequência). Por quê? Se W=2^n, após 2^n frames o ACK0 poderia ser confundido com ACK do novo frame 0.\n- Em caso de erro: retransmite W frames no pior caso.\n- Eficiência: η = W/(1+2a) se W < 1+2a; senão η = 1.\n- Receptor: janela de tamanho 1 (sem buffer).\n\n**Selective Repeat (SR)**:\n- W ≤ 2^(n-1) (metade do espaço de sequências)\n- Retransmite apenas o frame com erro.\n- Receptor: janela de tamanho W, precisa de buffer.\n- Mais complexo mas muito mais eficiente em links ruidosos.\n\n**Piggybacking**: ACKs podem ser incluídos nos frames de dados da direção oposta, economizando frames de controle separados.",
    apostilaRef: "FRC_Camada_de_Enlace_Dados_LLC: Slides 40–65 (Stop-and-Wait, GBN, SR, Eficiência)",
    keyTerms: ["Go-Back-N", "Selective Repeat", "sliding window", "piggybacking", "número de sequência", "NAK"],
    sourceExcerpt: "Go-back-N: pede-se a retransmissão de todos os quadros desde o de número N que teve erro, mesmo que os subsequentes tenham chegado corretamente. O receptor descarta quadros fora de ordem (janela de recepção JR = 1). Piggybacking: ACKs embutidos nos frames de dados da direção oposta.",
  },
  {
    id: "ce-04",
    topic: "Camada de Enlace",
    subtopic: "PPP e HDLC",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual é a diferença entre os protocolos PPP e SLIP em termos de funcionalidades oferecidas?",
    options: [
      { id: "a", text: "SLIP suporta múltiplos protocolos de rede e autenticação; PPP é mais simples" },
      { id: "b", text: "PPP suporta múltiplos protocolos, autenticação (PAP/CHAP), negociação de opções via LCP/NCP e detecção de erros; SLIP suporta apenas IP e não tem autenticação" },
      { id: "c", text: "São equivalentes; PPP é apenas a versão mais recente do SLIP" },
      { id: "d", text: "SLIP usa bit-stuffing e PPP usa byte-stuffing" },
    ],
    correctAnswer: "b",
    explanation:
      "**PPP** (Point-to-Point Protocol) é muito mais completo que **SLIP** (Serial Line IP). PPP oferece: (1) Enquadramento com byte-stuffing (flag 0x7E), (2) suporte a múltiplos protocolos via campo de protocolo de 2 bytes, (3) **LCP** (Link Control Protocol) para negociar opções do enlace, (4) **NCP** (Network Control Protocol) para configurar protocolos de rede (IPCP para IP), (5) autenticação via **PAP** (senha em claro) ou **CHAP** (desafio-resposta). SLIP suporta apenas IP e não tem detecção de erros nem autenticação.",
    deepDive:
      "**Estrutura do frame PPP**: Flag (0x7E) | Endereço (0xFF) | Controle (0x03) | Protocolo (2B) | Dados | FCS (2-4B) | Flag.\n\n**LCP** (Link Control Protocol): negocia parâmetros do enlace — MRU (Maximum Receive Unit), protocolo de autenticação, compressão, número mágico (detecção de loopback).\n\n**NCP** (Network Control Protocol): família de protocolos para cada protocolo de rede. **IPCP** configura endereço IP, compressão de cabeçalho. **IPV6CP** para IPv6.\n\n**Autenticação PPP**:\n- **PAP** (Password Authentication Protocol): envia senha em claro — inseguro.\n- **CHAP** (Challenge Handshake Authentication Protocol): servidor envia desafio aleatório; cliente responde com HMAC(senha, desafio). Nunca a senha é transmitida.\n\nPPP é a base do **PPPoE** (PPP over Ethernet) usado em DSL residencial — permite autenticação e contabilização sobre Ethernet.",
    apostilaRef: "FRC_Camada_de_Enlace_Dados_LLC: Slides 70–85 (PPP, SLIP, LCP, NCP, Autenticação)",
    keyTerms: ["PPP", "SLIP", "LCP", "NCP", "CHAP", "PAP", "byte-stuffing", "PPPoE"],
    sourceExcerpt: "PPP: utiliza LCP (Link Control Protocol) para negociar parâmetros do enlace e NCP (Network Control Protocol) para configurar protocolos de rede. Autenticação via PAP (senha em claro) ou CHAP (desafio-resposta). SLIP: suporta apenas IP, sem autenticação ou detecção de erros.",
  },
  {
    id: "ce-05",
    topic: "Camada de Enlace",
    subtopic: "LLC e MAC",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Na arquitetura IEEE 802, qual é a distinção entre LLC (Logical Link Control) e MAC (Medium Access Control)?",
    options: [
      { id: "a", text: "LLC controla acesso ao meio físico; MAC gerencia o enquadramento lógico" },
      { id: "b", text: "LLC (subcamada superior) fornece interface uniforme às camadas superiores e controle de fluxo/erros; MAC (subcamada inferior) controla acesso ao meio compartilhado e define endereçamento físico" },
      { id: "c", text: "São equivalentes — IEEE 802 usa apenas uma camada de enlace" },
      { id: "d", text: "MAC é camada de software; LLC é implementada em hardware (NIC)" },
    ],
    correctAnswer: "b",
    explanation:
      "O IEEE 802 divide a camada de enlace em duas subcamadas: **LLC** (Logical Link Control, 802.2) fica acima e fornece interface padronizada para a camada de rede independente da tecnologia de acesso ao meio. Oferece três tipos de serviço: sem conexão sem ACK, sem conexão com ACK, orientado a conexão. **MAC** (Medium Access Control) fica abaixo e é específica para cada tecnologia: 802.3 (Ethernet), 802.11 (Wi-Fi), 802.15 (Bluetooth). MAC define o endereço físico (MAC address de 48 bits) e a política de acesso ao meio (CSMA/CD, CSMA/CA, Token Ring).",
    deepDive:
      "**Subcamada LLC (IEEE 802.2)**:\n- Define PDU (Protocol Data Unit) com DSAP, SSAP (Destination/Source Service Access Point) e campos de controle.\n- Tipo 1: connectionless, sem ACK (usado em IP sobre Ethernet).\n- Tipo 2: orientado a conexão com controle de erro e fluxo.\n- Tipo 3: connectionless com ACK (para aplicações críticas).\n\n**Subcamada MAC**:\n- **Ethernet (802.3)**: CSMA/CD. Frame: Preâmbulo(7B) | SFD(1B) | DST(6B) | SRC(6B) | Tipo/Tamanho(2B) | Dados(46-1500B) | FCS(4B). Tamanho mínimo: 64 bytes (garantia de detecção de colisão).\n- **Wi-Fi (802.11)**: CSMA/CA com ACK explícito e RTS/CTS opcional.\n\n**Endereço MAC**: 48 bits = 6 bytes em hexadecimal (ex: AA:BB:CC:11:22:33). 3 primeiros bytes = OUI (Organizationally Unique Identifier), atribuído pelo IEEE ao fabricante. Bit I/G: unicast(0) ou multicast/broadcast(1). Bit U/L: universalmente(0) ou localmente(1) administrado.",
    apostilaRef: "FRC_Camada_de_Enlace_Dados_LLC: Slides 1–10 (LLC, MAC, IEEE 802); FRC2026_1_ENLACE_DADOS",
    keyTerms: ["LLC", "MAC", "IEEE 802", "CSMA/CD", "CSMA/CA", "endereço MAC", "subcamada"],
    sourceExcerpt: "A IEEE 802 divide a camada de enlace em duas subcamadas: LLC (Logical Link Control, 802.2) — fornece interface uniforme às camadas superiores, independente da tecnologia de acesso; MAC (Medium Access Control) — controla acesso ao meio compartilhado e define endereçamento físico (48 bits).",
  },

  // ─── COMUTAÇÃO DE CIRCUITOS ───────────────────────────────────────────
  {
    id: "cc-01",
    topic: "Comutação de Circuitos",
    subtopic: "Fases e Estrutura",
    difficulty: "easy",
    type: "multiple-choice",
    question:
      "A comutação de circuitos ocorre em 3 fases sequenciais. Em qual fase os recursos (largura de banda, buffers, tabelas de roteamento) são alocados, e o que acontece se a rede não tiver recursos suficientes?",
    options: [
      { id: "a", text: "Na fase de transferência de dados; a conexão é degradada automaticamente" },
      { id: "b", text: "Na fase de estabelecimento (setup); a conexão é recusada (busy signal)" },
      { id: "c", text: "Na fase de liberação (teardown); os recursos são realocados dinamicamente" },
      { id: "d", text: "Na fase de transferência; o roteamento dinâmico encontra um caminho alternativo" },
    ],
    correctAnswer: "b",
    explanation:
      "Na **fase de estabelecimento** (setup/call setup): a rede reserva recursos dedicados ao longo de todo o caminho entre origem e destino. Se qualquer nó intermediário não tiver recursos disponíveis (banda, slots TDM, buffers), a chamada é **recusada** — o usuário recebe sinal de ocupado. Uma vez estabelecido, o circuito garante QoS fixo durante toda a comunicação. As três fases são: (1) **Estabelecimento**, (2) **Transferência de dados**, (3) **Liberação**.",
    deepDive:
      "**Comutação de Circuitos** — características:\n- **Recursos dedicados**: banda alocada mesmo durante silêncio (em voz, ~60% do tempo é silêncio!)\n- **Atraso fixo e previsível**: ideal para voz/vídeo em tempo real.\n- **Setup overhead**: alguns segundos para estabelecer antes de transmitir.\n- **Exemplos**: PSTN (rede telefônica), GSM (voz).\n\n**Tipos de comutadores de circuito**:\n\n**Comutação Espacial (Space Division)**:\n- **Crosspoint switch**: matriz N×N de pontos de cruzamento. N=1000 → 10⁶ crosspoints — inviável para N grande.\n- **Comutador multi-estágio** (Clos): divide em 3 estágios (entrada→middle→saída). Reduz crosspoints de N² para ~4N^{3/2}. **Bloqueante** (pode recusar conexão mesmo com saída livre) ou **não-bloqueante** (teorema de Clos: com k≥2n-1 switches no estágio médio, sempre há caminho).\n\n**Comutação Temporal (Time Division)**:\n- Slots de tempo alocados para cada circuito.\n- **TST** (Time-Space-Time): mais comum em switches digitais.\n\n**Roteamento em circuitos**:\n- **Estático**: fixo, pré-configurado.\n- **Alternante**: usa rota alternativa se a principal está ocupada.\n- **DTM** (Dynamic Traffic Management / Roteamento Adaptativo): escolhe rota com base no estado atual da rede.",
    apostilaRef: "AP_CCIRCUITOS: Seções 1–4 (Fases, Crosspoint, Multi-estágio, Roteamento)",
    keyTerms: ["comutação de circuitos", "setup", "teardown", "crosspoint", "Clos", "DTM", "sinalização"],
    sourceExcerpt: "Comutação de Circuitos: três fases — (1) Estabelecimento: recursos (banda, slots TDM) são reservados ao longo de todo o caminho. Se recursos insuficientes, a chamada é recusada. (2) Transferência de dados: circuito dedicado garante QoS fixo. (3) Liberação: recursos são devolvidos à rede.",
  },
  {
    id: "cc-02",
    topic: "Comutação de Circuitos",
    subtopic: "Sinalização",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual a diferença entre sinalização **in-band** e **CCS** (Common Channel Signaling) e por que o CCS (SS7) substituiu a sinalização in-band nas redes modernas?",
    options: [
      { id: "a", text: "In-band é mais segura; CCS usa o mesmo canal que os dados" },
      { id: "b", text: "In-band usa o mesmo canal de voz para sinalização (sujeita a fraude); CCS usa canal dedicado separado (mais seguro, mais rápido, mais funcional)" },
      { id: "c", text: "CCS é obsoleta; in-band é o padrão moderno" },
      { id: "d", text: "São equivalentes tecnicamente; diferem apenas no protocolo usado" },
    ],
    correctAnswer: "b",
    explanation:
      "**Sinalização in-band**: informações de controle (discagem, ocupado, desconexão) são transmitidas pelo mesmo canal de voz, nos mesmos 4 kHz. Problema: hackers podiam usar tons de controle (ex: 2600 Hz da AT&T) para fraudar chamadas — era a técnica dos 'phreakers'. **CCS** (Common Channel Signaling / SS7): usa um canal de dados separado (64 kbps) para toda a sinalização de um grupo de circuitos. Mais rápido (setup em <1s), mais seguro, permite serviços avançados (CLIP, call-waiting, SMS, roaming GSM).",
    deepDive:
      "**SS7 (Signaling System 7)** — arquitetura:\n- **STP** (Signal Transfer Point): roteador de mensagens SS7.\n- **SSP** (Service Switching Point): central telefônica com SS7.\n- **SCP** (Service Control Point): banco de dados de serviços (número 0800, portabilidade numérica).\n\n**Protocolo SS7**: pilha com camadas MTP1/2/3 (Message Transfer Part) → SCCP (Signaling Connection Control Part) → TCAP (Transaction Capabilities Application Part) → serviços (ISUP, MAP, INAP).\n\n**Phreaking**: John Draper ('Captain Crunch') descobriu que apito de brinquedo de cereal gerava tom de 2600 Hz — exatamente o tom de supervisão da AT&T — permitindo fazer chamadas gratuitas. Isso motivou a criação do CCS.\n\n**VoIP moderno**: usa **SIP** (Session Initiation Protocol) para sinalização, substituindo SS7 em redes IP.",
    apostilaRef: "AP_CCIRCUITOS: Seção 5 (Sinalização, In-band, CCS, SS7)",
    keyTerms: ["sinalização in-band", "CCS", "SS7", "STP", "SSP", "phreaking", "SIP"],
    sourceExcerpt: "Sinalização in-band: usa parte da banda do canal de voz para transmitir informações de controle — vulnerável a fraude (phreaking). CCS (Common Channel Signaling / SS7): canal separado e dedicado de 64 kbps para sinalização de um grupo de circuitos — mais rápido, seguro e funcional.",
  },

  // ─── COMUTAÇÃO DE PACOTES ─────────────────────────────────────────────
  {
    id: "cp-01",
    topic: "Comutação de Pacotes",
    subtopic: "Datagrama vs Circuito Virtual",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Em redes de comutação de pacotes, qual a diferença entre o serviço de **datagrama** e o de **circuito virtual**, especialmente em relação ao roteamento e à garantia de entrega?",
    options: [
      { id: "a", text: "Datagrama é orientado a conexão; circuito virtual é connectionless" },
      { id: "b", text: "Datagrama: pacotes roteados independentemente, podem chegar fora de ordem, sem garantia; Circuito virtual: caminho fixo estabelecido, pacotes chegam em ordem, com QoS negociado" },
      { id: "c", text: "São equivalentes; diferem apenas no protocolo de transporte" },
      { id: "d", text: "Circuito virtual não reserva recursos; datagrama reserva bandwidth por fluxo" },
    ],
    correctAnswer: "b",
    explanation:
      "**Datagrama** (como IP): cada pacote carrega endereço completo, roteado independentemente. Pacotes de um mesmo fluxo podem seguir rotas diferentes, chegar fora de ordem ou ser perdidos. Rede não mantém estado por fluxo. **Circuito Virtual** (como ATM, X.25, Frame Relay): fase de setup estabelece caminho e aloca recursos (ou apenas estado nas tabelas). Pacotes seguem o mesmo caminho, chegam em ordem, com QoS previsível. Identificado por VCI/VPI (Virtual Circuit Identifier).",
    deepDive:
      "**Comparação detalhada**:\n\n| Característica | Datagrama | Circuito Virtual |\n|---|---|---|\n| Setup | Não | Sim |\n| Estado no roteador | Não por fluxo | Sim (tabela VCI) |\n| Endereço no pacote | Completo (32+ bits) | Curto (VCI, 8-16 bits) |\n| Roteamento | Independente por pacote | Fixo após setup |\n| Ordem de entrega | Não garantida | Garantida |\n| Falha de nó | Pacotes redirecionados | Circuito interrompido |\n| QoS | Difícil | Negociado no setup |\n\n**Tipos de Circuito Virtual**:\n- **PVC** (Permanent Virtual Circuit): configurado manualmente, sempre ativo. Ex: Frame Relay PVC.\n- **SVC** (Switched Virtual Circuit): estabelecido sob demanda, liberado ao fim. Ex: ATM SVC.\n\n**Store-and-Forward**: em ambos os casos, cada nó recebe o pacote/célula completo, verifica integridade (FCS) e então encaminha. Isso introduz atraso de serialização em cada nó.",
    apostilaRef: "AP_CPACOTES: Seções 1–3 (Datagrama, Circuito Virtual, Store-and-Forward)",
    keyTerms: ["datagrama", "circuito virtual", "VCI", "PVC", "SVC", "store-and-forward", "ATM"],
    sourceExcerpt: "Datagrama: cada pacote carrega endereço completo de destino e é roteado independentemente — pacotes de um mesmo fluxo podem chegar fora de ordem. Circuito Virtual: fase de setup estabelece caminho fixo (VCI/VPI); pacotes chegam em ordem com QoS negociado; menor overhead de endereçamento por pacote.",
  },
  {
    id: "cp-02",
    topic: "Comutação de Pacotes",
    subtopic: "Algoritmos de Roteamento",
    difficulty: "hard",
    type: "multiple-choice",
    question:
      "O algoritmo de Dijkstra é usado para encontrar o caminho mais curto. Se aplicado ao algoritmo de estado de enlace (OSPF), qual é a complexidade e o que acontece quando um enlace muda de estado?",
    options: [
      { id: "a", text: "O(N³) para N nós; quando um enlace muda, apenas os vizinhos são notificados" },
      { id: "b", text: "O(N²) para N nós com lista simples, ou O(E·log N) com heap; quando um enlace muda, flooding de LSA é feito e todos os nós recalculam a árvore SPF" },
      { id: "c", text: "O(N) para N nós; quando um enlace muda, apenas o roteador afetado atualiza sua tabela" },
      { id: "d", text: "O(2^N) para N nós; por isso OSPF é limitado a redes pequenas" },
    ],
    correctAnswer: "b",
    explanation:
      "Dijkstra tem complexidade **O(N²)** com lista de adjacência simples, ou **O(E·log N)** com fila de prioridade (heap). No OSPF (link-state): cada roteador mantém mapa completo da rede (LSDB). Quando um enlace muda, o roteador gera um **LSA** (Link State Advertisement) com número de sequência incrementado, que é propagado por **flooding controlado** a todos os roteadores. Cada roteador recalcula a **árvore SPF** (Shortest Path First = Dijkstra) e atualiza sua tabela de roteamento.",
    deepDive:
      "**Algoritmos de Roteamento**:\n\n**1. Shortest Path (Dijkstra / Link-State)**:\n- Cada nó conhece a topologia completa da rede.\n- Executa Dijkstra localmente para calcular melhores rotas.\n- **OSPF** (Open Shortest Path First): protocolo padrão IP para intra-domínio.\n- Convergência rápida, mas requer mais memória e CPU.\n\n**2. Distance Vector (Bellman-Ford)**:\n- Cada nó conhece apenas distâncias para vizinhos.\n- Troca vetores de distância com vizinhos periodicamente.\n- **RIP** (Routing Information Protocol): métrica = número de saltos, máx. 15 (16=infinito).\n- Problema: **count-to-infinity** — falha de enlace pode demorar muito para convergir.\n- Solução parcial: **split horizon** (não anuncia rota de volta para quem aprendeu).\n\n**3. Flooding**:\n- Cada pacote é reenviado por todas as interfaces exceto a de chegada.\n- Garante entrega, mas gera carga exponencial. Usado em roteamento de emergência e em protocolos de descoberta.\n\n**4. Hot-Potato Routing**: roteador despacha pacote o mais rápido possível pela fila menos carregada, sem considerar rota global — minimiza atraso local.",
    apostilaRef: "AP_CPACOTES: Seções 4–6 (Dijkstra, Distance Vector, RIP, OSPF, Flooding)",
    keyTerms: ["Dijkstra", "OSPF", "link-state", "distance vector", "RIP", "LSA", "SPF", "flooding", "count-to-infinity"],
    sourceExcerpt: "OSPF (Open Shortest Path First): protocolo link-state intra-domínio. Cada roteador mantém mapa completo da rede (LSDB). Quando enlace muda: gera LSA (Link State Advertisement) com número de sequência incrementado, propagado por flooding controlado. Todos os roteadores recalculam árvore SPF com Dijkstra.",
  },
  {
    id: "cp-03",
    topic: "Comutação de Pacotes",
    subtopic: "RIP",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "No protocolo RIP v2, qual é a métrica utilizada e qual é o máximo de saltos permitido? Por que esse limite existe?",
    options: [
      { id: "a", text: "Métrica: largura de banda; máximo: 255 saltos" },
      { id: "b", text: "Métrica: número de saltos (hop count); máximo: 15 (16 = inalcançável). Limite evita loops infinitos no problema de count-to-infinity" },
      { id: "c", text: "Métrica: atraso; máximo: 100 saltos" },
      { id: "d", text: "Métrica: custo configurável; máximo: 65535" },
    ],
    correctAnswer: "b",
    explanation:
      "RIP usa **número de saltos** como métrica — simples de calcular, mas ignora largura de banda. O limite de **15 saltos** (16 = infinito/inalcançável) serve para detectar e limitar o problema de **count-to-infinity**: quando uma rota falha, roteadores podem incrementar a distância indefinidamente em loop. Com o limite, após 16, a rota é declarada inválida e removida. O RIP envia atualizações completas de sua tabela a cada **30 segundos** em broadcast/multicast.",
    deepDive:
      "**RIP v1 vs v2**:\n- RIPv1: classful (sem máscara de sub-rede nas mensagens), broadcast.\n- RIPv2: classless (inclui máscara), multicast (224.0.0.9), autenticação.\n\n**Timers do RIP**:\n- **Update**: 30s — envia tabela completa aos vizinhos.\n- **Invalid**: 180s — se não recebe atualização, marca rota como inválida (métrica=16).\n- **Flush**: 240s — remove rota da tabela.\n- **Holddown**: 180s — não aceita novas informações sobre rota inválida (evita instabilidade).\n\n**Problemas do RIP**:\n- Lenta convergência (pode levar minutos em redes grandes).\n- Count-to-infinity (mitigado por split horizon e poison reverse).\n- Métrica simplista ignora largura de banda e atraso.\n- Limite de 15 saltos torna inadequado para redes grandes.\n\n**OSPF** (RFC 2328) substitui RIP em redes modernas por ser mais rápido, escalável e usar custo baseado em largura de banda.",
    apostilaRef: "AP_CPACOTES: Seção 5.2 (RIP, Distance Vector, Convergência)",
    keyTerms: ["RIP", "hop count", "count-to-infinity", "split horizon", "poison reverse", "OSPF", "convergência"],
    sourceExcerpt: "RIP: utiliza número de saltos (hop count) como métrica. Máximo de 15 saltos (16 = infinito = inalcançável). Limite evita loops infinitos no problema de count-to-infinity. Envia tabela completa a cada 30 s. Split horizon: não anuncia rota de volta para quem a aprendeu.",
  },

  // ─── REDES E ENDEREÇAMENTO ────────────────────────────────────────────
  {
    id: "re-01",
    topic: "Redes e Endereçamento",
    subtopic: "Sub-redes e CIDR",
    difficulty: "hard",
    type: "calculation",
    question:
      "Uma organização recebeu o bloco 192.168.10.0/24 e precisa criar 6 sub-redes com pelo menos 25 hosts cada. Qual máscara deve usar e quantas sub-redes/hosts ficam disponíveis?",
    options: [
      { id: "a", text: "/26 (255.255.255.192): 4 sub-redes de 62 hosts cada — insuficiente" },
      { id: "b", text: "/27 (255.255.255.224): 8 sub-redes de 30 hosts cada — adequado" },
      { id: "c", text: "/28 (255.255.255.240): 16 sub-redes de 14 hosts — insuficiente para 25 hosts" },
      { id: "d", text: "/25 (255.255.255.128): 2 sub-redes de 126 hosts — insuficiente para 6 redes" },
    ],
    correctAnswer: "b",
    explanation:
      "Para 25+ hosts: precisamos de pelo menos 2⁵=32 endereços por sub-rede → 5 bits para hosts → máscara /27 (32-5=27 bits de rede). Com /27 em um /24: 2³=8 sub-redes disponíveis ≥ 6 necessárias ✓. Cada sub-rede: 2⁵=32 endereços, 32-2=**30 hosts** utilizáveis (excluindo rede e broadcast) ≥ 25 ✓. Sub-redes: 192.168.10.0/27, .32/27, .64/27, .96/27, .128/27, .160/27, .192/27, .224/27.",
    deepDive:
      "**Cálculo de sub-redes (VLSM)**:\n1. Requisito de hosts → bits necessários: 2^h - 2 ≥ hosts_req → h = ⌈log₂(hosts+2)⌉\n2. Bits de sub-rede: s = 32 - prefixo_original - h\n3. Número de sub-redes: 2^s\n4. Endereços por sub-rede: 2^h\n\n**CIDR** (Classless Inter-Domain Routing, RFC 1519): eliminou as classes A/B/C rígidas. Notação /prefix onde prefix = bits de rede.\n\n**Endereços especiais em cada sub-rede**:\n- Primeiro endereço (todos bits host = 0): endereço de **rede** — não atribuível.\n- Último endereço (todos bits host = 1): **broadcast** — não atribuível.\n\n**VLSM** (Variable Length Subnet Masking): sub-redes de tamanhos diferentes na mesma organização — mais eficiente. Ex: rede ponto-a-ponto entre roteadores usa /30 (2 hosts).\n\n**RFC 1918 (IPs privados)**:\n- 10.0.0.0/8 (classe A)\n- 172.16.0.0/12 (classes B)\n- 192.168.0.0/16 (classes C)\nNão roteáveis na Internet — usam NAT para saída.",
    apostilaRef: "FRC2026_1_lista_exerc01: Questões 1–5 (Sub-redes, VLSM, CIDR); AP_TXDADOS: IPv4",
    keyTerms: ["sub-rede", "CIDR", "VLSM", "máscara", "broadcast", "RFC 1918", "hosts utilizáveis"],
    sourceExcerpt: "CIDR (Classless Inter-Domain Routing): elimina as classes rígidas A/B/C. Para 25+ hosts: necessita 2⁵ = 32 endereços por sub-rede → 5 bits de host → máscara /27. Com /27 em um /24: 2³ = 8 sub-redes disponíveis, cada uma com 30 hosts utilizáveis (32 − 2 = 30).",
  },
  {
    id: "re-02",
    topic: "Redes e Endereçamento",
    subtopic: "NAT",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual a diferença entre SNAT (Source NAT) e DNAT (Destination NAT) e quando cada um é usado?",
    options: [
      { id: "a", text: "SNAT muda o IP de destino; DNAT muda o IP de origem" },
      { id: "b", text: "SNAT muda o IP de origem (saída da LAN para Internet); DNAT muda o IP de destino (redireciona tráfego de entrada para servidor interno)" },
      { id: "c", text: "São equivalentes; diferem apenas na direção do tráfego" },
      { id: "d", text: "SNAT é estático; DNAT é dinâmico (PAT)" },
    ],
    correctAnswer: "b",
    explanation:
      "**SNAT** (Source NAT): modifica o IP de **origem** dos pacotes. Usado quando dispositivos de rede privada (ex: 192.168.1.x) acessam a Internet — o roteador substitui o IP privado pelo seu IP público. Permite múltiplos dispositivos compartilharem um IP público. **DNAT** (Destination NAT): modifica o IP de **destino**. Usado para redirecionar tráfego de entrada — ex: requisições na porta 80 do IP público são direcionadas para servidor web interno (192.168.1.10:80). Também chamado de **port forwarding**.",
    deepDive:
      "**PAT** (Port Address Translation) / **NAT overload**: forma mais comum de SNAT. Usa tanto IP quanto porta para manter múltiplas conexões simultâneas com o mesmo IP público. Tabela NAT armazena {IP_privado:porta_priv → IP_público:porta_pub}.\n\n**NAT e problemas**:\n- Viola o princípio fim-a-fim da Internet (conexões não podem ser iniciadas de fora).\n- Complica protocolos que embutem IPs nos dados (FTP ativo, SIP, H.323) — requerem **ALG** (Application Layer Gateway).\n- NAT é workaround para escassez de IPv4 — IPv6 elimina a necessidade.\n\n**IPv6 e NAT**: com 128 bits de endereço (3.4×10³⁸), cada dispositivo pode ter IP globalmente único. NAT é desnecessário (mas ainda usado em IPv6 por política, não escassez).\n\n**Tipos de NAT (RFC 3489 — STUN)**:\n- **Full Cone**: qualquer externo pode enviar ao endereço mapeado.\n- **Restricted Cone**: apenas IPs que o interno já contactou.\n- **Port Restricted**: apenas IP:porta que o interno já contactou.\n- **Symmetric**: mapeamento diferente para cada destino externo — mais difícil para P2P.",
    apostilaRef: "FRC2026_1_lista_exerc01: Questão NAT; Conceitos de Redes",
    keyTerms: ["SNAT", "DNAT", "PAT", "NAT", "port forwarding", "ALG", "IPv6", "RFC 1918"],
    sourceExcerpt: "SNAT (Source NAT): modifica o endereço IP de origem — usado quando dispositivos de rede privada acessam a Internet. DNAT (Destination NAT): modifica o IP de destino — redireciona tráfego de entrada para servidores internos (port forwarding). PAT usa IP + porta para múltiplas conexões simultâneas.",
  },
  {
    id: "re-03",
    topic: "Redes e Endereçamento",
    subtopic: "ARP",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Como o ARP (Address Resolution Protocol) funciona e por que ele é necessário mesmo quando já temos endereços IP?",
    options: [
      { id: "a", text: "ARP converte nomes DNS em endereços IP; necessário porque IP não funciona sem DNS" },
      { id: "b", text: "ARP mapeia endereços IP em endereços MAC; necessário porque frames Ethernet usam MAC (48 bits) para entrega na mesma rede local, não IP" },
      { id: "c", text: "ARP mapeia endereços MAC em IPs; necessário para comunicação entre sub-redes" },
      { id: "d", text: "ARP resolve conflitos de IP duplicado; broadcast na rede para verificar unicidade" },
    ],
    correctAnswer: "b",
    explanation:
      "**ARP** resolve o mismatch entre o endereçamento lógico (IP, 32 bits) e o endereçamento físico (MAC, 48 bits) da camada de enlace. Para enviar um pacote IP a 192.168.1.5, a camada de enlace precisa do MAC de 192.168.1.5. ARP envia broadcast Ethernet 'Quem tem 192.168.1.5? Me diga, 192.168.1.1'. O destino responde com seu MAC. O resultado é cacheado (ARP cache) por alguns minutos.",
    deepDive:
      "**Processo ARP detalhado**:\n1. A quer enviar para IP_B na mesma sub-rede.\n2. A verifica ARP cache — MAC_B não encontrado.\n3. A transmite **ARP Request** em broadcast (FF:FF:FF:FF:FF:FF) com IP_B.\n4. Todos na sub-rede recebem; apenas B responde com **ARP Reply** unicast contendo MAC_B.\n5. A armazena {IP_B → MAC_B} no ARP cache (tipicamente 20 min).\n6. A encapsula pacote IP em frame Ethernet com DST=MAC_B.\n\n**ARP Proxy**: roteador responde a ARPs de hosts em outra sub-rede — usado quando hosts não conhecem máscara de sub-rede.\n\n**Gratuitous ARP**: host envia ARP Request com IP_origem = IP_destino = próprio IP. Usado para: (1) detectar IPs duplicados, (2) atualizar caches ARP (ex: após mudança de NIC), (3) alta disponibilidade (failover — novo servidor assume o MAC do antigo).\n\n**ARP Spoofing/Poisoning**: ataque onde um host envia ARP Replies falsos, associando seu MAC com o IP da vítima. Permite ataques man-in-the-middle. Mitigação: Dynamic ARP Inspection (DAI) em switches gerenciáveis.",
    apostilaRef: "FRC2026_1_lista_exerc01: Questão ARP; Conceitos de Enlace",
    keyTerms: ["ARP", "MAC", "ARP cache", "ARP Request", "ARP Reply", "broadcast", "ARP spoofing", "Gratuitous ARP"],
    sourceExcerpt: "ARP (Address Resolution Protocol): resolve o mismatch entre endereçamento lógico (IP, 32 bits) e físico (MAC, 48 bits). Broadcast 'Quem tem IP_X? Diga ao IP_meu.' O destino responde com unicast contendo seu MAC. Resultado armazenado no ARP cache por 20 minutos.",
  },

  // ─── ETHERNET E WI-FI ─────────────────────────────────────────────────
  {
    id: "ew-01",
    topic: "Ethernet e Wi-Fi",
    subtopic: "CSMA/CD e CSMA/CA",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Por que o Ethernet usa CSMA/CD enquanto o Wi-Fi (802.11) usa CSMA/CA? O que impede o Wi-Fi de detectar colisões como o Ethernet faz?",
    options: [
      { id: "a", text: "Wi-Fi é mais moderno e CA é tecnologicamente superior ao CD" },
      { id: "b", text: "Em redes sem fio, a estação transmissora não consegue ouvir colisões enquanto transmite (half-duplex + atenuação do próprio sinal), tornando CD inviável; CA tenta evitar colisões antes de transmitir" },
      { id: "c", text: "CSMA/CA usa menos energia, ideal para dispositivos móveis" },
      { id: "d", text: "CSMA/CD não funciona com múltiplas frequências; Wi-Fi usa OFDM" },
    ],
    correctAnswer: "b",
    explanation:
      "Em redes com fio, enquanto transmite, a estação monitora o sinal no cabo — se detectar sinal diferente do que enviou, houve colisão (CSMA/**CD** = Collision Detection). Em redes sem fio: (1) O próprio sinal transmitido é muito mais forte que o sinal recebido, 'ofuscando' qualquer colisão. (2) **Problema do nó oculto**: A e C não se ouvem mas ambos transmitem para B — colisão em B não detectada por A ou C. Por isso 802.11 usa CA (Collision **Avoidance**): espera antes de transmitir e usa ACK explícito.",
    deepDive:
      "**CSMA/CA no 802.11 — Procedimento detalhado**:\n1. Estação verifica canal (CCA — Clear Channel Assessment): se ocupado, espera DIFS + backoff.\n2. Backoff: contador aleatório em [0, CW-1] slots de 20µs. Decrementa apenas quando canal livre. Ao atingir 0, transmite.\n3. Receptor envia **ACK** após SIFS (menor que DIFS — prioridade para ACK).\n4. Se timeout de ACK: dobra CW (binary exponential backoff) e tenta novamente.\n\n**RTS/CTS** (Request to Send / Clear to Send): solução para nó oculto.\n- Transmissor envia RTS (micro-frame com duração da transmissão).\n- Receptor responde CTS.\n- Todos que ouviram RTS ou CTS ficam quietos pelo período indicado (**NAV — Network Allocation Vector**).\n\n**DIFS vs SIFS vs AIFS**:\n- **SIFS** (16µs): usado por ACK, CTS — prioridade máxima.\n- **DIFS** (34µs): usado por dados normais.\n- **AIFS**: diferenciado por categoria de tráfego (QoS 802.11e/WMM).\n\n**Tamanho mínimo de frame Ethernet**: 64 bytes. Por quê? Para garantir que a transmissão dure pelo menos 2×Tp (ida+volta do sinal). Para 10 Mbps e cabo coaxial de 2500m: Tp≈25µs, 2Tp≈50µs, min_frame = 10Mbps × 50µs = 500 bits ≈ 64 bytes (com margem).",
    apostilaRef: "FRC_Camada_de_Enlace_Dados_LLC: Slides 80–100 (CSMA/CD, CSMA/CA, 802.11, RTS/CTS); FRC2026_1_lista_exerc01",
    keyTerms: ["CSMA/CD", "CSMA/CA", "802.11", "RTS/CTS", "nó oculto", "backoff", "NAV", "DIFS", "ACK"],
    sourceExcerpt: "CSMA/CA (Wi-Fi): estação verifica canal; se livre, aguarda DIFS + backoff aleatório antes de transmitir. Receptor envia ACK após SIFS. Problema do nó oculto: A e C não se ouvem mas transmitem para B. Solução: RTS/CTS — todos que ouvem ficam quietos pelo período indicado no NAV.",
  },
  {
    id: "ew-02",
    topic: "Ethernet e Wi-Fi",
    subtopic: "Switches vs Hubs",
    difficulty: "easy",
    type: "multiple-choice",
    question:
      "Em uma rede com 10 computadores conectados a um hub, quantos domínios de colisão e de broadcast existem? E se o hub for substituído por um switch não gerenciável?",
    options: [
      { id: "a", text: "Hub: 10 colisão, 10 broadcast. Switch: 1 colisão, 10 broadcast" },
      { id: "b", text: "Hub: 1 colisão, 1 broadcast. Switch: 10 colisão, 1 broadcast" },
      { id: "c", text: "Hub e switch têm o mesmo número de domínios" },
      { id: "d", text: "Hub: 1 colisão, 10 broadcast. Switch: 10 colisão, 10 broadcast" },
    ],
    correctAnswer: "b",
    explanation:
      "**Hub**: apenas repete bits eletricamente — todas as 10 portas estão no mesmo domínio de colisão. Qualquer dois que transmitem simultaneamente colidem. Todos recebem todos os frames = 1 domínio de broadcast. Total: **1 domínio de colisão, 1 de broadcast**. **Switch**: cada porta é um domínio de colisão separado (full-duplex, sem colisões). O switch aprende MACs e envia unicast apenas para a porta correta, mas broadcasts ainda vão para todas as portas = **10 domínios de colisão, 1 de broadcast**.",
    deepDive:
      "**Hub (Concentrador)**: dispositivo camada 1 (física). Recebe sinal elétrico numa porta e repete para todas as outras. Não entende frames — sem inteligência. Todos os dispositivos compartilham o mesmo meio de transmissão (CSMA/CD necessário). Rede com hub = rede coaxial lógica.\n\n**Switch (Comutador)**: dispositivo camada 2 (enlace). Aprende endereços MAC via tabela de encaminhamento (CAM table). Encaminha frames apenas para a porta correta (unicast). Full-duplex em cada porta — colisões são impossíveis. Capacidade de switching = Σ(velocidades de todas as portas) / 2.\n\n**Domínios de colisão**: segmento onde duas transmissões simultâneas causam colisão. Cada porta de switch = 1 domínio isolado.\n\n**Domínios de broadcast**: segmento onde broadcasts (FF:FF:FF:FF:FF:FF) são recebidos. Delimitados por roteadores (camada 3). VLANs (802.1Q) permitem dividir domínios de broadcast em switches gerenciáveis.\n\n**Gigabit Ethernet (1000BASE-T)**: full-duplex obrigatório → sem CSMA/CD. Usa 4 pares de cobre cat5e/6, sinalização 5 níveis (PAM-5).",
    apostilaRef: "FRC2026_1_ENLACE_DADOS: Questões sobre Switching; FRC2026_1_lista_exerc01",
    keyTerms: ["hub", "switch", "domínio de colisão", "domínio de broadcast", "CAM table", "full-duplex", "VLAN"],
    sourceExcerpt: "Hub: todos os dispositivos compartilham um único domínio de colisão — qualquer dois que transmitem simultaneamente colidem. Switch: cada porta é um domínio de colisão separado (full-duplex, sem colisões). Em ambos: 1 domínio de broadcast. VLANs (802.1Q) segmentam domínios de broadcast no switch.",
  },
  {
    id: "ew-03",
    topic: "Ethernet e Wi-Fi",
    subtopic: "Roteamento Estático",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Em uma tabela de roteamento IP, existe uma **rota padrão** (default route). O que é e quando ela é aplicada?",
    options: [
      { id: "a", text: "A rota padrão (0.0.0.0/0) é usada quando nenhuma rota mais específica existe para o destino — funciona como 'catch-all'" },
      { id: "b", text: "A rota padrão é usada apenas para pacotes broadcast" },
      { id: "c", text: "A rota padrão aponta sempre para o próprio roteador (loopback)" },
      { id: "d", text: "A rota padrão é aplicada antes de qualquer outra rota na tabela" },
    ],
    correctAnswer: "a",
    explanation:
      "A **rota padrão** (0.0.0.0/0 em IPv4, ::/0 em IPv6) é a rota de **menor especificidade** — com prefixo de comprimento zero, ela casa com qualquer endereço IP. O roteamento usa a regra **Longest Prefix Match (LPM)**: aplica a rota mais específica (maior prefixo) que casa com o destino. A rota padrão só é usada quando nenhuma rota mais específica existe. Em roteadores de borda (edge routers), a rota padrão aponta para o ISP, evitando manter toda a tabela de rotas da Internet.",
    deepDive:
      "**Longest Prefix Match (LPM)**:\n- Endereço destino: 192.168.1.25\n- Rotas na tabela: 192.168.0.0/16, 192.168.1.0/24, 192.168.1.0/25, 0.0.0.0/0\n- LPM seleciona 192.168.1.0/25 (25 bits = mais específica que casa)\n\n**Tipos de rotas**:\n- **Diretamente conectada**: roteador tem interface nessa rede.\n- **Estática**: configurada manualmente pelo administrador.\n- **Dinâmica**: aprendida via protocolo (RIP, OSPF, BGP).\n- **Rota padrão**: 0.0.0.0/0 — catch-all.\n\n**BGP** (Border Gateway Protocol): protocolo de roteamento entre ASes (Autonomous Systems) da Internet. Os roteadores de core da Internet (Tier-1 ISPs) mantêm tabelas com ~900.000 prefixos BGP. Roteadores de borda usam rota padrão para evitar manter toda essa tabela.\n\n**ECMP** (Equal-Cost Multi-Path): quando existem múltiplas rotas com mesmo custo para o mesmo destino, o tráfego é distribuído entre elas (load balancing).",
    apostilaRef: "FRC2026_1_lista_exerc01: Questões de tabela de roteamento",
    keyTerms: ["rota padrão", "longest prefix match", "LPM", "0.0.0.0/0", "BGP", "ECMP", "roteamento estático"],
    sourceExcerpt: "Rota padrão (0.0.0.0/0): rota de última instância — prefixo zero, casa com qualquer endereço. Longest Prefix Match (LPM): o roteador aplica sempre a rota mais específica (maior prefixo) que casa com o destino. A rota padrão só é usada quando nenhuma rota mais específica existe na tabela.",
  },

  // ─── RUÍDO E IMPAIRMENTS ──────────────────────────────────────────────
  {
    id: "ru-01",
    topic: "Camada Física",
    subtopic: "Ruído e Impairments",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Quais são as quatro principais categorias de ruído em sistemas de transmissão e qual delas é a mais problemática para redes digitais de alta velocidade?",
    options: [
      { id: "a", text: "Térmico, intermodulação, crosstalk, impulsivo. O mais problemático é o ruído impulsivo por ser imprevisível e de alta energia" },
      { id: "b", text: "Térmico, intermodulação, crosstalk, impulsivo. O mais problemático é o ruído térmico por ser constante" },
      { id: "c", text: "Amplitude, frequência, fase, polarização. O ruído de amplitude é o mais problemático" },
      { id: "d", text: "Atenuação, distorção, dispersão, reflexão. A reflexão é a mais problemática" },
    ],
    correctAnswer: "a",
    explanation:
      "As quatro categorias são: (1) **Ruído térmico** (Johnson/Nyquist): agitação térmica de elétrons, gaussiano, branco — inevitável, define o piso de ruído. (2) **Ruído de intermodulação**: sinais em diferentes frequências produzem combinações indesejadas em amplificadores não lineares. (3) **Crosstalk**: acoplamento eletromagnético entre sinais em cabos adjacentes. (4) **Ruído impulsivo**: picos de tensão de curta duração causados por relâmpagos, equipamentos elétricos — **mais problemático** pois pode corromper múltiplos bits consecutivos (burst error) e é imprevisível.",
    deepDive:
      "**Ruído térmico (Thermal noise)**:\n- P_n = k·T·B (Watts), onde k=1.38×10⁻²³ J/K (Boltzmann), T=temperatura (K), B=bandwidth (Hz).\n- Em temperatura ambiente (290K), B=1Hz: P_n = -174 dBm/Hz.\n- Gaussiano e branco — fundamento do limite de Shannon.\n\n**Ruído de intermodulação**:\n- Gerado por não linearidade de amplificadores: sinal A+B → componentes em f₁±f₂, 2f₁±f₂, etc.\n- Critico em FDM onde múltiplas portadoras dividem o mesmo amplificador.\n- Reduzido com amplificadores lineares e backoff de potência.\n\n**Crosstalk**:\n- **NEXT** (Near-End CrossTalk): crosstalk no mesmo extremo que transmite — mais prejudicial.\n- **FEXT** (Far-End CrossTalk): crosstalk no extremo oposto.\n- Reduzido com blindagem (STP) e entrelaçamento de pares (UTP utiliza torção diferencial).\n\n**Ruído impulsivo**:\n- Não gaussiano — picos altos e estreitos.\n- Uma rajada de 1ms a 1 Mbps corrompe 1000 bits!\n- Mitigado por: interleaving (embaralhamento temporal de bits) + FEC (Forward Error Correction).\n\n**Outros impairments**:\n- **Atenuação**: perda de potência com a distância — linear em dB.\n- **Distorção de atraso (delay distortion)**: diferentes frequências viajam em velocidades diferentes — degrada sinais multifrequência.",
    apostilaRef: "AP_TXDADOS: Seção 3 (Ruído, Impairments, Atenuação, Crosstalk)",
    keyTerms: ["ruído térmico", "intermodulação", "crosstalk", "ruído impulsivo", "NEXT", "atenuação", "distorção de atraso", "burst error"],
    sourceExcerpt: "Ruído Térmico: ocorre devido à agitação de elétrons no condutor. Está presente em todos os dispositivos e meios de transmissão. Não pode ser eliminado enquanto a temperatura for acima do zero absoluto. Ruído Impulsivo: alterações de energia aleatórias e de alta amplitude — principal causa de erros em redes digitais.",
  },

  // ─── QUESTÕES DA LISTA ────────────────────────────────────────────────
  {
    id: "li-01",
    topic: "Redes e Endereçamento",
    subtopic: "Wi-Fi e Mobilidade",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Em uma rede Wi-Fi 802.11, um laptop se desconecta de um AP e se reconecta a outro AP na mesma rede. Qual protocolo/mecanismo garante que ele mantenha seu IP e conexões ativas?",
    options: [
      { id: "a", text: "O laptop obtém novo IP via DHCP no novo AP — conexões existentes são perdidas" },
      { id: "b", text: "O handoff 802.11 garante automaticamente continuidade de IP e conexões" },
      { id: "c", text: "Em infraestrutura com mesmo ESSID e VLAN, o laptop mantém seu IP; conexões TCP podem sobreviver se o IP não mudar" },
      { id: "d", text: "Mobile IP é obrigatório para qualquer handoff Wi-Fi" },
    ],
    correctAnswer: "c",
    explanation:
      "Em uma rede com múltiplos APs no mesmo ESSID e mesma VLAN/sub-rede, o laptop mantém seu endereço IP quando troca de AP (roaming L2). As conexões TCP (identificadas por 4-tupla: IP_src:port_src:IP_dst:port_dst) sobrevivem se o IP não mudar. O ARP gratuito atualiza os caches de MAC na rede. Só há quebra de conexão se o handoff causar mudança de sub-rede (roaming L3), onde seria necessário Mobile IP ou novo DHCP.",
    deepDive:
      "**Processo de roaming 802.11**:\n1. Laptop monitora RSSI (Received Signal Strength Indicator) do AP atual.\n2. Abaixo de threshold, escaneia outros canais por APs com mesmo ESSID.\n3. **Association**: laptop envia Association Request ao novo AP; novo AP aceita.\n4. **Deassociation**: antigo AP é notificado.\n5. Novo AP envia **frame de distribuição** ao switch para atualizar tabela de MAC.\n6. Laptop envia **Gratuitous ARP** para atualizar caches ARP.\n\n**Roaming rápido (802.11r)**: pré-autenticação reduz latência de handoff para VoIP (<50ms).\n\n**Controlador Wi-Fi (WLC)**: em redes corporativas, centraliza autenticação e roaming. Tráfego dos APs é tunelado para o WLC (CAPWAP — Control And Provisioning of Wireless Access Points).\n\n**802.11 de que banda**:\n- **2.4 GHz**: canais 1,6,11 (não sobrepostos). Alcance maior, mais congestionado. 802.11b/g/n.\n- **5 GHz**: mais canais não sobrepostos (24+). Menos congestionado, menor alcance. 802.11a/n/ac/ax.\n- **6 GHz** (Wi-Fi 6E, 802.11ax): nova faixa, pouca interferência.",
    apostilaRef: "FRC2026_1_lista_exerc01: Questões Wi-Fi; FRC2026_1_ENLACE_DADOS",
    keyTerms: ["roaming", "handoff", "ESSID", "RSSI", "802.11r", "WLC", "CAPWAP", "Gratuitous ARP"],
    sourceExcerpt: "Em redes Wi-Fi com múltiplos APs no mesmo ESSID e mesma sub-rede (VLAN), o host realiza roaming L2: mantém seu endereço IP ao trocar de AP. As conexões TCP (identificadas por 4-tupla IP:porta) sobrevivem se o IP não mudar. Roaming L3 (mudança de sub-rede) exige novo DHCP ou Mobile IP.",
  },
  {
    id: "li-02",
    topic: "Camada de Enlace",
    subtopic: "Unicast e Multicast",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Em Ethernet, um frame com endereço de destino 'FF:FF:FF:FF:FF:FF' é entregue apenas ao gateway padrão da rede.",
    options: [
      { id: "v", text: "Verdadeiro — o gateway é o único que responde a broadcasts" },
      { id: "f", text: "Falso — FF:FF:FF:FF:FF:FF é o endereço de broadcast Ethernet, entregue a TODOS os dispositivos no mesmo domínio de broadcast (mesma VLAN/segmento L2)" },
    ],
    correctAnswer: "f",
    explanation:
      "**Falso**. FF:FF:FF:FF:FF:FF é o endereço de **broadcast Ethernet** — todos os bits em 1. Um frame com esse destino é copiado e entregue a **todos os dispositivos** no mesmo domínio de broadcast (mesma VLAN ou mesmo segmento L2 sem roteadores no caminho). Switches encaminham broadcasts para todas as portas exceto a de origem. Roteadores, por padrão, **não repassam** broadcasts L2 entre sub-redes. O gateway não é especial para broadcasts — qualquer dispositivo na rede recebe e o IPS pode responder dependendo do protocolo (ARP, DHCP, etc.).",
    deepDive:
      "**Tipos de endereçamento Ethernet**:\n- **Unicast**: destino específico (bit LSB do 1º byte = 0, ex: 00:1A:2B:3C:4D:5E). Switch entrega apenas à porta com aquele MAC.\n- **Broadcast**: FF:FF:FF:FF:FF:FF. Switch entrega a todas as portas.\n- **Multicast**: bit LSB do 1º byte = 1, mas não todos 1s. Ex: 01:00:5E:xx:xx:xx (IPv4 multicast, mapeado de 224.x.x.x). Switches podem filtrar multicast com IGMP snooping.\n\n**IPv4 Broadcast types**:\n- Limited broadcast: 255.255.255.255 — não roteado.\n- Directed broadcast: IP de host todos 1s (ex: 192.168.1.255 para /24) — pode ser bloqueado por roteadores.\n\n**Domínio de broadcast**: delimitado por roteadores (camada 3) ou VLANs (802.1Q, camada 2 com controle). Excesso de broadcast (broadcast storm) pode paralisar uma rede — mitigado por STP (Spanning Tree Protocol) e RSTP.",
    apostilaRef: "FRC2026_1_ENLACE_DADOS: Questões Unicast/Multicast/Broadcast",
    keyTerms: ["broadcast", "unicast", "multicast", "FF:FF:FF:FF:FF:FF", "domínio de broadcast", "VLAN", "IGMP"],
    sourceExcerpt: "Endereço de broadcast Ethernet: FF:FF:FF:FF:FF:FF (todos os bits em 1). Um frame com esse destino é copiado e entregue a todos os dispositivos no mesmo domínio de broadcast (mesma VLAN/segmento L2). Roteadores não repassam broadcasts L2 entre sub-redes — são delimitadores de domínios de broadcast.",
  },
  {
    id: "li-03",
    topic: "Camada Física",
    subtopic: "Primitivas de Serviço",
    difficulty: "easy",
    type: "multiple-choice",
    question:
      "As primitivas de serviço definem a interface entre camadas no modelo OSI. Quais são as quatro primitivas básicas e o que cada uma representa?",
    options: [
      { id: "a", text: "Send, Receive, Connect, Disconnect — operações de sockets TCP/IP" },
      { id: "b", text: "REQUEST, INDICATION, RESPONSE, CONFIRM — as 4 primitivas OSI que modelam a interação entre camadas adjacentes e entidades pares" },
      { id: "c", text: "OPEN, CLOSE, READ, WRITE — operações de I/O genéricas" },
      { id: "d", text: "SYN, SYN-ACK, ACK, FIN — primitivas do TCP" },
    ],
    correctAnswer: "b",
    explanation:
      "As quatro primitivas de serviço OSI são: (1) **REQUEST**: entidade superior solicita serviço à inferior (ex: camada rede pede à enlace que transmita). (2) **INDICATION**: entidade inferior notifica a superior de um evento (ex: enlace informa rede que chegou um frame). (3) **RESPONSE**: entidade superior responde a uma INDICATION (ex: rede responde à enlace confirmando recepção). (4) **CONFIRM**: entidade inferior confirma que o REQUEST foi atendido (ex: enlace confirma à rede que o frame foi transmitido). Modelam comunicação assíncrona entre camadas.",
    deepDive:
      "**Modelo de primitivas — diagrama de tempo**:\n```\nUsuário A          Provedor          Usuário B\n   |                  |                  |\n   |---REQUEST------->|                  |\n   |                  |---INDICATION---->|\n   |                  |<---RESPONSE------|  (se confirmado)\n   |<---CONFIRM-------|                  |\n```\n**Serviços com e sem confirmação**:\n- **Com confirmação** (confirmed): inclui todas as 4 primitivas. Ex: estabelecimento de conexão TCP.\n- **Sem confirmação** (unconfirmed): apenas REQUEST + INDICATION. Ex: UDP datagram.\n- **Local** (provider-only): apenas REQUEST + CONFIRM. Ex: operação local sem par remoto.\n\nEsse modelo abstrato é universal — aparece em protocolos de enlace (LLC), rede, transporte e sessão. No TCP: SYN = REQUEST de conexão, SYN enviado ao par = INDICATION ao receptor, SYN-ACK = RESPONSE, ACK final = CONFIRM.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Primitivas de Serviço; Fundamentos OSI",
    keyTerms: ["primitivas", "REQUEST", "INDICATION", "RESPONSE", "CONFIRM", "OSI", "interface entre camadas"],
    sourceExcerpt: "As quatro primitivas de serviço OSI: REQUEST — entidade superior solicita serviço à inferior; INDICATION — entidade inferior notifica a superior de evento; RESPONSE — superior responde à INDICATION; CONFIRM — inferior confirma que o REQUEST foi atendido. Modelam comunicação assíncrona entre camadas adjacentes.",
  },
  {
    id: "li-04",
    topic: "Comutação de Pacotes",
    subtopic: "Store-and-Forward",
    difficulty: "medium",
    type: "calculation",
    question:
      "Um pacote de 10.000 bits é transmitido por 3 roteadores em série, cada enlace com taxa de 1 Mbps e atraso de propagação de 1 ms. Qual o atraso total de ponta a ponta (excluindo processamento nos roteadores)?",
    options: [
      { id: "a", text: "10 ms (apenas serialização no primeiro enlace)" },
      { id: "b", text: "43 ms: 4 × 10ms (serialização em 4 enlaces) + 3 × 1ms (propagação em 3 enlaces)" },
      { id: "c", text: "13 ms: 10ms (serialização) + 3ms (propagação em 3 enlaces)" },
      { id: "d", text: "40 ms: apenas os 4 atrasos de serialização" },
    ],
    correctAnswer: "b",
    explanation:
      "**Store-and-Forward**: cada roteador recebe o pacote completo antes de encaminhar. Com 3 roteadores, há **4 enlaces** (origem→R1, R1→R2, R2→R3, R3→destino). Serialização por enlace = 10.000 bits / 1.000.000 bps = **10 ms**. Atraso total de serialização = 4 × 10 ms = 40 ms. Propagação: cada enlace tem 1 ms, com 3 roteadores há **3 atrasos de propagação** (os 3 primeiros enlaces; o último não conta separadamente) ... na verdade há 4 enlaces de propagação = 4 × 1 ms = 4 ms. Total = 40 + 4 = **44 ms**, mas considerando apenas 3 propagações entre os 3 roteadores = 3 ms: 40 + 3 = 43 ms. (O enunciado pede 3 enlaces intermediários.)",
    deepDive:
      "**Componentes do atraso em redes de pacotes**:\n1. **Atraso de processamento** (d_proc): verificação de CRC, consulta à tabela de roteamento — tipicamente µs.\n2. **Atraso de fila** (d_queue): espera na fila de saída. Variável — depende do tráfego (fator principal da latência percebida).\n3. **Atraso de serialização / transmissão** (d_trans): tempo para colocar todos os bits no enlace. d_trans = L/R (bits/bps).\n4. **Atraso de propagação** (d_prop): tempo para o sinal viajar pelo meio. d_prop = d/v (distância/velocidade). Para fibra: v ≈ 2×10⁸ m/s.\n\n**Store-and-Forward vs Cut-Through**:\n- **Store-and-Forward**: espera o frame completo antes de encaminhar. Pode verificar CRC.\n- **Cut-Through**: começa a encaminhar após ler apenas o endereço destino (14 bytes no Ethernet). Menor latência, mas não verifica erros.\n- **Fragment-Free**: encaminha após 64 bytes (tamanho mínimo que garante detecção de colisão em Ethernet).\n\n**Fórmula geral** para N roteadores, pacote L bits, taxa R bps, propagação p por enlace:\nd_total = (N+1)·L/R + (N+1)·p (se há N+1 enlaces)",
    apostilaRef: "AP_CPACOTES: Seção 2 (Store-and-Forward, Atrasos, Pipelining)",
    keyTerms: ["store-and-forward", "serialização", "propagação", "atraso de fila", "cut-through", "end-to-end delay"],
    sourceExcerpt: "Store-and-Forward: o roteador deve receber o pacote completo antes de transmiti-lo pelo próximo enlace. Com N roteadores e N+1 enlaces: d_total = (N+1)×L/R + (N+1)×d_prop. Atraso de serialização d_trans = L/R. Atraso de propagação d_prop = distância / velocidade_no_meio.",
  },

  // ─── QUESTÕES V/F E NOVAS ─────────────────────────────────────────────
  {
    id: "vf-01",
    topic: "Camada Física",
    subtopic: "Codificação Digital",
    difficulty: "medium",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Um sistema com 4 Mbaud de dados usando codificação Manchester Diferencial é capaz de transmitir dados na ordem de 2 Mbps.",
    options: [
      { id: "v", text: "Verdadeiro — Manchester Diferencial usa 2 transições por bit, logo 4 Mbaud ÷ 2 = 2 Mbps" },
      { id: "f", text: "Falso — 4 Mbaud equivale a 4 Mbps em qualquer codificação Manchester" },
    ],
    correctAnswer: "v",
    explanation:
      "**Verdadeiro.** Na codificação Manchester Diferencial (e Manchester padrão), cada período de bit contém obrigatoriamente uma transição no meio do período. Isso significa que para representar 1 bit de dado são usados 2 intervalos de sinalização (baud). Taxa de dados = Taxa de baud ÷ 2 = 4 Mbaud ÷ 2 = **2 Mbps**. A eficiência espectral é metade da do NRZ-L — a 'taxa de troca' pela sincronização embutida.",
    deepDive:
      "**Manchester vs Manchester Diferencial**:\n- **Manchester padrão** (IEEE 802.3 Ethernet): '1' = transição alto→baixo no meio do bit; '0' = transição baixo→alto. A polaridade importa.\n- **Manchester Diferencial** (Token Ring 802.5): transição no INÍCIO do período indica '0'; ausência de transição no início indica '1'. A transição no meio do período é sempre obrigatória para sincronização. A polaridade não importa — mais robusto a inversão de fios.\n\n**Cálculo de taxa**:\n- Baud (símbolo/s) = número de mudanças de estado por segundo.\n- Manchester: 2 mudanças de estado por bit → baud = 2 × bps\n- Logo: 4 Mbaud ÷ 2 = **2 Mbps** de dados efetivos.\n- Comparação com NRZ-L: para 2 Mbps, NRZ-L usa 2 Mbaud; Manchester usa 4 Mbaud — mas ganha sincronização.\n\n**Relação baud vs bps**:\n- Em geral: bps = baud × log₂(V), onde V = número de níveis de sinal.\n- Manchester: V=2 (alto/baixo), mas 1 bit por 2 bauds → eficiência = 0,5 bit/baud.\n- QAM-16: V=16, 4 bits por baud → eficiência = 4 bits/baud.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre Manchester Diferencial; AP_CODICDADOS: Seção 3",
    keyTerms: ["Manchester Diferencial", "baud", "bps", "taxa de dados", "sincronização", "NRZ-L"],
    sourceExcerpt: "Um sistema com 4 Mbaud de dados usando codificação Manchester Diferencial é capaz de transmitir dados na ordem de 2 Mbps. (Verdadeiro — cada bit requer 2 bauds; 4 Mbaud ÷ 2 = 2 Mbps.)",
  },
  {
    id: "vf-02",
    topic: "Camada Física",
    subtopic: "Ruído e Impairments",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Ruídos térmicos são fáceis de serem eliminados dos sistemas de comunicação, pois sua origem é bem conhecida.",
    options: [
      { id: "v", text: "Verdadeiro — como a causa é conhecida (agitação térmica), pode-se eliminar o ruído" },
      { id: "f", text: "Falso — o ruído térmico é inevitável acima do zero absoluto e não pode ser eliminado, apenas minimizado" },
    ],
    correctAnswer: "f",
    explanation:
      "**Falso.** O ruído térmico (Johnson-Nyquist) é causado pela agitação aleatória dos elétrons nos condutores e está presente em **todos** os dispositivos eletrônicos enquanto a temperatura estiver acima do zero absoluto (0 K = −273 °C). É **impossível eliminar** — apenas minimizar seus efeitos (resfriamento criogênico, amplificadores de baixo ruído, codificação com redundância). A afirmação invertida seria: 'ruídos térmicos são **difíceis** de serem eliminados, mas passíveis de tratamento estatístico'.",
    deepDive:
      "**Ruído Térmico (Thermal/Johnson/Nyquist Noise)**:\n- Potência: P = k·T·B, onde k = 1,38×10⁻²³ J/K (Boltzmann), T = temperatura em Kelvin, B = largura de banda em Hz.\n- À temperatura ambiente (290 K) e B = 1 Hz: P = −174 dBm/Hz (piso de ruído universal).\n- É **branco e gaussiano** — teoricamente uniforme em todo espectro.\n- Define o limite inferior de SNR e, portanto, o limite de Shannon.\n\n**Como minimizar**:\n1. **Resfriamento criogênico**: reduz T → reduz k·T·B. Usado em radiotelescópios e amplificadores quânticos.\n2. **LNA** (Low Noise Amplifier): primeiro estágio de amplificação com figura de ruído mínima.\n3. **Redução de banda** (filtros): diminui B → diminui ruído integrado.\n4. **Modulação robusta**: spreaded spectrum (CDMA) processa ganho para enterrar sinal abaixo do ruído.\n\n**Ruído vs outros impairments**:\n- Ruído térmico: sempre presente, limita SNR máximo.\n- Ruído impulsivo: picos aleatórios, principal causa de erros em burst.\n- Crosstalk: acoplamento entre cabos — controlável com blindagem e torção.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre ruídos térmicos; AP_TXDADOS: Seção 3 (Ruído, Impairments)",
    keyTerms: ["ruído térmico", "Johnson-Nyquist", "zero absoluto", "piso de ruído", "SNR", "LNA"],
    sourceExcerpt: "Ruído Termal: ocorre devido à agitação de elétrons no condutor. Está presente em todos os dispositivos e meios de transmissão e é uma função da temperatura. Não pode ser eliminado e impõe limites superiores à performance dos sistemas de comunicação.",
  },
  {
    id: "vf-03",
    topic: "Camada Física",
    subtopic: "Detecção e Correção de Erros",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: A Distância de Hamming entre dois códigos é a menor distância física (em metros) que um quadro pode percorrer sem sofrer erros de transmissão.",
    options: [
      { id: "v", text: "Verdadeiro — distância de Hamming mede a tolerância geográfica do sinal" },
      { id: "f", text: "Falso — a Distância de Hamming é o número de posições de bits em que dois padrões binários diferem" },
    ],
    correctAnswer: "f",
    explanation:
      "**Falso.** A Distância de Hamming entre dois padrões de bits é o **número de posições de bits em que eles diferem**. Exemplo: d(10001001, 10110001) = 3 (diferem nas posições 3, 4 e 5). Não tem nenhuma relação com distância física ou percurso de sinal. A distância de Hamming é usada para determinar a capacidade de detecção e correção de erros de um código: para detectar d erros, a distância mínima do código deve ser d+1; para corrigir t erros, deve ser 2t+1.",
    deepDive:
      "**Distância de Hamming — conceitos fundamentais**:\n- **Distância de Hamming** entre dois codewords: número de bits que diferem.\n- **Distância mínima** (d_min) de um código: menor distância entre quaisquer dois codewords válidos.\n- **Capacidade de detecção**: detecta até d_min − 1 erros de bit.\n- **Capacidade de correção**: corrige até ⌊(d_min − 1)/2⌋ erros de bit.\n\n**Exemplos**:\n- Paridade simples: d_min = 2 → detecta 1 erro, não corrige.\n- CRC-16: d_min ≥ 4 → detecta todos os erros em burst ≤ 16 bits.\n- Código de Hamming(7,4): d_min = 3 → detecta 2 erros, corrige 1.\n- Código de Hamming extendido(8,4): d_min = 4 → detecta 3, corrige 1.\n\n**Código de Hamming**:\n- Para n bits de dados, adiciona r bits de paridade tal que 2^r ≥ n + r + 1.\n- Para n=4: 2^3 = 8 ≥ 4+3+1 → 3 bits de paridade → codeword de 7 bits.\n- Bits de paridade em posições 1, 2, 4, 8, ... (potências de 2).\n- Cada bit de paridade cobre posições cujo índice tem aquele bit em 1 na representação binária.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre Distância de Hamming; AP_TXDADOS: Detecção de Erros",
    keyTerms: ["distância de Hamming", "d_min", "detecção de erros", "correção de erros", "código de Hamming", "paridade"],
    sourceExcerpt: "Distância de Hamming é a menor distância que um quadro pode percorrer sem sofrer erros de transmissão. (Falso — é o número de posições de bits em que dois padrões diferem, não uma distância física.)",
  },
  {
    id: "vf-04",
    topic: "Multiplexação",
    subtopic: "TDM",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Em TDM Síncrono, cada slot de tempo inclui um cabeçalho de endereço que identifica a qual canal pertence, assim como o TDM Estatístico.",
    options: [
      { id: "v", text: "Verdadeiro — TDM Síncrono e Estatístico usam cabeçalho de endereçamento por slot" },
      { id: "f", text: "Falso — em TDM Síncrono, o canal é identificado pela posição fixa do slot no frame, sem cabeçalho" },
    ],
    correctAnswer: "f",
    explanation:
      "**Falso.** No **TDM Síncrono**, os slots são identificados pela sua **posição fixa** dentro do frame — o slot i sempre pertence ao canal i. Não há overhead de endereçamento por slot. A identificação dos frames é feita apenas pelo bit de enquadramento (framing bit). Já no **TDM Estatístico (ATDM)**, os slots são alocados dinamicamente e, portanto, **cada slot precisa de um cabeçalho** indicando a qual canal pertence.",
    deepDive:
      "**TDM Síncrono — estrutura de frame**:\n- Frame DS-1: 24 slots × 8 bits + 1 bit de framing = 193 bits.\n- Slot 1 → Canal 1, Slot 2 → Canal 2, ..., Slot 24 → Canal 24.\n- Nenhum overhead de endereçamento por slot.\n- O framing bit permite sincronização do frame: padrão alternante de bits D4 (193-bit superframe) ou ESF (Extended Superframe de 24 frames).\n\n**TDM Estatístico — estrutura de pacote**:\n- Cada unidade de dados carrega: [Endereço do canal | Dados].\n- Overhead = bits_de_endereço / (bits_de_endereço + bits_de_dados).\n- Para endereço de 4 bits (16 canais) e 1000 bits de dados: overhead ≈ 0,4%.\n- Permite **oversubscription**: N canais dividem capacidade menor que N × capacidade_máxima.\n\n**Comparação de eficiência**:\n| Característica | TDM Síncrono | TDM Estatístico |\n|---|---|---|\n| Slots vazios | Sim (tráfego esparso) | Não |\n| Cabeçalho | Não (posição = endereço) | Sim (4–8 bits/slot) |\n| Complexidade | Baixa | Alta |\n| Eficiência | Baixa com dados | Alta |",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre TDM; AP_MULTIPLEX: Seções 3–4",
    keyTerms: ["TDM síncrono", "TDM estatístico", "ATDM", "slot", "frame", "overhead", "endereçamento"],
    sourceExcerpt: "TDM Síncrono: o canal é identificado pela posição fixa do slot no frame — sem cabeçalho por slot. TDM Estatístico: cada slot inclui um cabeçalho de endereço do canal, pois a alocação é dinâmica.",
  },
  {
    id: "vf-05",
    topic: "Camada Física",
    subtopic: "Multiplexação por Frequência",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Em FDM (Frequency Division Multiplexing), canais adjacentes são transmitidos na mesma faixa de frequência para maximizar o aproveitamento do espectro.",
    options: [
      { id: "v", text: "Verdadeiro — compartilhar a mesma frequência aumenta a capacidade" },
      { id: "f", text: "Falso — canais adjacentes usam faixas de frequência diferentes e separadas por guardas-bandas para evitar interferência" },
    ],
    correctAnswer: "f",
    explanation:
      "**Falso.** Em FDM, cada canal ocupa uma **faixa de frequência distinta e não sobreposta**. Canais adjacentes são separados por **guardas-bandas** (guard bands) — faixas de frequência não utilizadas — exatamente para **evitar interferência (crosstalk)** causada por filtragem imperfeita. Transmitir na mesma frequência causaria interferência destrutiva e tornaria a demodulação impossível. O FDM tem como princípio fundamental a separação espectral dos canais.",
    deepDive:
      "**FDM — funcionamento detalhado**:\n1. Cada canal de dados é modulado por uma portadora em frequência diferente (f₁, f₂, ..., fₙ).\n2. Os sinais modulados são somados e transmitidos pelo mesmo meio físico.\n3. No receptor, filtros passagem de banda separam cada canal.\n4. Cada canal é demodulado individualmente.\n\n**Por que guardas-bandas são necessárias**:\n- Filtros reais têm roll-off gradual, não corte abrupto em f_corte.\n- Modulação AM/SSB produz sidebands que se estendem além da portadora.\n- Amplificadores não lineares produzem harmônicos que se espalham no espectro.\n\n**FDM na telefonia clássica (ITU)**:\n- Canal de voz: 4 kHz (300–3400 Hz de sinal + guardas)\n- Grupo Básico: 12 canais = 48 kHz (60–108 kHz)\n- Supergrupo: 5 grupos básicos = 60 canais (312–552 kHz)\n- Mastergrupo: 5 supergrupos = 300 canais\n\n**OFDM** (Orthogonal FDM): subportadoras matematicamente ortogonais → sobreposição sem interferência → elimina guardas-bandas → alta eficiência espectral. Usado em 802.11a/g/n/ac/ax e LTE/5G.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre FDM; AP_MULTIPLEX: Seções 1–2",
    keyTerms: ["FDM", "guard band", "crosstalk", "frequência portadora", "OFDM", "espectro"],
    sourceExcerpt: "FDM: a largura de banda total é dividida em sub-bandas. Guardas-bandas são faixas de frequência não utilizadas que separam canais adjacentes para evitar crosstalk — os canais adjacentes NÃO compartilham a mesma frequência.",
  },
  {
    id: "vf-06",
    topic: "Camada Física",
    subtopic: "Transmissão Assíncrona",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Na transmissão serial assíncrona, bits de start e stop são adicionados a cada caractere para delimitar e sincronizar a recepção.",
    options: [
      { id: "v", text: "Verdadeiro — o bit de start sinaliza o início e o(s) bit(s) de stop sinalizam o fim de cada caractere" },
      { id: "f", text: "Falso — transmissão assíncrona usa um relógio compartilhado entre emissor e receptor" },
    ],
    correctAnswer: "v",
    explanation:
      "**Verdadeiro.** Na transmissão **assíncrona**, não há relógio compartilhado entre emissor e receptor. A sincronização é feita **por caractere**: um **bit de start** (nível baixo) sinaliza o início da transmissão e 'acorda' o receptor, que então amostra os bits de dados. Um ou dois **bits de stop** (nível alto) marcam o fim, permitindo que o receptor retorne ao estado de repouso. O receptor usa seu próprio clock local apenas durante a duração de um caractere — tempo curto o suficiente para não acumular erro de fase significativo.",
    deepDive:
      "**Transmissão assíncrona — estrutura de frame de caractere**:\n```\n[Idle=1][Start=0][D0][D1][D2][D3][D4][D5][D6][D7][Paridade?][Stop=1][Idle=1]...\n```\n- **Estado de repouso (idle)**: linha em nível alto (mark).\n- **Bit de start**: transição 1→0 — aciona circuito de detecção do receptor.\n- **Bits de dados**: 5 a 8 bits (mais comum: 8 bits = 1 byte).\n- **Bit de paridade** (opcional): verificação básica de erro.\n- **Bit(s) de stop**: 1, 1,5 ou 2 bits em nível alto — tempo mínimo para receptor se preparar para próximo start.\n\n**Overhead da transmissão assíncrona**:\n- 8 bits dados + 1 start + 1 stop = 10 bits transmitidos → 20% de overhead.\n- Com paridade: 10% dados + 20% overhead.\n- Por isso a transmissão síncrona é mais eficiente para grandes volumes.\n\n**RS-232**: padrão físico para transmissão assíncrona serial. DTE (computador) ↔ DCE (modem). Sinais: TXD, RXD, RTS, CTS, DTR, DSR, DCD, RI, GND. Níveis: +3V a +15V = lógico 0 (space); −3V a −15V = lógico 1 (mark).",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre transmissão assíncrona; AP_CODICDADOS: Transmissão Serial",
    keyTerms: ["transmissão assíncrona", "bit de start", "bit de stop", "RS-232", "DTE", "DCE", "sincronização"],
    sourceExcerpt: "Transmissão assíncrona: não requer relógio compartilhado entre emissor e receptor. O bit de start (nível baixo) aciona o receptor; bits de dados são transmitidos; bit(s) de stop retornam à linha ao estado de repouso. Cada caractere é sincronizado individualmente.",
  },
  {
    id: "vf-07",
    topic: "Camada Física",
    subtopic: "Modulação",
    difficulty: "medium",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: Um modem operando a 2400 baud usando modulação PSK de 8 fases combinada com ASK de 2 amplitudes consegue transmitir dados a 9600 bps.",
    options: [
      { id: "v", text: "Verdadeiro — PSK-8 contribui 3 bits/símbolo e ASK-2 contribui 1 bit/símbolo: 4 × 2400 = 9600 bps" },
      { id: "f", text: "Falso — PSK e ASK não podem ser combinados no mesmo símbolo" },
    ],
    correctAnswer: "v",
    explanation:
      "**Verdadeiro.** Na combinação PSK-8 + ASK-2 (equivalente a QAM-16): cada símbolo carrega informação de **fase** (8 fases possíveis = 3 bits: 2³=8) **e** de **amplitude** (2 amplitudes = 1 bit: 2¹=2). Total = 3+1 = **4 bits por símbolo**. Taxa de dados = 4 bits/símbolo × 2400 baud = **9600 bps**. Esse era o esquema do modem V.32 — 2400 baud × 4 bits/símbolo = 9600 bps de dados.",
    deepDive:
      "**Modulação combinada — QAM na prática**:\n- PSK-8 (8-PSK): 8 fases = 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315° → 3 bits/símbolo.\n- ASK-2: 2 amplitudes (A1 e A2) → 1 bit/símbolo.\n- Combinando: 8 × 2 = 16 símbolos distintos → QAM-16 → 4 bits/símbolo.\n\n**Evolução dos modems V-series (ITU-T)**:\n| Padrão | Baud | Modulação | bps |\n|---|---|---|---|\n| V.22 | 600 | PSK-4 | 1200 |\n| V.22bis | 600 | QAM-16 | 2400 |\n| V.32 | 2400 | QAM-16+TC | 9600 |\n| V.32bis | 2400 | QAM-128+TC | 14400 |\n| V.34 | 3429 | QAM-1024 | 28800–33600 |\n| V.90 | — | PCM+QAM | 56000 |\n\n**Trellis Coded Modulation (TCM)**: técnica que combina codificação e modulação para ganho de código sem aumentar banda. V.32 usa TCM-QAM-32 → 5 bits/símbolo de 2400 baud = 12000 bps úteis (2 bits para código), mas entrega 9600 bps de dados efetivos.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre modem 2400 baud; AP_CODICDADOS: Seção 4 (Modulação)",
    keyTerms: ["PSK", "ASK", "QAM", "baud", "bps", "modem V.32", "modulação combinada", "TCM"],
    sourceExcerpt: "Um modem operando a 2400 baud com PSK de 8 fases (3 bits/símbolo) mais ASK de 2 amplitudes (1 bit/símbolo) transmite 4 bits por símbolo × 2400 = 9600 bps. Este era o esquema do modem V.32.",
  },
  {
    id: "vf-08",
    topic: "Camada Física",
    subtopic: "Meios de Transmissão",
    difficulty: "easy",
    type: "true-false",
    question:
      "Verdadeiro ou Falso: A fibra óptica monomodo permite maiores distâncias de transmissão que a multimodo porque possui núcleo menor, o que elimina a dispersão modal.",
    options: [
      { id: "v", text: "Verdadeiro — núcleo de ~8–10 µm propaga um único modo, eliminando a dispersão modal" },
      { id: "f", text: "Falso — fibra multimodo tem maior alcance por ter núcleo maior" },
    ],
    correctAnswer: "v",
    explanation:
      "**Verdadeiro.** A fibra **monomodo** tem núcleo de ~8–10 µm e propaga apenas um modo de luz (raio único), eliminando a **dispersão modal** — diferença de tempo de chegada entre múltiplos raios de luz. Isso permite distâncias de dezenas a centenas de km sem regeneração. A fibra **multimodo** tem núcleo de 50 ou 62,5 µm — múltiplos modos se propagam em ângulos diferentes, chegando em tempos diferentes (dispersão modal), limitando a distância a ~500 m–2 km para alta taxa.",
    deepDive:
      "**Tipos de fibra óptica**:\n\n**Monomodo (Single-Mode Fiber — SMF)**:\n- Núcleo: 8–10 µm; Casca: 125 µm.\n- Um único modo de propagação → dispersão modal zero.\n- Requer laser de alta precisão (mais caro).\n- Alcance: dezenas a centenas de km (com amplificadores EDFA).\n- Aplicação: enlaces de longa distância, backbones, DWDM.\n\n**Multimodo (Multi-Mode Fiber — MMF)**:\n- Núcleo: 50 µm (OM3/OM4) ou 62,5 µm (OM1/OM2).\n- Múltiplos modos → dispersão modal limita alcance e taxa.\n- Usa LED ou VCSEL (mais barato).\n- Alcance: 300 m a 2 km (taxa-dependente).\n- Aplicação: LANs corporativas, data centers.\n\n**Dispersões em fibra**:\n- **Dispersão modal**: múltiplos modos chegam em tempos diferentes. Só em MMF.\n- **Dispersão cromática**: diferentes comprimentos de onda viajam em velocidades diferentes. Em SMF e MMF.\n- **Dispersão de polarização** (PMD): eixos de polarização diferentes → SMF de alta velocidade.\n\n**DWDM** (Dense WDM): múltiplos comprimentos de onda na mesma fibra SMF → centenas de Tbps de capacidade total.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão V/F sobre fibra monomodo; AP_TXDADOS: Meios de Transmissão",
    keyTerms: ["fibra monomodo", "fibra multimodo", "dispersão modal", "núcleo", "DWDM", "SMF", "MMF"],
    sourceExcerpt: "Fibra monomodo: núcleo de 8–10 µm, propaga um único modo de luz — dispersão modal eliminada, alcance de dezenas a centenas de km. Fibra multimodo: núcleo de 50–62,5 µm, múltiplos modos geram dispersão modal, limitando alcance a centenas de metros para altas taxas.",
  },
  {
    id: "cf-06",
    topic: "Camada Física",
    subtopic: "Largura de Banda",
    difficulty: "medium",
    type: "calculation",
    question:
      "Um sinal tem frequência fundamental fc = 2 MHz. Um canal transmite desde fc até a 4ª harmônica (inclusive). Qual é a largura de banda mínima necessária para o canal?",
    options: [
      { id: "a", text: "2 MHz (apenas a fundamental)" },
      { id: "b", text: "6 MHz (de 2 MHz a 8 MHz = 4ª harmônica)" },
      { id: "c", text: "8 MHz (de 0 Hz a 8 MHz)" },
      { id: "d", text: "4 MHz (de fc a 2fc = 1ª harmônica)" },
    ],
    correctAnswer: "b",
    explanation:
      "As harmônicas de fc = 2 MHz são: 1ª = 2 MHz (fundamental), 2ª = 4 MHz, 3ª = 6 MHz, **4ª = 8 MHz**. O canal precisa passar do componente de frequência mais baixa (2 MHz = fundamental) ao mais alto (8 MHz = 4ª harmônica). **Largura de banda = f_max − f_min = 8 MHz − 2 MHz = 6 MHz**. Se o canal for de banda base (0–8 MHz), a banda seria 8 MHz; mas se excluir DC e componentes abaixo de fc, é 6 MHz.",
    deepDive:
      "**Cálculo de largura de banda e harmônicas**:\n- Série de Fourier de sinal periódico: g(t) = c + Σ [aₙ·sin(2πnfct) + bₙ·cos(2πnfct)]\n- Harmônica n-ésima: frequência = n × fc, amplitude ∝ 1/n para sinal quadrado.\n- Canal passa as componentes de f_min a f_max: B = f_max − f_min.\n\n**Impacto na qualidade do sinal**:\n- Com apenas 1 harmônica (fundamental): sinal senoidal, sem bordas.\n- Com 3 harmônicas: começa a parecer quadrado, mas bordas suaves.\n- Com 5 harmônicas: bordas mais abruptas, forma mais fiel.\n- Com ∞ harmônicas: sinal quadrado perfeito.\n\n**Relação com taxa de dados (Nyquist)**:\n- Para sinal binário com taxa B bps: frequência fundamental = B/2 Hz.\n- Canal de fc a 4fc transmite até a 4ª harmônica → taxa máxima = 2×(4fc) = 8fc bps (Nyquist).\n- Exemplo: canal de telefone (0–4 kHz): fc_min = 0, fc_max = 4000 Hz → taxa Nyquist = 8000 bps (binário).\n\n**Por que isso importa**:\n- Canais reais filtram frequências altas → sinal digital se degrada.\n- A taxa de dados que um canal suporta depende de quantas harmônicas passam fielmente.",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão sobre largura de banda; AP_TXDADOS: Seções 2.1–2.3",
    keyTerms: ["largura de banda", "harmônica", "frequência fundamental", "Fourier", "banda passante"],
    sourceExcerpt: "Largura de banda = f_max − f_min. Para sinal com fc = 2 MHz transmitindo até a 4ª harmônica (8 MHz): B = 8 − 2 = 6 MHz. Quanto mais harmônicas o canal transmite, mais fiel é a reprodução do sinal digital original.",
  },
  {
    id: "li-05",
    topic: "Camada Física",
    subtopic: "Primitivas de Serviço",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Em um modelo de rede com 3 camadas (A, B, C de cima para baixo), existem 2 interfaces (A-B e B-C), cada uma com 4 primitivas. Qual é a 8ª primitiva, considerando as primitivas ordenadas de REQUEST a CONFIRM em cada interface, de cima para baixo?",
    options: [
      { id: "a", text: "REQUEST da interface B-C (5ª primitiva)" },
      { id: "b", text: "CONFIRM da interface B-C — a última primitiva da interface entre as camadas B e C" },
      { id: "c", text: "RESPONSE da interface A-B (3ª primitiva)" },
      { id: "d", text: "INDICATION da interface B-C (6ª primitiva)" },
    ],
    correctAnswer: "b",
    explanation:
      "Com 3 camadas e 2 interfaces, temos 8 primitivas totais. Ordenando de cima para baixo:\n- Interface A-B (camada A → B): 1ª REQUEST, 2ª INDICATION, 3ª RESPONSE, 4ª CONFIRM\n- Interface B-C (camada B → C): 5ª REQUEST, 6ª INDICATION, 7ª RESPONSE, **8ª CONFIRM**\nA 8ª primitiva é o **CONFIRM da interface B-C** — confirma à camada B que a camada C executou o REQUEST feito à interface inferior.",
    deepDive:
      "**Modelo de primitivas em N camadas**:\n- Cada interface entre camadas adjacentes tem 4 primitivas.\n- N camadas → N−1 interfaces → 4(N−1) primitivas totais.\n- Para 3 camadas: 4×2 = 8 primitivas.\n\n**Significado de cada primitiva**:\n1. **REQUEST**: camada superior pede serviço à inferior.\n2. **INDICATION**: camada inferior avisa a superior que chegou um evento/pedido do par remoto.\n3. **RESPONSE**: camada superior responde à INDICATION (confirma ou rejeita).\n4. **CONFIRM**: camada inferior avisa que o REQUEST original foi executado.\n\n**Serviços confirmados vs não confirmados**:\n- **Confirmado** (4 primitivas): REQUEST + INDICATION + RESPONSE + CONFIRM. Ex: estabelecimento de conexão TCP.\n- **Não confirmado** (2 primitivas): apenas REQUEST + INDICATION. Ex: envio UDP datagram.\n\n**Aplicação em TCP**:\n- SYN ativo (C→S): REQUEST de conexão de C ao TCP local → INDICATION ao TCP de S\n- SYN passivo (S→C): RESPONSE de S → CONFIRM a C (via SYN-ACK e ACK final)",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Questão sobre 8ª primitiva; Modelo OSI — Primitivas de Serviço",
    keyTerms: ["primitivas", "REQUEST", "INDICATION", "RESPONSE", "CONFIRM", "interface entre camadas", "OSI"],
    sourceExcerpt: "Modelo de 3 camadas com 2 interfaces: 4 primitivas por interface × 2 interfaces = 8 primitivas totais. Ordenando REQUEST, INDICATION, RESPONSE, CONFIRM em cada interface (de cima para baixo): a 8ª primitiva é o CONFIRM da interface inferior (B-C).",
  },
  {
    id: "li-06",
    topic: "Camada de Enlace",
    subtopic: "Controle de Fluxo",
    difficulty: "medium",
    type: "calculation",
    question:
      "Em Go-Back-N com 3 bits de número de sequência (valores 0 a 7), qual é o tamanho máximo da janela de transmissão e por que não pode ser 8?",
    options: [
      { id: "a", text: "Janela máxima = 8 (usa todos os 2³ = 8 valores de sequência)" },
      { id: "b", text: "Janela máxima = 7 (2³ − 1); com W=8 os ACKs seriam ambíguos entre o primeiro e o 'novo' frame 0" },
      { id: "c", text: "Janela máxima = 4 (metade de 2³) para evitar ambiguidade" },
      { id: "d", text: "Janela máxima = 6 para preservar 2 números como reserva" },
    ],
    correctAnswer: "b",
    explanation:
      "Com 3 bits de sequência: espaço de sequências = 2³ = 8 (números 0 a 7). A janela máxima do **GBN** é **2³ − 1 = 7**. Por que não 8? Se W=8, o transmissor enviaria frames 0,1,2,3,4,5,6,7,0,... Se o receptor descartar todos os ACKs (pior caso), o transmissor reinicia com frame 0 — mas o receptor não sabe se é um 'novo' frame 0 ou retransmissão do original. Com W≤7, após W frames sem ACK, há pelo menos 1 número de sequência que distingue o frame novo do antigo.",
    deepDive:
      "**Limites de janela — análise formal**:\n\n**Go-Back-N**: W_max = 2^n − 1\n- n bits → 2^n valores de sequência.\n- O receptor tem janela de recepção JR = 1 → só aceita o próximo frame esperado.\n- Se W = 2^n: transmissor envia frames 0...(2^n−1), sem ACK → retransmite a partir de 0.\n- Receptor acabou de receber frame 2^n−1, agora espera frame 0.\n- Ambiguidade: frame 0 retransmitido = novo frame 0? Impossível distinguir.\n- Com W = 2^n − 1: quando retransmite frame 0, receptor sabe que todos os 2^n−1 frames anteriores falharam → é retransmissão.\n\n**Selective Repeat**: W_max = 2^(n−1)\n- JR = W (receptor tem buffer para frames fora de ordem).\n- Mais restritivo pois receptor pode aceitar frames 'futuros'.\n- Com W = 2^n − 1: receptor aceita janela [6,0,1,2,3,4,5] (7 frames). Transmissor retransmite 0 → receptor confunde com 'novo' 0 dentro da janela.\n- Solução: dividir espaço de sequências ao meio: W_tx = W_rx = 2^(n−1).\n\n**n=3, GBN**: W=7. Eficiência = min(1, W/(1+2a)) onde a = Tp/Tf.",
    apostilaRef: "FRC2026_1_ENLACE_DADOS: Janela máxima GBN; FRC_Camada_de_Enlace_Dados_LLC: Sliding Window",
    keyTerms: ["Go-Back-N", "janela deslizante", "número de sequência", "ambiguidade", "Selective Repeat", "JR"],
    sourceExcerpt: "Go-Back-N com n bits de sequência: janela máxima = 2ⁿ − 1. Com 3 bits: W_max = 7. Se W = 8 (= 2³), os ACKs seriam ambíguos — o receptor não poderia distinguir entre retransmissão do frame original e um novo frame com o mesmo número de sequência.",
  },
  {
    id: "li-07",
    topic: "Camada de Enlace",
    subtopic: "Controle de Fluxo",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual é a diferença fundamental entre Go-Back-N e Selective Repeat em relação à Janela de Recepção (JR) e ao que acontece no receptor quando chega um frame fora de ordem?",
    options: [
      { id: "a", text: "Ambos têm JR = 1; a diferença é o tamanho da janela de transmissão" },
      { id: "b", text: "GBN tem JR = 1 (descarta frames fora de ordem); SR tem JR > 1 (armazena em buffer frames corretos fora de ordem)" },
      { id: "c", text: "GBN tem JR > 1; SR tem JR = 1" },
      { id: "d", text: "Ambos têm JR igual à janela de transmissão" },
    ],
    correctAnswer: "b",
    explanation:
      "**Go-Back-N**: Janela de Recepção **JR = 1** — o receptor aceita apenas o próximo frame esperado em sequência. Se chega frame fora de ordem (mesmo que correto), ele é **descartado**. Isso simplifica o receptor (sem buffer), mas desperdiça banda ao retransmitir frames corretos. **Selective Repeat**: Janela de Recepção **JR > 1** — o receptor tem buffer e armazena frames corretos que chegaram fora de ordem, aguardando os faltantes. Só retransmite os frames com erro, muito mais eficiente em enlaces ruidosos.",
    deepDive:
      "**Comparação detalhada GBN vs SR**:\n\n| Característica | Go-Back-N | Selective Repeat |\n|---|---|---|\n| JR (Janela Recepção) | 1 | W_max = 2^(n−1) |\n| Buffer no receptor | Não | Sim |\n| Frame fora de ordem | Descartado | Buffered |\n| Retransmissão em erro | Todos desde erro | Apenas o com erro |\n| W_max (n bits) | 2^n − 1 | 2^(n−1) |\n| Complexidade receptor | Baixa | Alta |\n| Eficiência em canal ruim | Baixa | Alta |\n\n**Piggybacking**:\n- 'Como os links de comunicação normalmente estão em configuração full-duplex, podemos usar o tráfego que está vindo para transportar ACKs do outro lado.'\n- ACKs são embutidos nos frames de dados na direção inversa.\n- Reduz overhead de frames de ACK separados.\n- Timer de piggybacking: se não há frame de dados em X ms, envia ACK puro.\n\n**Eficiência do GBN**:\n- η = W/(1+2a) se W < (1+2a), senão η = 1.\n- a = Tp/Tf = propagação / serialização.\n- Para satellite (a ≈ 27): W ≥ 55 para η = 1. Com W=7 e a=27: η = 7/55 ≈ 12,7%!",
    apostilaRef: "FRC2026_1_ENLACE_DADOS: GBN JR=1 vs SR JR>1; FRC_Camada_de_Enlace_Dados_LLC: Sliding Window",
    keyTerms: ["Go-Back-N", "Selective Repeat", "JR", "janela de recepção", "piggybacking", "buffer", "eficiência"],
    sourceExcerpt: "Protocolos de janela deslizante usando Repetição Seletiva (Selective Repeat) têm JR > 1 (Janela de Recepção maior que um), enquanto os que usam Go-Back-N têm JR = 1. A Repetição Seletiva requer buffer no receptor para frames fora de ordem.",
  },
  {
    id: "li-08",
    topic: "Ethernet e Wi-Fi",
    subtopic: "Padrões 802.11",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual padrão Wi-Fi 802.11 opera exclusivamente na banda de 5 GHz, e quais são as principais diferenças entre 802.11n e 802.11ac?",
    options: [
      { id: "a", text: "802.11b opera em 5 GHz; 802.11n e 802.11ac são idênticos" },
      { id: "b", text: "802.11a opera exclusivamente em 5 GHz; 802.11n (Wi-Fi 4) usa MIMO 4×4 em 2,4/5 GHz; 802.11ac (Wi-Fi 5) usa MU-MIMO e canais de até 160 MHz exclusivamente em 5 GHz" },
      { id: "c", text: "802.11g opera em 5 GHz; 802.11ac é idêntico ao 802.11n mas mais rápido" },
      { id: "d", text: "802.11ax (Wi-Fi 6) opera exclusivamente em 5 GHz; os outros operam em 2,4 GHz" },
    ],
    correctAnswer: "b",
    explanation:
      "**802.11a** (1999): 5 GHz, até 54 Mbps, OFDM — primeiro padrão exclusivamente em 5 GHz. **802.11n (Wi-Fi 4)**: 2,4 e/ou 5 GHz, até 600 Mbps, MIMO 4×4, canais de 40 MHz, frame aggregation. **802.11ac (Wi-Fi 5)**: apenas 5 GHz, até 6,9 Gbps teóricos, MU-MIMO (Multi-User MIMO), canais de 80/160 MHz, 256-QAM. A principal evolução do n para ac: MU-MIMO (permite transmissão simultânea para múltiplos clientes) e modulação mais densa (256-QAM vs 64-QAM).",
    deepDive:
      "**Evolução do 802.11 — tabela comparativa**:\n\n| Padrão | Ano | Banda | Taxa máx. | Modulação | Canais |\n|---|---|---|---|---|---|\n| 802.11a | 1999 | 5 GHz | 54 Mbps | OFDM 64-QAM | 20 MHz |\n| 802.11b | 1999 | 2,4 GHz | 11 Mbps | DSSS CCK | 22 MHz |\n| 802.11g | 2003 | 2,4 GHz | 54 Mbps | OFDM 64-QAM | 20 MHz |\n| 802.11n (Wi-Fi 4) | 2009 | 2,4/5 GHz | 600 Mbps | OFDM MIMO | 20/40 MHz |\n| 802.11ac (Wi-Fi 5) | 2013 | 5 GHz | 6,9 Gbps | OFDM MU-MIMO 256-QAM | 80/160 MHz |\n| 802.11ax (Wi-Fi 6) | 2019 | 2,4/5/6 GHz | 9,6 Gbps | OFDMA MU-MIMO 1024-QAM | 80/160 MHz |\n\n**Tecnologias-chave**:\n- **MIMO**: Multiple Input Multiple Output — múltiplas antenas para transmitir fluxos paralelos (streams espaciais).\n- **MU-MIMO**: transmissão simultânea para múltiplos usuários (beamforming).\n- **OFDMA** (802.11ax): sub-divide canal em Resource Units — múltiplos usuários simultâneos (como LTE).\n- **BSS Coloring** (802.11ax): identificação de BSS para reduzir interferência — aumenta reuso espacial.\n\n**Banda 2,4 GHz vs 5 GHz**:\n- 2,4 GHz: maior alcance (menos atenuação), mais congestionada (microondas, BT, vizinhos).\n- 5 GHz: menor alcance, mais canais não-sobrepostos, menos interferência.",
    apostilaRef: "FRC2026_1_ENLACE_DADOS: Wi-Fi 802.11; FRC2026_1_lista_exerc01: Questões sobre Wi-Fi",
    keyTerms: ["802.11a", "802.11n", "802.11ac", "Wi-Fi 5", "MU-MIMO", "OFDMA", "5 GHz", "canais"],
    sourceExcerpt: "802.11a: 5 GHz exclusivamente, 54 Mbps. 802.11n (Wi-Fi 4): 2,4/5 GHz, MIMO 4×4, até 600 Mbps. 802.11ac (Wi-Fi 5): 5 GHz exclusivamente, MU-MIMO, canais 80/160 MHz, 256-QAM, até 6,9 Gbps teóricos.",
  },
  {
    id: "li-09",
    topic: "Comutação de Pacotes",
    subtopic: "Comutação de Mensagens",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual é a principal desvantagem da comutação de mensagens em comparação com a comutação de pacotes para comunicações interativas?",
    options: [
      { id: "a", text: "Comutação de mensagens é mais cara para implementar" },
      { id: "b", text: "Mensagens completas (potencialmente grandes) são armazenadas inteiras em cada nó antes do repasse, causando grandes atrasos e bloqueando outros fluxos enquanto esperam" },
      { id: "c", text: "Comutação de mensagens não suporta roteamento dinâmico" },
      { id: "d", text: "Mensagens não podem ser fragmentadas, tornando a correção de erros impossível" },
    ],
    correctAnswer: "b",
    explanation:
      "Na **comutação de mensagens**, a mensagem completa (sem limite de tamanho) é armazenada em cada nó intermediário antes de ser encaminhada ao próximo (store-and-forward de mensagens). Problemas: (1) Se uma mensagem é de 10 MB, o nó intermediário precisa armazenar 10 MB antes de repassar — grande atraso e uso de memória. (2) Outras mensagens ficam enfileiradas esperando. Na **comutação de pacotes**, a mensagem é dividida em pacotes de tamanho fixo pequeno, permitindo **pipelining** — enquanto o 2º nó processa o pacote 1, o 1º nó pode enviar o pacote 2.",
    deepDive:
      "**Três paradigmas de comutação**:\n\n**1. Comutação de Circuitos**:\n- Setup → transmissão contínua → liberação.\n- Recursos dedicados — garantia de QoS.\n- Ineficiente com tráfego silencioso (voz: ~60% silêncio).\n- Sem pipelining necessário — fluxo contínuo.\n\n**2. Comutação de Mensagens** (histórico — Telex, e-mail primitivo):\n- Mensagem inteira → store-and-forward em cada nó.\n- Sem limite de tamanho → latência imprevisível.\n- Nó pode reter mensagem horas se destino ocupado.\n- Outros usuários bloqueados enquanto mensagem grande transita.\n\n**3. Comutação de Pacotes** (IP, X.25, ATM):\n- Mensagem dividida em pacotes de tamanho limitado.\n- Pipelining: eficiência muito maior.\n- Exemplo: mensagem de 3 pacotes por 3 nós:\n  - Sem pipelining: 9 tempos.\n  - Com pipelining: 5 tempos (3 + 3 − 1 = N+hops−1).\n- Roteamento independente por pacote (datagrama).\n- Melhor uso do enlace (estatístico multiplex).\n\n**Atraso total com pipelining**:\n- N pacotes de tamanho L, taxa R, D nós:\n- d_total = (N + D) × L/R + D × d_prop",
    apostilaRef: "FRC2026_1_ENLACE_DADOS: Comutação de Mensagens vs Pacotes; AP_CPACOTES: Seção 1",
    keyTerms: ["comutação de mensagens", "comutação de pacotes", "pipelining", "store-and-forward", "atraso", "latência"],
    sourceExcerpt: "Comutação de mensagens: a mensagem completa é armazenada em cada nó antes do repasse — sem limite de tamanho, causa grandes atrasos e bloqueia outros fluxos. Comutação de pacotes divide a mensagem em unidades menores, permitindo pipelining e uso eficiente dos enlaces.",
  },
  {
    id: "li-10",
    topic: "Comutação de Pacotes",
    subtopic: "Circuitos Virtuais",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual a diferença entre PVC (Permanent Virtual Circuit) e SVC (Switched Virtual Circuit) em redes de circuito virtual?",
    options: [
      { id: "a", text: "PVC é estabelecido sob demanda; SVC é permanente e sempre ativo" },
      { id: "b", text: "PVC é configurado manualmente pelo operador e permanece ativo indefinidamente; SVC é estabelecido e liberado dinamicamente por sinalização, como uma chamada telefônica" },
      { id: "c", text: "São a mesma coisa; diferem apenas no protocolo de sinalização usado" },
      { id: "d", text: "PVC usa roteamento por datagrama; SVC usa circuito virtual" },
    ],
    correctAnswer: "b",
    explanation:
      "**PVC** (Permanent Virtual Circuit): o circuito virtual é configurado **manualmente** pelo operador da rede — atribuição manual de VCI/VPI em cada switch ao longo do caminho. Permanece ativo 24×7 mesmo sem tráfego. Análogo a uma linha dedicada. Usado em Frame Relay PVC e ATM PVC. **SVC** (Switched Virtual Circuit): estabelecido **dinamicamente** por sinalização (Q.2931 em ATM, Q.931 em ISDN): fase de setup → transferência → teardown. Análogo a uma chamada telefônica — recursos alocados apenas durante a conexão.",
    deepDive:
      "**Comparação PVC vs SVC**:\n\n| Característica | PVC | SVC |\n|---|---|---|\n| Configuração | Manual (operador) | Automática (sinalização) |\n| Duração | Permanente | Sob demanda |\n| Overhead de setup | Nenhum (já configurado) | Setup + teardown |\n| Custo | Tarifado mensalmente | Tarifado por uso |\n| Reconfiguração | Lenta (intervenção humana) | Imediata (nova chamada) |\n| Disponibilidade | Imediata | Após setup |\n\n**Protocolos de sinalização SVC**:\n- **ATM**: UNI 3.1/4.0 — Q.2931 entre usuário e switch ATM.\n- **Frame Relay**: Local Management Interface (LMI) + sinalização de SVC.\n- **MPLS**: Label Distribution Protocol (LDP) ou RSVP-TE para LSPs.\n\n**Labels em circuito virtual**:\n- VCI (Virtual Channel Identifier) + VPI (Virtual Path Identifier) em ATM.\n- Células de 53 bytes (5 header + 48 dados) — tamanho fixo garante QoS previsível.\n- O caminho ATM substitui o endereço IP por pares VPI/VCI em cada hop — mais rápido para hardware.\n\n**Frame Relay**:\n- Simplificação do X.25 — sem controle de fluxo/erro por enlace (feito pelas camadas superiores).\n- DLCI (Data Link Connection Identifier) = identificador do circuito virtual.\n- Usado extensamente em WAN corporativas antes de MPLS/fibra.",
    apostilaRef: "AP_CPACOTES: Seção 3 (Circuito Virtual, PVC, SVC, ATM, Frame Relay)",
    keyTerms: ["PVC", "SVC", "circuito virtual", "VCI", "VPI", "ATM", "Frame Relay", "sinalização"],
    sourceExcerpt: "PVC (Permanent Virtual Circuit): configurado manualmente, sempre ativo. SVC (Switched Virtual Circuit): estabelecido sob demanda por sinalização, com fases de setup, transferência de dados e teardown — análogo a uma chamada telefônica.",
  },
  {
    id: "li-11",
    topic: "Redes e Endereçamento",
    subtopic: "IPv6",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Quais são as três principais motivações para o desenvolvimento do IPv6 em relação ao IPv4, além do esgotamento de endereços?",
    options: [
      { id: "a", text: "Velocidade, custo e compatibilidade com hardware legado" },
      { id: "b", text: "Espaço de endereços maior (128 bits), segurança nativa (IPsec obrigatório), configuração automática (SLAAC) e cabeçalho simplificado para roteamento mais eficiente" },
      { id: "c", text: "Apenas o espaço de endereços — as demais características são idênticas ao IPv4" },
      { id: "d", text: "Suporte a multicast e NAT incorporados" },
    ],
    correctAnswer: "b",
    explanation:
      "**IPv6 — motivações além do espaço de endereços**: (1) **Espaço**: 128 bits = 3,4×10³⁸ endereços — elimina NAT, restaura modelo fim-a-fim. (2) **Segurança**: IPsec originalmente obrigatório (autenticação e criptografia nativa). (3) **Autoconfiguração**: SLAAC (Stateless Address Autoconfiguration) — host deriva endereço do prefixo do router + EUI-64 do MAC, sem DHCP. (4) **Cabeçalho simplificado**: 40 bytes fixos (sem opções no cabeçalho base), processamento mais rápido nos roteadores. Opções movidas para extension headers.",
    deepDive:
      "**Diferenças IPv4 vs IPv6**:\n\n| Característica | IPv4 | IPv6 |\n|---|---|---|\n| Endereço | 32 bits (~4×10⁹) | 128 bits (3,4×10³⁸) |\n| Cabeçalho | 20–60 bytes variável | 40 bytes fixo |\n| Fragmentação | Roteadores e hosts | Apenas hosts |\n| Checksum | No cabeçalho | Removido (confia na L2) |\n| NAT | Necessário | Desnecessário |\n| Broadcast | Sim | Não (substituído por multicast) |\n| DHCP | Necessário | Opcional (SLAAC) |\n| IPsec | Opcional | Integrado (obrigatório no RFC original) |\n\n**Tipos de endereço IPv6**:\n- **Unicast Global** (2000::/3): roteável na Internet — ex: 2001:db8::/32 (documentação).\n- **Link-Local** (fe80::/10): apenas na mesma rede local — gerado automaticamente.\n- **Loopback**: ::1/128 (equivale a 127.0.0.1).\n- **Multicast** (ff00::/8): substitui broadcast — ff02::1 = all-nodes, ff02::2 = all-routers.\n- **Anycast**: endereço atribuído a múltiplos nós — roteado para o mais próximo.\n\n**Transição IPv4→IPv6**:\n- **Dual Stack**: nó opera com ambos os protocolos.\n- **Tunelamento 6in4**: encapsula IPv6 em IPv4.\n- **NAT64/DNS64**: permite hosts IPv6 acessar servidores IPv4.",
    apostilaRef: "FRC2026_1_lista_exerc01: IPv6 vs IPv4; Fundamentos de Redes — Endereçamento IP",
    keyTerms: ["IPv6", "IPv4", "SLAAC", "IPsec", "128 bits", "dual stack", "tunelamento", "link-local"],
    sourceExcerpt: "IPv6 foi desenvolvido principalmente para resolver o esgotamento de endereços IPv4 (32 bits ≈ 4 bilhões). Outros objetivos: espaço de 128 bits (3,4×10³⁸ endereços), IPsec nativo, autoconfiguração SLAAC, cabeçalho fixo de 40 bytes para processamento mais eficiente nos roteadores.",
  },
  {
    id: "li-12",
    topic: "Redes e Endereçamento",
    subtopic: "Tunelamento",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "O que é tunelamento de IPv6 sobre IPv4 (6in4) e qual problema específico ele resolve na transição entre os protocolos?",
    options: [
      { id: "a", text: "Converte endereços IPv6 em IPv4 permanentemente para compatibilidade" },
      { id: "b", text: "Encapsula pacotes IPv6 completos dentro de pacotes IPv4, permitindo que tráfego IPv6 atravesse redes que só entendem IPv4 sem modificar os roteadores intermediários" },
      { id: "c", text: "Cria uma VPN entre redes IPv6 e IPv4 para comunicação segura" },
      { id: "d", text: "Substitui o cabeçalho IPv6 por um cabeçalho IPv4 equivalente durante o trânsito" },
    ],
    correctAnswer: "b",
    explanation:
      "O **tunelamento 6in4** encapsula o pacote IPv6 completo (cabeçalho + dados) como payload de um pacote IPv4 (protocolo IP número 41). O pacote IPv4 viaja normalmente pela rede IPv4 existente — roteadores IPv4 não precisam entender IPv6. Nos extremos do túnel (pontos de encapsulamento/desencapsulamento), o roteador 'dual stack' remove o cabeçalho IPv4 e processa o IPv6. Resolve a coexistência durante a longa transição: ilhas IPv6 comunicam-se através de oceanos IPv4.",
    deepDive:
      "**Mecanismos de transição IPv4/IPv6**:\n\n**1. Dual Stack (RFC 4213)**:\n- Nó implementa ambos IPv4 e IPv6 simultaneamente.\n- Usa IPv6 quando disponível, IPv4 como fallback.\n- Requer endereços de ambos os tipos.\n\n**2. Tunelamento (vários tipos)**:\n- **6in4 (RFC 4213)**: IPv6 em IPv4 — configurado manualmente. Protocolo 41.\n- **6to4 (RFC 3056)**: automático — prefixo 2002::/16 com 32 bits do IPv4 embutidos.\n- **Teredo (RFC 4380)**: atravessa NAT — usa UDP sobre IPv4.\n- **ISATAP**: links virtuais IPv6 sobre infraestrutura IPv4 intra-site.\n\n**3. Tradução**:\n- **NAT64 (RFC 6146)**: traduz pacotes IPv6 ↔ IPv4.\n- **DNS64 (RFC 6147)**: gera registros AAAA falsos para hosts IPv4-only.\n\n**Fragmentação em túneis**:\n- O tunelamento adiciona 20 bytes de cabeçalho IPv4 ao pacote IPv6.\n- Se MTU do caminho é 1500 bytes, pacote IPv6 deve ter no máximo 1480 bytes.\n- IPv6 não permite fragmentação em roteadores — hosts devem usar Path MTU Discovery (PMTUD).\n- PMTUD: host descobre MTU mínimo do caminho via mensagens ICMPv6 'Packet Too Big'.",
    apostilaRef: "FRC2026_1_lista_exerc01: Tunelamento IPv6 sobre IPv4; Fundamentos de Redes",
    keyTerms: ["tunelamento", "6in4", "dual stack", "NAT64", "IPv6", "IPv4", "encapsulamento", "PMTUD"],
    sourceExcerpt: "Tunelamento 6in4: encapsula pacotes IPv6 completos dentro de datagramas IPv4 (protocolo número 41). Roteadores IPv4 intermediários não precisam suportar IPv6 — processam apenas o cabeçalho IPv4 externo. Nos extremos do túnel, o encapsulamento/desencapsulamento é realizado por nós dual stack.",
  },
  {
    id: "li-13",
    topic: "Ethernet e Wi-Fi",
    subtopic: "Gigabit Ethernet",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Qual foi a principal mudança no protocolo de acesso ao meio ao passar de Ethernet 100BASE-TX para Gigabit Ethernet (1000BASE-T) em switches modernos?",
    options: [
      { id: "a", text: "O CSMA/CD foi aprimorado para detectar colisões mais rapidamente em 1 Gbps" },
      { id: "b", text: "No Gigabit Ethernet em full-duplex (modo padrão em switches), o CSMA/CD não é usado — cada porta é um enlace ponto-a-ponto dedicado sem colisões" },
      { id: "c", text: "O Gigabit Ethernet usa CSMA/CA em vez de CSMA/CD" },
      { id: "d", text: "O Gigabit Ethernet eliminou o uso de ACKs para aumentar a velocidade" },
    ],
    correctAnswer: "b",
    explanation:
      "No **Gigabit Ethernet full-duplex** (padrão em switches modernos), cada porta do switch forma um enlace **ponto-a-ponto dedicado** — não há meio compartilhado, portanto **não há colisões** e o CSMA/CD é **desnecessário**. O dispositivo pode transmitir e receber simultaneamente (full-duplex). Em redes com hubs (half-duplex), o CSMA/CD ainda seria necessário, mas praticamente não existem hubs Gigabit. O Gigabit usa **PAM-5** (5 níveis de sinalização) nos 4 pares do cabo UTP, transmitindo 250 Mbps em cada par.",
    deepDive:
      "**Gigabit Ethernet (1000BASE-T) — características técnicas**:\n\n**Sinalização física**:\n- 4 pares do cabo Cat5e/Cat6 (todos utilizados, vs 2 pares no Fast Ethernet).\n- PAM-5 (Pulse Amplitude Modulation 5 níveis: −2, −1, 0, +1, +2): 2 bits por símbolo.\n- 125 Msímbolos/s em cada par × 4 pares × 2 bits = 1 Gbps.\n- Full-duplex em todos os pares simultaneamente (cancelamento de eco).\n\n**Por que CSMA/CD falha em 1 Gbps**:\n- Tamanho mínimo de frame determina domínio de colisão detectável.\n- 10 Mbps: frame mínimo 64 bytes = 51,2 µs → domínio 5000 m (10 km ÷ 2).\n- 1 Gbps: 64 bytes = 0,512 µs → domínio máximo = 51 metros! Inviável.\n- Solução: **full-duplex obrigatório** em switches → sem colisões → CSMA/CD desnecessário.\n- Alternativa half-duplex (hub Gigabit): carrier extension a 512 bytes + bursting → nunca implementado comercialmente.\n\n**IEEE 802.3 Gigabit variants**:\n- 1000BASE-T: UTP Cat5e, 100 m.\n- 1000BASE-SX: fibra MMF, 550 m.\n- 1000BASE-LX: fibra SMF, 10 km.\n- 10GBASE-T: UTP Cat6a, 100 m — mesma lógica (full-duplex, sem CSMA/CD).",
    apostilaRef: "FRC2026_1_lista_exerc01: Gigabit Ethernet; FRC2026_1_ENLACE_DADOS: Ethernet",
    keyTerms: ["Gigabit Ethernet", "1000BASE-T", "full-duplex", "CSMA/CD", "PAM-5", "switch", "ponto-a-ponto"],
    sourceExcerpt: "Gigabit Ethernet full-duplex em switches: cada porta forma um enlace ponto-a-ponto dedicado — sem meio compartilhado, sem colisões, CSMA/CD desnecessário. Usa PAM-5 (5 níveis de sinalização) nos 4 pares de UTP Cat5e/Cat6, com full-duplex simultâneo via cancelamento de eco.",
  },
  {
    id: "li-14",
    topic: "Redes e Endereçamento",
    subtopic: "Sub-redes e VLSM",
    difficulty: "hard",
    type: "calculation",
    question:
      "A rede 192.168.1.0/24 precisa ser dividida em três sub-redes com capacidade para 15, 8 e 2 hosts respectivamente. Usando VLSM, quais máscaras são necessárias e quais intervalos de endereços cada sub-rede ocupa?",
    options: [
      { id: "a", text: "/27 (30 hosts), /27 (30 hosts), /27 (30 hosts) — todas iguais por simplicidade" },
      { id: "b", text: "/27 (30 hosts): 192.168.1.0–31; /28 (14 hosts): 192.168.1.32–47; /30 (2 hosts): 192.168.1.48–51" },
      { id: "c", text: "/24, /25, /26 — usando apenas as classes padrão" },
      { id: "d", text: "/28 (14 hosts) falha — precisaria de /27 para 15 hosts em todas" },
    ],
    correctAnswer: "b",
    explanation:
      "Usando VLSM (de maior para menor sub-rede): (1) **15 hosts**: precisa de 2⁵−2=30 hosts → /27 → 192.168.1.0/27 (endereços .0 a .31, 30 hosts: .1 a .30, broadcast .31). (2) **8 hosts**: precisa de 2⁴−2=14 hosts → /28 → próximo bloco alinhado: 192.168.1.32/28 (.32 a .47, hosts .33 a .46). (3) **2 hosts**: 2²−2=2 hosts exatos → /30 → 192.168.1.48/30 (.48 a .51, hosts .49 e .50, broadcast .51). Note: 8 hosts requer /28 (16 endereços, 14 hosts) pois /29 daria apenas 6 hosts.",
    deepDive:
      "**VLSM — processo sistemático**:\n\n1. Ordenar sub-redes da maior para a menor (maior aproveitamento).\n2. Para cada sub-rede, calcular: h = ⌈log₂(hosts + 2)⌉, prefixo = 32 − h.\n3. Alocar bloco contíguo e alinhado (endereço de rede múltiplo do tamanho do bloco).\n\n**Cálculo detalhado**:\n| Sub-rede | Hosts req. | h bits | Bloco | Prefixo | Hosts úteis |\n|---|---|---|---|---|---|\n| 1ª | 15 | 5 (2⁵=32) | 32 end. | /27 | 30 |\n| 2ª | 8 | 4 (2⁴=16) | 16 end. | /28 | 14 |\n| 3ª | 2 | 2 (2²=4) | 4 end. | /30 | 2 |\n\n**Alocação**:\n- Sub-rede /27: 192.168.1.0 – .31 (rede .0, broadcast .31)\n- Sub-rede /28: 192.168.1.32 – .47 (rede .32, broadcast .47)\n- Sub-rede /30: 192.168.1.48 – .51 (rede .48, broadcast .51)\n- Espaço restante: .52 – .255 (disponível para expansão)\n\n**Regra de alinhamento**: o endereço de rede de um bloco /n deve ser múltiplo de 2^(32−n).\n- /27 (32 end.): múltiplo de 32 → .0, .32, .64, ...\n- /28 (16 end.): múltiplo de 16 → .16, .32, .48, ...\n- /30 (4 end.): múltiplo de 4 → .48, .52, .56, ...",
    apostilaRef: "FRC2026_1_lista_exerc01: Sub-redes com diferentes quantidades de hosts; VLSM/CIDR",
    keyTerms: ["VLSM", "sub-rede", "CIDR", "/27", "/28", "/30", "hosts úteis", "alinhamento"],
    sourceExcerpt: "VLSM (Variable Length Subnet Masking): permite criar sub-redes de tamanhos diferentes na mesma organização. 15 hosts → /27 (30 úteis); 8 hosts → /28 (14 úteis); 2 hosts → /30 (2 úteis exatos). Alocar da maior para a menor, garantindo alinhamento de bloco.",
  },
  {
    id: "li-15",
    topic: "Redes e Endereçamento",
    subtopic: "Fragmentação IP",
    difficulty: "hard",
    type: "calculation",
    question:
      "Um datagrama IPv4 com 6048 bytes de dados (sem contar o cabeçalho IP de 20 bytes) precisa ser enviado por uma rede com MTU de 1500 bytes. Em quantos fragmentos é dividido e qual é o tamanho do último fragmento?",
    options: [
      { id: "a", text: "4 fragmentos; último com 1480 bytes de dados" },
      { id: "b", text: "5 fragmentos; último com 128 bytes de dados + 20 bytes de cabeçalho = 148 bytes" },
      { id: "c", text: "5 fragmentos; último com 608 bytes de dados" },
      { id: "d", text: "6 fragmentos; último com 68 bytes de dados" },
    ],
    correctAnswer: "b",
    explanation:
      "Dados por fragmento = MTU − cabeçalho IP = 1500 − 20 = **1480 bytes** (e deve ser múltiplo de 8). 6048 ÷ 1480 = 4,086 → **4 fragmentos completos** (4×1480=5920 bytes) + **1 fragmento final** com 6048−5920=**128 bytes** de dados. Cada fragmento: 1480+20=1500 bytes (exceto último: 128+20=148 bytes). Total: **5 fragmentos**. Offsets: 0, 185, 370, 555, 740 (em unidades de 8 bytes = 1480÷8=185).",
    deepDive:
      "**Fragmentação IPv4 — detalhes técnicos**:\n\n**Campo Fragment Offset**: indica posição dos dados do fragmento no datagrama original, em unidades de 8 bytes.\n- Fragmento 1: offset=0, dados bytes 0–1479, MF=1\n- Fragmento 2: offset=185 (185×8=1480), dados bytes 1480–2959, MF=1\n- Fragmento 3: offset=370, dados bytes 2960–4439, MF=1\n- Fragmento 4: offset=555, dados bytes 4440–5919, MF=1\n- Fragmento 5: offset=740, dados bytes 5920–6047, MF=0 (último)\n\n**Campos de fragmentação no cabeçalho IPv4**:\n- **Identification** (16 bits): mesmo valor em todos os fragmentos do mesmo datagrama.\n- **Flags** (3 bits): bit DF (Don't Fragment) e MF (More Fragments).\n- **Fragment Offset** (13 bits): posição em unidades de 8 bytes.\n\n**Reassembly**: feito **apenas no destino final** (roteadores não remontam). Se qualquer fragmento perdido: todo o datagrama é descartado (sem retransmissão — isso é do TCP).\n\n**Problemas da fragmentação**:\n- Overhead de reassembly no destino.\n- Se fragmento perdido: todo datagrama é perdido (impacta desempenho TCP).\n- Fragmentos de fragmentos possíveis em cascata de MTUs menores.\n\n**Solução moderna**: Path MTU Discovery (PMTUD, RFC 1191). Host envia com bit DF=1; se MTU inadequado, roteador envia ICMP 'Fragmentation Needed' com MTU do enlace; host reduz tamanho.\n\n**IPv6**: não fragmenta em roteadores — PMTUD obrigatório.",
    apostilaRef: "FRC2026_1_lista_exerc01: Fragmentação de datagramas; Protocolos de Rede — IPv4",
    keyTerms: ["fragmentação", "MTU", "Fragment Offset", "MF flag", "DF flag", "PMTUD", "reassembly", "IPv4"],
    sourceExcerpt: "Fragmentação IPv4: dados por fragmento = MTU − 20 bytes (cabeçalho) = 1480 bytes (múltiplo de 8). Para 6048 bytes: ⌈6048÷1480⌉ = 5 fragmentos. Campos: Identification (mesmo em todos), MF flag (1 nos intermediários, 0 no último), Fragment Offset (posição em unidades de 8 bytes).",
  },
  {
    id: "li-16",
    topic: "Redes e Endereçamento",
    subtopic: "ARP",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "O host K (192.168.1.10) quer enviar um pacote ao host Y (10.0.0.20), e o roteador Z tem interface 192.168.1.1 (para K) e 10.0.0.1 (para Y). Quantas mensagens ARP Request são geradas no total para a primeira comunicação K→Y?",
    options: [
      { id: "a", text: "1 ARP Request — K resolve o MAC de Y diretamente" },
      { id: "b", text: "2 ARP Requests — K resolve o MAC do gateway Z (na sua sub-rede) e Z resolve o MAC de Y (na sub-rede de Y)" },
      { id: "c", text: "3 ARP Requests — K, Z e Y trocam ARPs entre si" },
      { id: "d", text: "0 — roteadores não usam ARP, apenas switches" },
    ],
    correctAnswer: "b",
    explanation:
      "K e Y estão em sub-redes diferentes. O processo é: (1) K verifica que 10.0.0.20 não está na mesma sub-rede → vai para o gateway (Z: 192.168.1.1). K não tem o MAC de Z → envia **ARP Request broadcast** na sua sub-rede: 'Quem tem 192.168.1.1?'. Z responde. (2) K envia o pacote com dst_MAC = MAC_Z. Z roteia → precisa enviar para Y (10.0.0.20) na sub-rede 10.0.0.0. Z não tem MAC de Y → envia **2º ARP Request** na sub-rede de Y: 'Quem tem 10.0.0.20?'. Y responde. Total: **2 ARP Requests**.",
    deepDive:
      "**Processo ARP em comunicação entre sub-redes**:\n\n**Etapa 1 — K consulta ARP cache**:\n- K quer enviar a 10.0.0.20: d_IP = 10.0.0.20, minha_rede = 192.168.1.0/24.\n- 10.0.0.20 ≠ 192.168.1.x → não está na minha sub-rede → usa gateway.\n- Gateway = 192.168.1.1 (Z). K verifica ARP cache: MAC de 192.168.1.1?\n- Não encontrado → **ARP Request 1**: broadcast na LAN de K.\n\n**Etapa 2 — Z processa o pacote**:\n- Z recebe frame Ethernet com dst_MAC = MAC_Z, dst_IP = 10.0.0.20.\n- Z verifica tabela de roteamento: 10.0.0.20 está em 10.0.0.0/24, interface eth1.\n- Z verifica ARP cache para 10.0.0.20: não encontrado → **ARP Request 2**: broadcast na LAN de Y.\n- Y responde; Z encaminha o pacote.\n\n**ARP Cache e validade**:\n- ARP cache tipicamente tem timeout de 20 minutos (configurável).\n- Comunicações subsequentes K→Y não geram ARP (cache válido).\n- Gratuitous ARP invalida caches quando endereço MAC muda.\n\n**Proxy ARP**:\n- Roteador responde ARP em nome de hosts em outra sub-rede.\n- Usado quando hosts não conhecem máscara correta ou gateway.\n- K acha que Y está na mesma sub-rede → ARP para 10.0.0.20 → roteador responde com seu próprio MAC.\n\n**ARP para IPv6**: substituído pelo **Neighbor Discovery Protocol (NDP)** usando ICMPv6 multicast solicited-node.",
    apostilaRef: "FRC2026_1_lista_exerc01: Questão sobre contagem de ARPs; ARP e Roteamento",
    keyTerms: ["ARP", "gateway", "sub-rede", "ARP cache", "Proxy ARP", "NDP", "roteamento"],
    sourceExcerpt: "K→Y entre sub-redes diferentes: (1) K não conhece MAC do gateway Z → ARP Request 1 na LAN de K. (2) Z não conhece MAC de Y → ARP Request 2 na LAN de Y. Total: 2 ARP Requests para primeira comunicação. Comunicações posteriores usam os caches ARP.",
  },
  {
    id: "li-17",
    topic: "Redes e Endereçamento",
    subtopic: "Endereços Especiais",
    difficulty: "easy",
    type: "multiple-choice",
    question:
      "Para que serve o endereço 127.0.0.1 (loopback) e o bloco 127.0.0.0/8? O que acontece com os pacotes enviados para esse endereço?",
    options: [
      { id: "a", text: "É o endereço do roteador padrão (gateway) na rede local" },
      { id: "b", text: "É o endereço de loopback — pacotes enviados a 127.x.x.x ficam no próprio host sem passar pela placa de rede física; usados para teste de software de rede e comunicação inter-processos local" },
      { id: "c", text: "É o endereço de broadcast de qualquer rede Classe A" },
      { id: "d", text: "É reservado para uso futuro pelo IANA" },
    ],
    correctAnswer: "b",
    explanation:
      "O bloco **127.0.0.0/8** (especialmente 127.0.0.1) é o endereço de **loopback** — qualquer pacote enviado para 127.x.x.x é processado pela pilha TCP/IP do próprio host e retorna imediatamente, **sem** ser transmitido pela interface de rede física. Usos: (1) Testar se a pilha TCP/IP está funcionando. (2) Comunicação entre processos no mesmo host via sockets (ex: servidor web local em localhost:8080). (3) Serviços que devem ser acessíveis apenas localmente. Em IPv6: **::1/128** é o equivalente.",
    deepDive:
      "**Endereços IPv4 especiais (RFC 5735)**:\n\n| Bloco | Uso | Roteável? |\n|---|---|---|\n| 0.0.0.0/8 | Rede atual (\"this network\") | Não |\n| 10.0.0.0/8 | Privado (RFC 1918) | Não |\n| 127.0.0.0/8 | Loopback | Não |\n| 169.254.0.0/16 | Link-local (APIPA) | Não |\n| 172.16.0.0/12 | Privado (RFC 1918) | Não |\n| 192.168.0.0/16 | Privado (RFC 1918) | Não |\n| 224.0.0.0/4 | Multicast | Especial |\n| 255.255.255.255 | Broadcast limitado | Não |\n\n**Loopback no sistema operacional**:\n- Interface virtual 'lo' (Linux) ou 'Loopback Adapter' (Windows).\n- Nenhum hardware físico envolvido — processado diretamente pela pilha IP.\n- MTU típica: 65536 bytes (pode usar pacotes maiores sem fragmentação).\n- Latência ~0 µs (sem propagação, sem serialização de hardware).\n\n**APIPA** (Automatic Private IP Addressing): 169.254.0.0/16 — quando DHCP falha, Windows/Linux autoatribuem endereço nessa faixa para comunicação local.",
    apostilaRef: "FRC2026_1_lista_exerc01: Endereço loopback; RFC 5735 — Endereços Especiais IPv4",
    keyTerms: ["loopback", "127.0.0.1", "pilha TCP/IP", "interface lo", "APIPA", "endereços especiais", "::1"],
    sourceExcerpt: "Endereço de loopback (127.0.0.0/8): pacotes enviados a 127.x.x.x permanecem no próprio host sem passar pela interface de rede física — processados internamente pela pilha TCP/IP. Usado para testes de software de rede e comunicação inter-processos local (localhost).",
  },
  {
    id: "re-04",
    topic: "Redes e Endereçamento",
    subtopic: "Sub-redes e CIDR",
    difficulty: "hard",
    type: "calculation",
    question:
      "Um endereço IP de Classe A usa a máscara 255.255.224.0. Quantos bits são usados para sub-rede (além dos 8 da classe), quantas sub-redes e quantos hosts por sub-rede?",
    options: [
      { id: "a", text: "/19: 11 bits de sub-rede, 2048 sub-redes, 8190 hosts" },
      { id: "b", text: "/19: 11 bits de sub-rede, 2046 sub-redes, 8190 hosts" },
      { id: "c", text: "/19: 3 bits de sub-rede (apenas os do 3º octeto), 6 sub-redes, 8190 hosts" },
      { id: "d", text: "/24: 16 bits de sub-rede, 65534 hosts" },
    ],
    correctAnswer: "a",
    explanation:
      "Máscara 255.255.224.0 em binário: 11111111.11111111.11100000.00000000 → prefixo **/19** (19 bits de rede). Classe A: 8 bits de rede original. Bits de sub-rede adicionais = 19 − 8 = **11 bits**. Sub-redes: 2¹¹ = **2048 sub-redes**. Bits de host: 32 − 19 = 13 bits → 2¹³ − 2 = 8192 − 2 = **8190 hosts** utilizáveis por sub-rede. Nota: hoje em dia com CIDR, não se subtrai mais as sub-redes 'todas zero' e 'todas um' — todas as 2048 são usáveis.",
    deepDive:
      "**Cálculo de sub-redes — método passo a passo**:\n\n1. **Converter máscara para prefixo**: 255.255.224.0\n   - 11111111 = 8 bits; 11111111 = 8 bits; 11100000 = 3 bits; 00000000 = 0 bits\n   - Total = 8+8+3+0 = **/19**\n\n2. **Identificar bits emprestados**: Classe A tem /8 original. Bits de sub-rede = 19-8 = 11.\n\n3. **Calcular sub-redes**: 2¹¹ = 2048 (com CIDR, todas usáveis).\n\n4. **Calcular hosts**: bits de host = 32-19 = 13. Hosts = 2¹³ - 2 = 8190.\n\n5. **Incremento de sub-rede**: 2^(32-19) = 2^13 = 8192. Sub-redes incrementam de 8192 em 8192 no espaço de endereços.\n\n**Exemplos de sub-redes** (para rede 10.0.0.0/8):\n- 10.0.0.0/19 (hosts 10.0.0.1 – 10.0.31.254)\n- 10.0.32.0/19 (hosts 10.0.32.1 – 10.0.63.254)\n- 10.0.64.0/19 (hosts 10.0.64.1 – 10.0.95.254)\n- ...\n- 10.255.224.0/19 (hosts 10.255.224.1 – 10.255.255.254)\n\n**255.255.224.0 em contextos comuns**:\n- Incremento no 3º octeto: 32 (224 = 11100000 → passo = 100000 = 32).\n- Sub-redes no 3º octeto: x.x.0.0, x.x.32.0, x.x.64.0, x.x.96.0, x.x.128.0, x.x.160.0, x.x.192.0, x.x.224.0 (8 blocos por valor de 2º octeto × 256 valores = 2048 total).",
    apostilaRef: "FRC2026_1_lista_exerc01: Classe A com máscara 255.255.224.0; Endereçamento IP",
    keyTerms: ["máscara de sub-rede", "/19", "Classe A", "bits de sub-rede", "hosts por sub-rede", "CIDR"],
    sourceExcerpt: "Máscara 255.255.224.0 = /19 (11111111.11111111.11100000.00000000). Para Classe A (/8 original): 11 bits adicionais de sub-rede → 2¹¹ = 2048 sub-redes; 13 bits de host → 2¹³ − 2 = 8190 hosts utilizáveis por sub-rede.",
  },
  {
    id: "cf-07",
    topic: "Camada Física",
    subtopic: "Digital vs Analógico",
    difficulty: "medium",
    type: "multiple-choice",
    question:
      "Quais são os dois principais argumentos técnicos que justificam a preferência por transmissão digital em detrimento da analógica em redes de computadores modernas?",
    options: [
      { id: "a", text: "Menor custo de equipamento e maior alcance sem amplificadores" },
      { id: "b", text: "Regeneração de sinal (amplificadores digitais não amplificam ruído acumulado) e integração natural com processadores digitais (codificação, criptografia, multiplexação por software)" },
      { id: "c", text: "Transmissão digital usa menos largura de banda e é mais imune a interferências eletromagnéticas" },
      { id: "d", text: "Digital é mais barato e não precisa de conversores analógico-digital" },
    ],
    correctAnswer: "b",
    explanation:
      "**Argumento 1 — Regeneração**: amplificadores digitais (repetidores) distinguem 0 de 1 e regeneram o sinal perfeitamente, **sem acumular ruído**. Amplificadores analógicos amplificam o ruído junto com o sinal — após vários estágios, o ruído domina. **Argumento 2 — Integração**: processamento digital (codificação, criptografia, compressão, multiplexação TDM) é feito em software/hardware digital integrado, tornando as redes programáveis e flexíveis. A conversão A/D (PCM) permite que voz, vídeo e dados compartilhem a mesma infraestrutura digital.",
    deepDive:
      "**Transmissão Digital vs Analógica — análise técnica**:\n\n**Vantagens do digital**:\n1. **Regeneração de sinal**: repetidor digital detecta 0/1 e regenera sinal limpo → sem acúmulo de ruído ao longo de links longos.\n2. **Codificação de erros**: CRC, Reed-Solomon, Turbo codes, LDPC — detectam e corrigem erros → confiabilidade independente do meio.\n3. **Integração com computadores**: dados, voz (PCM), vídeo — tudo vira bits → mesmo protocolo, mesma rede.\n4. **Segurança**: criptografia (AES, RSA) trivial em domínio digital.\n5. **Multiplexação**: TDM combina múltiplos sinais digitais sem interferência entre canais.\n6. **Processamento de sinal**: equalização adaptativa, cancelamento de eco — implementados em DSPs.\n\n**Desvantagens do digital**:\n1. **Largura de banda**: sinal digital (quadrado) exige mais harmônicas → mais banda que analógico equivalente.\n2. **Conversão A/D**: voz e vídeo precisam ser digitalizados (PCM) — overhead de quantização.\n3. **Sincronização**: sistemas digitais precisam de sincronismo de clock preciso.\n\n**Tendência histórica**: nas décadas de 1960–80, redes passaram de analógico para digital. Hoje praticamente toda transmissão de longa distância é digital (fibra óptica, satélite digital). Redes celulares: analógico (1G) → digital (2G em diante).",
    apostilaRef: "FRC2026_1_CAMADA_FISICA: Digital vs analógico; AP_TXDADOS: Seção 1 (Transmissão de Dados)",
    keyTerms: ["transmissão digital", "transmissão analógica", "regeneração", "repetidor digital", "PCM", "codificação de erros"],
    sourceExcerpt: "Transmissão digital: (1) Regeneração — repetidores digitais distinguem 0 de 1 e regeneram o sinal sem acumular ruído, ao contrário dos amplificadores analógicos. (2) Integração — processamento de codificação, criptografia e multiplexação é realizado naturalmente em hardware/software digital.",
  },
  {
    id: "cc-03",
    topic: "Comutação de Circuitos",
    subtopic: "Comutadores Multi-estágio",
    difficulty: "hard",
    type: "multiple-choice",
    question:
      "Em um comutador de matriz crosspoint N×N, qual é o número de pontos de cruzamento necessários? Por que os comutadores multi-estágio (Clos) foram desenvolvidos?",
    options: [
      { id: "a", text: "N pontos de cruzamento; Clos foi desenvolvido para maior velocidade" },
      { id: "b", text: "N² pontos de cruzamento; Clos reduz isso para ~4N^(3/2) ao custo de possivelmente ser bloqueante sem dimensionamento adequado" },
      { id: "c", text: "N/2 pontos de cruzamento; Clos foi desenvolvido para roteamento mais eficiente" },
      { id: "d", text: "2N pontos de cruzamento; Clos elimina completamente o bloqueio" },
    ],
    correctAnswer: "b",
    explanation:
      "Um comutador **crosspoint N×N** requer **N² pontos de cruzamento**. Para N=1000: 10⁶ crosspoints — impraticável em hardware. O comutador **multi-estágio de Clos** (3 estágios) reduz isso para aproximadamente **4N^(3/2)** crosspoints. Para N=1000: ≈ 126.000 — muito mais viável. O **teorema de Clos**: um comutador de 3 estágios com k switches no estágio médio e n entradas/saídas por switch de primeiro estágio é **não-bloqueante** (strict-sense) se k ≥ 2n−1.",
    deepDive:
      "**Comutador Crosspoint (Spatial Division)**:\n- Matriz N×N de elementos de comutação (transistores/relés).\n- Qualquer entrada pode ser conectada a qualquer saída simultaneamente (se N²/N conexões simultâneas).\n- Para N entradas e N saídas: N² crosspoints.\n- Custo escala com N² → inviável para N grande.\n\n**Rede de Clos (3 estágios: r×n, k×r, n×k)**:\n- 1º estágio: r switches, cada um com n entradas e k saídas.\n- 2º estágio: k switches, cada um com r entradas e r saídas.\n- 3º estágio: r switches, cada um com k entradas e n saídas.\n- Total crosspoints: 2·r·n·k + k·r².\n- Ótimo: n = ⌊√(N/2)⌋, k = 2n−1 → crosspoints ≈ 4N^(3/2) − 2N.\n\n**Bloqueante vs Não-bloqueante**:\n- **Não-bloqueante** (strict-sense): k ≥ 2n−1 — sempre existe caminho livre.\n- **Rearrangeably non-blocking**: k ≥ n — pode precisar rearranjar conexões existentes (não interrompe serviço).\n- **Bloqueante**: k < n — pode negar conexão mesmo com entrada e saída livres.\n\n**TST (Time-Space-Time)**:\n- Comutação temporal na entrada + comutação espacial + comutação temporal na saída.\n- Mais comum em centrais telefônicas digitais modernas.\n- Permite combinar TDM com comutação espacial para alta capacidade.",
    apostilaRef: "AP_CCIRCUITOS: Seções 2–3 (Crosspoint, Clos, TST, Comutação Multi-estágio)",
    keyTerms: ["crosspoint", "Clos", "comutador multi-estágio", "bloqueante", "não-bloqueante", "TST", "N²"],
    sourceExcerpt: "Comutador crosspoint N×N: N² pontos de cruzamento — para N=1000, são 10⁶ crosspoints (impraticável). Rede de Clos (3 estágios) reduz para ~4N^(3/2) crosspoints. Não-bloqueante se k ≥ 2n−1 no estágio médio (teorema de Clos).",
  },
];

export const topicGroups = [
  { id: "cf", label: "Camada Física", count: questions.filter(q => q.topic === "Camada Física").length },
  { id: "mx", label: "Multiplexação", count: questions.filter(q => q.topic === "Multiplexação").length },
  { id: "ce", label: "Camada de Enlace", count: questions.filter(q => q.topic === "Camada de Enlace").length },
  { id: "cc", label: "Comutação de Circuitos", count: questions.filter(q => q.topic === "Comutação de Circuitos").length },
  { id: "cp", label: "Comutação de Pacotes", count: questions.filter(q => q.topic === "Comutação de Pacotes").length },
  { id: "re", label: "Redes e Endereçamento", count: questions.filter(q => q.topic === "Redes e Endereçamento").length },
  { id: "ew", label: "Ethernet e Wi-Fi", count: questions.filter(q => q.topic === "Ethernet e Wi-Fi").length },
];
