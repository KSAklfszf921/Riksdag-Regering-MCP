# Riksdag-Regering MCP

MCP-server för lokal installation. Från och med version 2.1 används inga externa databaser – all data hämtas live från Riksdagens öppna API och g0v.se.

## Installation

```bash
git clone https://github.com/isakskogstad/Riksdag-Regering-MCP.git
cd Riksdag-Regering-MCP
npm run mcp:install
npm run mcp:build
```

Lägg till i Claude Desktop-config (STDIO-läge):

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

## HTTP-läge (valfritt)

Servern kan även köras i HTTP-läge lokalt eller i egen container.

```bash
cd mcp
npm start              # startar HTTP-servern på PORT (default 3000)
# eller
node dist/server.js
```

Tillåtna miljövariabler:

| Variabel             | Beskrivning                                               |
| -------------------- | --------------------------------------------------------- |
| `PORT`               | HTTP-port (default 3000)                                  |
| `API_KEY`            | Valfritt. Om satt krävs `x-api-key` för `/mcp`-endpointen |
| `RIKSDAG_USER_AGENT` | Override av User-Agent mot data.riksdagen.se              |

## Datakällor

- `https://data.riksdagen.se` (dokument, ledamöter, anföranden)
- `https://g0v.se/api` (pressmeddelanden, propositioner, SOU, tal)

## Verktyg

Se [huvud-README](../README.md) för komplett lista över verktyg och resources.

## Licens

MIT – samma som huvudprojektet.
