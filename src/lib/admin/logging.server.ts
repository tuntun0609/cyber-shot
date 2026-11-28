type AdminOperation =
  | "image.upload"
  | "item.create"
  | "item.update"
  | "item.set_deprecated";

export function serializeError(error: unknown) {
  return error instanceof Error
    ? { message: error.message, name: error.name, stack: error.stack }
    : { message: String(error) };
}

// 仅传入经过校验的业务字段；文件只传元数据，不记录请求头或文件内容。
export async function logAdminOperation<T>(
  operation: AdminOperation,
  input: Record<string, unknown>,
  run: (operationId: string) => Promise<T>
): Promise<T> {
  const operationId = crypto.randomUUID();
  const startedAt = performance.now();
  const context = { operation, operationId };
  console.info({ ...context, event: "operation.started", input });

  try {
    const result = await run(operationId);
    console.info({
      ...context,
      durationMs: Math.round(performance.now() - startedAt),
      event: "operation.completed",
      result,
    });
    return result;
  } catch (error) {
    console.error({
      ...context,
      durationMs: Math.round(performance.now() - startedAt),
      error: serializeError(error),
      event: "operation.failed",
    });
    throw error;
  }
}
