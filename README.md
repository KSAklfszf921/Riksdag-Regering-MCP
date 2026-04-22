<img width="1360" height="497" alt="Skärmavbild 2025-11-20 kl  09 01 01" src="https://github.com/user-attachments/assets/2d1daf29-80f0-4404-b01a-4cc3705bcf69" />

# Riksdag & Regering MCP-server

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-Published-brightgreen)](https://registry.modelcontextprotocol.io/servers/io.github.KSAklfszf921/Riksdag-Regering-MCP)
[![MCP Protocol](https://img.shields.io/badge/MCP-2025--03--26-green)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🇺🇸 Open-source MCP-server for local self-hosting. Enables LLMs to query and retrieve real-time open data, documents, protocols, and records from accessible API:s and open databases from the Parliament and Government Offices of Sweden.

🇸🇪 MCP-server som ger LLMs möjlighet att söka, hitta och extrahera öppen data och information från Riksdagen och Regeringskansliet. Ansluten till samtliga öppna API:er från Riksdagen och nyttjar g0v.se för att tillgå data från Regeringskansliet.

---

## 📊 Översikt

### Totalt antal tools: **32**

MCP-servern exponerar 32 specialiserade verktyg för att hämta data och underlag, som exempelvis:

- **Ledamöter** – Information, aktiviteter, uppdrag m.m.
- **Riksdagsdokument** – Motioner, skriftliga frågor m.m.
- **Anföranden** – Följ vad som sagts i kammaren m.m.
- **Voteringar** – Så röstar ledamöterna
- **Regeringsdokument** – Ex. SOU, propositioner, pressmeddelanden

### Datakällor

- **Riksdagen:** [data.riksdagen.se](https://data.riksdagen.se) - Officiellt öppet API
- **Regeringen:** [g0v.se](https://g0v.se) - Öppen data från Regeringskansliet

---

## Snabbstart

### 📦 Alternativ 1: npm Package (Rekommenderat)

Installera direkt från npm registry:

**Fördelar:**

- ✅ Enkel installation med ett kommando
- ✅ Automatiska uppdateringar via npm
- ✅ Fungerar i alla MCP-kompatibla miljöer

```bash
# Installera globalt
npm install -g riksdag-regering-mcp

# Eller installera lokalt i ditt projekt
npm install riksdag-regering-mcp
```

#### STDIO-konfiguration för Claude Desktop

```json
{
  "mcpServers": {
    "riksdag-regering": {
      "command": "npx",
      "args": ["riksdag-regering-mcp"]
    }
  }
}
```

---

### 💻 Alternativ 2: Lokal Installation från Källkod

För utveckling eller om du vill modifiera servern lokalt:

**Fördelar:**

- ✅ Full kontroll över data och prestanda
- ✅ Kan anpassa och utöka funktionalitet
- ✅ Fungerar offline (efter initial setup)

```bash
# Klona repository
git clone https://github.com/KSAklfszf921/Riksdag-Regering.AI.git
cd Riksdag-Regering.AI

# Installera dependencies
npm run mcp:install

# Bygg och starta
cd mcp
npm run build
npm start
```

<details>
<summary>Lokal STDIO-konfiguration för Claude Desktop</summary>

```json
{
  "mcpServers": {
    "riksdag-regering": {
      "command": "node",
      "args": ["/absolut/sökväg/till/Riksdag-Regering.AI/mcp/dist/index.js"]
    }
  }
}
```

</details>

---

---

## 📖 Användningsområden

### För policynörden

- Spåra voteringsmönster över partier
- Analysera ledamöters aktivitet och engagemang

### För den nyfikkne

- Korsreferera riksdags- och regeringsdokument
- Hitta relevanta anföranden och debatter

### För konspiratören

- Tidsserieanalys av parlamentarisk aktivitet
- Partijämförelser och koalitionsanalys

### För vibekodaren

- Utöka LLM:er med svensk politisk data
- Bygg konversationsgränssnitt för medborgardata

---

### Teknisk Stack

- **Runtime:** Node.js 20+ med ESM
- **Språk:** TypeScript 5.0+
- **MCP SDK:** @modelcontextprotocol/sdk ^0.5.0
- **HTTP Server:** Express.js 4.x
- **Datakällor:** Riksdagens öppna API + g0v.se
- **Validering:** Zod 3.x
- **Logging:** Winston 3.x

---

## Licens

MIT License - Se [LICENSE](LICENSE) för detaljer.

---

## Erkännanden

- **g0v.se** - Tack till Pierre för din insats med [g0v.se](https://g0v.se/)

---

## 📞Support

### Kontakt

- **Email:** [isak.skogstad@me.com](mailto:isak.skogstad@me.com)
