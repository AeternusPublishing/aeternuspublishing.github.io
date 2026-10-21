"""Serve the two local builds and the editorial comparison report on localhost."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Event, Thread

ROOT = Path(__file__).resolve().parent.parent


def main():
    builds = ((8043, "public"), (8044, "dist/release"), (8045, "."))
    servers = []
    for port, folder in builds:
        if not (ROOT / folder).is_dir():
            raise SystemExit(f"Missing local build: {folder}")
        handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT / folder))
        server = ThreadingHTTPServer(("127.0.0.1", port), handler)
        servers.append(server)
        Thread(target=server.serve_forever, daemon=True).start()
        print(f"http://127.0.0.1:{port}/ — {folder}", flush=True)
    print("Review: http://127.0.0.1:8045/docs/author-worlds/preview.html", flush=True)
    try:
        Event().wait()
    except KeyboardInterrupt:
        for server in servers:
            server.shutdown()


if __name__ == "__main__":
    main()
