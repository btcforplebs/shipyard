import { createMocks } from "node-mocks-http";
import handler, { POST, GET } from "@/app/api/posts/route";
import { PostService } from "@/lib/services/post";

jest.mock("@/lib/services/post");

describe("/api/posts API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a post via POST", async () => {
    (PostService.create as jest.Mock).mockResolvedValue({ id: "1", accountPubkey: "demo", rawEvents: [{ content: "test" }] });
    const req = { json: async () => ({ account_pubkey: "demo", rawEvents: [{ content: "test" }] }) } as any;
    const res = await POST(req as any);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.post).toBeDefined();
    expect(PostService.create).toHaveBeenCalled();
  });

  it("returns posts via GET", async () => {
    (PostService.getByAccount as jest.Mock).mockResolvedValue([{ id: "1", accountPubkey: "demo", rawEvents: [{ content: "test" }] }]);
    const req = { url: "http://localhost/api/posts?account_pubkey=demo" } as any;
    const res = await GET(req as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.posts).toBeDefined();
    expect(Array.isArray(json.posts)).toBe(true);
    expect(PostService.getByAccount).toHaveBeenCalled();
  });
});