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

def receive_messages(client_socket):
    accumulated_data = b""
    accumulated_message = ''

    while True:
        ready, _, _ = select.select([client_socket], [], [], 0.05)  # Check every 50 ms

        if not ready:
            # No data received within the timeout, break out of the loop
            break

        data = client_socket.recv(1048576)

        if not data:
            # Check if the socket is still open
            if client_socket.fileno() == -1:
                break  # Connection closed, break out of the loop
            else:
                continue  # No data received, continue the loop

        accumulated_data += data

        while b'\n' in accumulated_data:
            message, accumulated_data = accumulated_data.split(b'\n', 1)
            accumulated_message += message.decode() + '\n'

    accumulated_message = accumulated_message + accumulated_data.decode()
    return accumulated_message.rstrip()

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
            data = receive_messages(client_socket)

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