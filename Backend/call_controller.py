import socket
import json
from json import JSONDecodeError

import select
import sys

from PyQt5.QtWidgets import QApplication

from connections_console import ServerWindow
from controller import controller

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

SERVER_IP = sys.argv[1]
PORT = int(sys.argv[2])

app = QApplication(sys.argv)
window = ServerWindow()
window.record_added.connect(window.update_records)
window.show()


try:
    client_socket.connect((SERVER_IP, PORT))
    print("Connected to the server.")

    # Specify the role in a JSON message
    message = {
        "role": "backend",
        "content": "Hello from the Python client"
    }
    client_socket.send(json.dumps(message).encode())

    while True:
        ready, _, _ = select.select([client_socket], [], [], 1)  # Wait for up to 1 second for data
        if ready:
            # receive data
            data = client_socket.recv(1024)
            request = dict()

            try:
                request = json.loads(data.decode())
                response = controller(request, window=window)
            except JSONDecodeError:
                response = {
                    "status_code": 400,
                    "message": "Invalid JSON.",
                    "body": {},
                    "headers": request.get("headers", {})
                }

            client_socket.send(json.dumps(response).encode() + "\n".encode())

            if not data:
                continue  # The server has closed the connection

except ConnectionRefusedError:
    print("Connection to the server failed. Make sure the server is running.")
