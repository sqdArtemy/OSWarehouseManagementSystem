import socket
import json
from json import JSONDecodeError

import select
import sys
from controller import controller

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 1048576)

SERVER_IP = sys.argv[1]
PORT = int(sys.argv[2])
accumulated_data = b""

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
            data = client_socket.recv(1048576)
            request = dict()
            accumulated_data += data
            accumulated_message = ''

            while b'\n' in accumulated_data:
                message, accumulated_data = accumulated_data.split(b'\n', 1)
                accumulated_message += message.decode() + '\n'

            data = accumulated_message + accumulated_data.decode()
            accumulated_data = b""
            accumulated_message = ''

            try:
                request = json.loads(data)
                response = controller(request)
            except JSONDecodeError:
                response = {
                    "status_code": 400,
                    "message": "Invalid JSON.",
                    "body": {},
                    "headers": request.get("headers", { "socket_fd: 0 "})
                }

            client_socket.send(json.dumps(response).encode() + "\n".encode())

            if not data:
                continue  # The server has closed the connection

except ConnectionRefusedError:
    print("Connection to the server failed. Make sure the server is running.")