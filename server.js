// Mikeycraft Multiplayer Server
// Simple WebSocket position sync

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
const players = new Map();

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).substr(2, 9);
  ws.id = id;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "join") {
        players.set(id, { name: data.name, skin: data.skin, x: 0, y: 0, z: 0 });
        broadcast({ type: "playerJoin", id, ...players.get(id) });
      } else if (data.type === "move") {
        const p = players.get(id);
        if (p) {
          p.x = data.x; p.y = data.y; p.z = data.z;
          broadcast({ type: "playerMove", id, x: p.x, y: p.y, z: p.z });
        }
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    players.delete(id);
    broadcast({ type: "playerLeave", id });
  });
});

function broadcast(msg) {
  const json = JSON.stringify(msg);
  for (const client of wss.clients)
    if (client.readyState === 1) client.send(json);
}

console.log("Mikeycraft server running on port", process.env.PORT || 8080);
