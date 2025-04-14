import { POST, GET } from "@/app/api/posts/route";
import { PostService } from "@/lib/services/post";
import { expect, test } from "bun:test";

test("creates a post via POST", async () => {
  const originalCreate = PostService.create;
  PostService.create = async () => ({ id: "1", accountPubkey: "demo", rawEvents: [{ content: "test" }] }) as any;

  const req = { json: async () => ({ account_pubkey: "demo", rawEvents: [{ content: "test" }] }) } as any;
  const res = await POST(req as any);
  const json = await res.json();
  expect(res.status).toBe(201);
  expect(json.post).toBeDefined();

  PostService.create = originalCreate;
});

test("returns posts via GET", async () => {
  const originalGetByAccount = PostService.getByAccount;
  PostService.getByAccount = async () => [{ id: "1", accountPubkey: "demo", rawEvents: [{ content: "test" }] }] as any;

  const req = { url: "http://localhost/api/posts?account_pubkey=demo" } as any;
  const res = await GET(req as any);
  const json = await res.json();
  expect(res.status).toBe(200);
  expect(json.posts).toBeDefined();
  expect(Array.isArray(json.posts)).toBe(true);

  PostService.getByAccount = originalGetByAccount;
});