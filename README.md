# mcp-vat

VAT-number format validation MCP (EU + UK/CH/NO).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `validate_vat` | Validate the FORMAT of a VAT registration number for the EU (+ UK/CH/NO), keyless & offline. Accepts the number with its country prefix ("DE123456789") or a national number plus `country`. Returns whether it matches the official country pattern. NOTE: format only — it does NOT confirm the VAT number is registered/active (use the EU VIES service for that). |
| `list_vat_formats` | List the supported countries and their VAT-number formats. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "vat": {
      "url": "https://gateway.pipeworx.io/vat/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Vat data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
