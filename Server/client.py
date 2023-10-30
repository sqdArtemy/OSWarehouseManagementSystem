import socket
import json
import sys

SERVER_IP = "127.0.0.1"  # Replace with the actual server's IP address
PORT = 8000

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

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
        data = client_socket.recv(1024)
        print("Server's response:", data.decode())
        if(data.decode() == "There's already a connected backend"):
            sys.exit(0)
        
        new_message = input("Enter a message (or 'quit' to exit): ")
        client_socket.send(new_message.encode())

        

except ConnectionRefusedError:
    print("Connection to the server failed. Make sure the server is running.")
