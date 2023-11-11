import socket
import json
import select
import sys

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

SERVER_IP = "127.0.0.1"  # Replace with the actual server's IP address
PORT = 8000

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
            data = client_socket.recv(1024)
            if not data:
                break  # The server has closed the connection
                
            response = data.decode()
            
            if response == "> There's already a connected backend":
                sys.exit(0)
                
            # Check if the received data is valid JSON
            if response.startswith("{") or response.startswith("["):
                try:
                    json_object = json.loads(response)
                    message = {
                        "status_code": 200,
                        "data": json_object['message'] * 2,
                        "headers": json_object.get("headers", {})
                    }
                    
                    client_socket.send(json.dumps(message).encode())
                    print("> Server's response:", json.dumps(message))
                except json.decoder.JSONDecodeError as e:
                    print("Error decoding JSON:", str(e))
            else:
                print("Received data doesn't appear to be JSON:", response)
            

        
except ConnectionRefusedError:
    print("Connection to the server failed. Make sure the server is running.")
