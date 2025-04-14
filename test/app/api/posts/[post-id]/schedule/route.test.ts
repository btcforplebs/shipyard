import { PostService } from "@/lib/services/post";
import { POST } from "@/app/api/posts/[post-id]/schedule/route";

jest.mock("@/lib/services/post");

describe("/api/posts/[post-id]/schedule API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("schedules a post via POST", async () => {
    (PostService.update as jest.Mock).mockResolvedValue({ id: "1", isDraft: false });
    const req = {
      json: async () => ({}),
    } as any;
    const params = { "post-id": "1" };
    const res = await POST(req as any, { params });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.post).toBeDefined();
    expect(json.post.isDraft).toBe(false);
    expect(PostService.update).toHaveBeenCalledWith("1", expect.objectContaining({ isDraft: false }));
  });
});