import express, { type NextFunction, type Request, type Response } from 'express';
import Ajv, { type ValidateFunction } from 'ajv';
import { toolByName, tools } from './tools/registry';

const app = express();
app.use(express.json());

// JSON parse errors -> JSON-RPC Parse error
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (req.path !== '/rpc') return next(err);
  if (err instanceof SyntaxError) {
    return res.status(200).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error',
      },
    });
  }
  return next(err);
});

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: unknown;
  method?: unknown;
  params?: unknown;
  id?: unknown;
};

type JsonRpcSuccess = {
  jsonrpc: '2.0';
  id: JsonRpcId;
  result: unknown;
};

type JsonRpcError = {
  jsonrpc: '2.0';
  id: JsonRpcId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
};

function isValidId(id: unknown): id is JsonRpcId {
  return id === null || typeof id === 'string' || typeof id === 'number';
}

function makeError(id: JsonRpcId, code: number, message: string, data?: unknown): JsonRpcError {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

function makeResult(id: JsonRpcId, result: unknown): JsonRpcSuccess {
  return { jsonrpc: '2.0', id, result };
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validatorByTool = new Map<string, ValidateFunction>();
for (const t of tools) {
  try {
    validatorByTool.set(t.name, ajv.compile(t.inputSchema));
  } catch {
    // Si el schema no compila, dejamos la tool sin validación AJV.
  }
}

app.post('/rpc', async (req: Request, res: Response) => {
  const body = req.body as JsonRpcRequest | undefined;

  // Invalid Request (no JSON object)
  if (!body || typeof body !== 'object') {
    return res.status(200).json(makeError(null, -32600, 'Invalid Request'));
  }

  const id: JsonRpcId = isValidId(body.id) ? (body.id as JsonRpcId) : null;

  // Notification (no id) => no response
  const isNotification = body.id === undefined;

  if (body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    const payload = makeError(id, -32600, 'Invalid Request');
    return isNotification ? res.status(204).end() : res.status(200).json(payload);
  }

  try {
    if (body.method === 'tools.list') {
      const result = {
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      };
      const payload = makeResult(id, result);
      return isNotification ? res.status(204).end() : res.status(200).json(payload);
    }

    if (body.method === 'tools.invoke') {
      if (!body.params || typeof body.params !== 'object') {
        const payload = makeError(id, -32602, 'Invalid params', {
          expected: '{ name: string, arguments?: object }',
        });
        return isNotification ? res.status(204).end() : res.status(200).json(payload);
      }

      const params = body.params as { name?: unknown; arguments?: unknown };
      const name = typeof params.name === 'string' ? params.name : '';
      const args = (params.arguments && typeof params.arguments === 'object')
        ? (params.arguments as Record<string, unknown>)
        : {};

      if (!name) {
        const payload = makeError(id, -32602, 'Invalid params', { missing: 'name' });
        return isNotification ? res.status(204).end() : res.status(200).json(payload);
      }

      const tool = toolByName.get(name);
      if (!tool) {
        const payload = makeError(id, -32601, 'Method not found', { tool: name });
        return isNotification ? res.status(204).end() : res.status(200).json(payload);
      }

      const validate = validatorByTool.get(name);
      if (validate && !validate(args)) {
        const payload = makeError(id, -32602, 'Invalid params', {
          errors: validate.errors ?? [],
        });
        return isNotification ? res.status(204).end() : res.status(200).json(payload);
      }

      const toolResult = await tool.handler(args);
      const payload = makeResult(id, toolResult);
      return isNotification ? res.status(204).end() : res.status(200).json(payload);
    }

    const payload = makeError(id, -32601, 'Method not found', { method: body.method });
    return isNotification ? res.status(204).end() : res.status(200).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const payload = makeError(id, -32000, 'Server error', { message });
    return isNotification ? res.status(204).end() : res.status(200).json(payload);
  }
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log('[mcp-server] listening on http://localhost:' + port);
});

