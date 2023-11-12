import socket
import json
import select
import sys
from controller import controller

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

SERVER_IP = sys.argv[1]
PORT = int(sys.argv[2])

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

            response = controller(json.loads(data.decode()))

            client_socket.send(json.dumps(response).encode())

            if not data:
                continue  # The server has closed the connection

except ConnectionRefusedError:
    print("Connection to the server failed. Make sure the server is running.")