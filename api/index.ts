import { createServer } from "../server/index";

export default async function handler(req: any, res: any) {
  const app = await createServer();
  return app(req, res);
}
