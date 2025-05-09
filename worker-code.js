/**
 * A basic Cloudflare Worker that responds with a JSON payload
 */
export default {
  async fetch(request, env, ctx) {
    // Get the URL object from the request
    const url = new URL(request.url);
    
    // Basic routing
    if (url.pathname === "/") {
      return new Response(JSON.stringify({
        message: "Hello from Cloudflare Workers!",
        timestamp: new Date().toISOString(),
        environment: env.MY_VARIABLE
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    if (url.pathname === "/api/data") {
      return new Response(JSON.stringify({
        data: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
          { id: 3, name: "Item 3" }
        ]
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    // Return a 404 for any other paths
    return new Response("Not Found", { status: 404 });
  }
};
