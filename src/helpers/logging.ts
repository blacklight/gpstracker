export function logRequest(req: any) {
  console.log(`[${req.ip}] ${req.method} ${req.url}`);
}
