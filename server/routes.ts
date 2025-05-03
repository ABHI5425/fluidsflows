import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // All functionality is client-side only, no server routes needed

  const httpServer = createServer(app);

  return httpServer;
}
