import sys
import os

# Set current directory to backend
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

# Run main runner with all CLI arguments
if __name__ == "__main__":
    import main
    import uvicorn
    import argparse
    import webbrowser

    parser = argparse.ArgumentParser(description="DataLens AI Launcher")
    parser.add_argument("--port", type=int, default=None, help="Port to run server on")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser automatically")
    args = parser.parse_args()

    env_port = int(os.environ.get("PORT")) if os.environ.get("PORT") else None
    requested_port = args.port or env_port or 8000

    actual_port = main.find_available_port(requested_port, args.host)
    if actual_port != requested_port:
        print(f"\n[DataLens AI] NOTICE: Port {requested_port} is busy or in use by another platform.")
        print(f"[DataLens AI] Automatically assigned free port: {actual_port}\n")

    app_url = f"http://{args.host}:{actual_port}"
    print("=" * 62)
    print("           DATALENS AI - INTELLIGENCE WORKSPACE")
    print("   'Upload your data. Ask anything. Understand everything.'")
    print(f"       -> Live URL: {app_url}")
    print("=" * 62 + "\n")

    import threading
    import time

    def open_browser_when_ready(url, p, h):
        time.sleep(0.5)
        for _ in range(30):
            if main.is_port_in_use(p, h):
                time.sleep(0.3)
                webbrowser.open(url)
                return
            time.sleep(0.2)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    if not args.no_browser:
        threading.Thread(target=open_browser_when_ready, args=(app_url, actual_port, args.host), daemon=True).start()

    uvicorn.run(main.app, host=args.host, port=actual_port)
