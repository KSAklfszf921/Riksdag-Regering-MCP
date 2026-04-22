<img width="1360" height="497" alt="Skärmavbild 2025-11-20 kl  09 01 01" src="https://github.com/user-attachments/assets/2d1daf29-80f0-4404-b01a-4cc3705bcf69" />

# Riksdag & Regering MCP-server

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-Published-brightgreen)](https://registry.modelcontextprotocol.io/servers/io.github.isakskogstad/Riksdag-Regering-MCP)
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

### 📦 Alternativ 1: npm (rekommenderat)

Lägg till följande i din Claude Desktop-config (`~/Library/Application Support/Claude/claude_desktop_config.json` på macOS):

```json
{
  "mcpServers": {
    "riksdag-regering": {
      "command": "npx",
      "args": ["-y", "@isak.skogstad/riksdag-regering-mcp"]
    }
  }
}
```

Starta om Claude Desktop. `npx` hämtar och kör senaste versionen automatiskt.

---

### 💻 Alternativ 2: Installation från källkod

```bash
# Klona repository
git clone https://github.com/isakskogstad/Riksdag-Regering-MCP.git
cd Riksdag-Regering-MCP

# Installera dependencies
npm run mcp:install

# Bygg servern
npm run mcp:build
```

Konfiguration:

```json
{
  "mcpServers": {
    "riksdag-regering": {
      "command": "node",
      "args": ["/absolut/sökväg/till/Riksdag-Regering-MCP/mcp/dist/index.js"]
    }
  }
}
```

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
