export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const id = env.COUNTER.idFromName("azmi-visits");
    const stub = env.COUNTER.get(id);
    const response = await stub.fetch(url.pathname, request);
    const body = await response.text();

    return new Response(body, { status: response.status, headers });
  },
};

export class Counter {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);
    let count = (await this.state.storage.get("count")) || 0;

    if (url.pathname === "/hit") {
      count += 1;
      await this.state.storage.put("count", count);
    }

    return new Response(JSON.stringify({ count }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
