import path from "path";
import { getUploadsDir } from "./env.js";

export function resolveUploadsDir(): string {
  const configured = getUploadsDir();
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}
