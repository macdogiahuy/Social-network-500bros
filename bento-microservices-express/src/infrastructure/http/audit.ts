export const audit = (event: string, payload: Record<string, unknown>): void => {
  // Keep audit logging structured and machine-readable.
  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      event,
      payload,
      at: new Date().toISOString()
    })
  );
};
