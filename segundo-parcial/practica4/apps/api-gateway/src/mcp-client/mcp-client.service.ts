import { Injectable } from '@nestjs/common';

type JsonRpcId = string | number;

type JsonRpcSuccess<T> = {
  jsonrpc: '2.0';
  id: JsonRpcId | null;
  result: T;
};

type JsonRpcError = {
  jsonrpc: '2.0';
  id: JsonRpcId | null;
  error: { code: number; message: string; data?: unknown };
};

type McpToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type McpListToolsResult = {
  tools: McpToolDefinition[];
};

export type McpToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

@Injectable()
export class McpClientService {
  private nextId = 1;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.MCP_RPC_URL?.trim() || 'http://localhost:3001/rpc';
  }

  private async jsonRpcRequest<T>(
    method: string,
    params?: unknown,
  ): Promise<T> {
    const id = this.nextId++;
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        ...(params === undefined ? {} : { params }),
      }),
    });

    const payload = (await res.json()) as JsonRpcSuccess<T> | JsonRpcError;
    if (!res.ok) {
      throw new Error(`MCP HTTP ${res.status} ${res.statusText}`);
    }

    if ('error' in payload) {
      const details = payload.error.data
        ? ` | data: ${JSON.stringify(payload.error.data)}`
        : '';
      throw new Error(
        `MCP JSON-RPC error ${payload.error.code}: ${payload.error.message}${details}`,
      );
    }

    return payload.result;
  }

  async listTools(): Promise<McpListToolsResult> {
    return this.jsonRpcRequest<McpListToolsResult>('tools.list');
  }

  async invokeTool(
    name: string,
    args?: Record<string, unknown>,
  ): Promise<McpToolResult> {
    return this.jsonRpcRequest<McpToolResult>('tools.invoke', {
      name,
      arguments: args ?? {},
    });
  }
}
