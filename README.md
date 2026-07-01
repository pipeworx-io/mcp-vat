# mcp-vat

VAT-number format validation MCP (EU + UK/CH/NO).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1137+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
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

Or connect to the full Pipeworx gateway for access to all 1137+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
