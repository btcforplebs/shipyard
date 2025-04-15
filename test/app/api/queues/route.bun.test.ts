import { describe, test, expect, mock } from "bun:test";
import { GET, POST, DELETE } from "@/app/api/queues/route";
import { QueueService } from "@/lib/services";
import { NextRequest } from "next/server";

// Mock the QueueService
mock.module("@/lib/services", () => {
  return {
    QueueService: {
      getByAccount: mock.fn(async () => [
        { id: "queue1", name: "Queue 1", description: "Description 1", accountPubkey: "test-pubkey" },
        { id: "queue2", name: "Queue 2", description: "Description 2", accountPubkey: "test-pubkey" },
      ]),
      create: mock.fn(async (data) => ({
        id: "new-queue-id",
        ...data,
      })),
      delete: mock.fn(async () => {}),
    },
  };
});

describe("Queues API", () => {
  // Test GET /api/queues
  test("GET should return queues for an account", async () => {
    const req = new NextRequest("http://localhost/api/queues?accountPubkey=test-pubkey");
    
    const res = await GET(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toHaveProperty("queues");
    expect(Array.isArray(data.queues)).toBe(true);
    expect(data.queues.length).toBe(2);
    expect(data.queues[0]).toHaveProperty("id", "queue1");
    expect(data.queues[1]).toHaveProperty("id", "queue2");
    
    expect(QueueService.getByAccount).toHaveBeenCalledWith("test-pubkey");
  });
  
  // Test GET /api/queues without accountPubkey
  test("GET should return 400 if accountPubkey is missing", async () => {
    const req = new NextRequest("http://localhost/api/queues");
    
    const res = await GET(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty("error", "Missing accountPubkey parameter");
  });
  
  // Test POST /api/queues
  test("POST should create a new queue", async () => {
    const reqBody = {
      accountPubkey: "test-pubkey",
      name: "New Queue",
      description: "New queue description",
    };
    
    const req = new NextRequest("http://localhost/api/queues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });
    
    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toHaveProperty("queue");
    expect(data.queue).toHaveProperty("id", "new-queue-id");
    expect(data.queue).toHaveProperty("name", "New Queue");
    expect(data.queue).toHaveProperty("description", "New queue description");
    
    expect(QueueService.create).toHaveBeenCalledWith(reqBody);
  });
  
  // Test POST /api/queues without required fields
  test("POST should return 400 if required fields are missing", async () => {
    // Missing name
    const reqBody1 = {
      accountPubkey: "test-pubkey",
    };
    
    const req1 = new NextRequest("http://localhost/api/queues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody1),
    });
    
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    
    const data1 = await res1.json();
    expect(data1).toHaveProperty("error", "Missing name in request body");
    
    // Missing accountPubkey
    const reqBody2 = {
      name: "New Queue",
    };
    
    const req2 = new NextRequest("http://localhost/api/queues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody2),
    });
    
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    
    const data2 = await res2.json();
    expect(data2).toHaveProperty("error", "Missing accountPubkey in request body");
  });
  
  // Test DELETE /api/queues
  test("DELETE should delete a queue", async () => {
    const req = new NextRequest("http://localhost/api/queues?id=queue1");
    
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toHaveProperty("success", true);
    
    expect(QueueService.delete).toHaveBeenCalledWith("queue1");
  });
  
  // Test DELETE /api/queues without id
  test("DELETE should return 400 if id is missing", async () => {
    const req = new NextRequest("http://localhost/api/queues");
    
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty("error", "Missing id parameter");
  });
});