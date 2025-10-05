import http.server
import socketserver
import webbrowser
import threading

PORT = 8000

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at http://localhost:{PORT}/index.html")
        httpd.serve_forever()

if __name__ == "__main__":
    # Mở trình duyệt tự động
    threading.Timer(1, lambda: webbrowser.open(f"http://localhost:{PORT}/index.html")).start()
    start_server()
