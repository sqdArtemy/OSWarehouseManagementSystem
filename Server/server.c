// Server side C/C++ program to demonstrate Socket
// programming
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdbool.h>
#include <signal.h>
#include <cjson/cJSON.h>
#include <pthread.h>


int server_fd = -1;

// Function to handle SIGINT signal
void handle_sigint(int sig) {
    printf("Received SIGINT. Closing server...\n");

    // Close the listening socket
    close(server_fd);

    exit(EXIT_SUCCESS);
}


void* handle_client(void* client_socket) {
    cJSON *root = cJSON_CreateObject();
    int new_socket = *((int*)client_socket);
    char buffer[1024] = {0};

    while (true) {
    	memset(buffer, 0, sizeof(buffer));
        ssize_t valread = read(new_socket, buffer, sizeof(buffer) - 1);
        if (valread <= 0) {
            // Handle client disconnect here
            printf("Client disconnected\n");
            break; // Exit the loop
        }
        
        cJSON *parsedJson = cJSON_Parse(buffer);
        cJSON *role = cJSON_GetObjectItem(parsedJson, "role");
        
        if(role != NULL && (strcmp(role->valuestring, "backend") == 0)){
        	if(server_fd == -1){
        		server_fd = new_socket;
        	} else {
        		const char *message = "There's already a connected backend";
        		puts(message);
        		send(new_socket, message, strlen(message), 0);
        		close(new_socket);
        	}
        }
        
     	printf("%s\n", buffer);
        send(new_socket, buffer, strlen(buffer), 0);
        fflush(stdout);
    }

    // Close the connected socket for this client
    close(new_socket);
    free(client_socket);
    return NULL;
}

int main(int argc, char const* argv[]) {

    if(argc != 2) {
    	puts("You should specify the port number as the command line argument");
    	exit(0);
    }

	int PORT;
	PORT = atoi(argv[1]);
	
	
    struct sockaddr_in address;
    int opt = 1;
    socklen_t addrlen = sizeof(address);

    signal(SIGINT, handle_sigint);

    int server_fd;
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    while (true) {
        int* new_socket = (int*)malloc(sizeof(int));
        *new_socket = accept(server_fd, (struct sockaddr*)&address, &addrlen);
        if (*new_socket < 0) {
            perror("accept");
            free(new_socket);
        } else {
            pthread_t client_thread;
            if (pthread_create(&client_thread, NULL, handle_client, (void*)new_socket) != 0) {
                perror("pthread_create");
                free(new_socket);
            }
        }
    }

    close(server_fd);
    return 0;
}
