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
#include <arpa/inet.h>
#include <time.h>
#include "linked_list.h"
#include <unistd.h>


int server_fd = -1;

char connect_json[1000] = "{\n  \"headers\": {},\n  \"url\": \"/connect\",\n  \"method\": \"POST\"\n}";
char disconnect_json[1000] = "{\n  \"headers\": {},\n  \"url\": \"/disconnect\",\n  \"method\": \"POST\"\n}";

struct clientAddress {
  int* client_socket;
  int port;
  char* address;
};

struct ArrayList clientsList;

// Function to handle SIGINT signal
void handle_sigint(int sig) {
    printf("Received SIGINT. Closing server...\n");
    close(server_fd);
    exit(EXIT_SUCCESS);
}

char* get_current_time(){
  time_t current_time;
  time(&current_time);
  struct tm *local_time = localtime(&current_time);
  
  char *time_string = (char*)malloc(26);
  strftime(time_string, 26, "%Y-%m-%d %H:%M:%S", local_time);
  
  return time_string;
}

void send_request(cJSON *json, int port, char* address, int new_socket){
	cJSON *headers = cJSON_GetObjectItem(json, "headers");
	cJSON_AddNumberToObject(headers, "port", port);
	cJSON_AddStringToObject(headers, "address", address);
	cJSON_AddNumberToObject(headers, "socket_id", new_socket);

	char *headerString = cJSON_Print(headers);

	cJSON *headersObject = cJSON_Parse(headerString);
	cJSON_DeleteItemFromObject(json, "headers");
	cJSON_AddItemToObject(json, "headers", headersObject);

	char *request = cJSON_Print(json);
	send(server_fd, request, strlen(request), 0);
}

void* handle_client(void* client) {
  struct clientAddress* clientArgs = (struct clientAddress*)client;
  int port = clientArgs->port;
  char* address = clientArgs->address;
  
    cJSON *root = cJSON_CreateObject();
    int new_socket = *((int*)clientArgs->client_socket);
    char buffer[1048576] = {0};

    while (true) {    
      memset(buffer, 0, sizeof(buffer));
        ssize_t valread = read(new_socket, buffer, sizeof(buffer) - 1);
        if (valread <= 0) {
            printf("%s Client with ip address %s and port %d disconnected\n", get_current_time(), address, port);
            if(new_socket == server_fd){
              server_fd = -1;
              deleteAll(&clientsList);
            } else {
            	cJSON *disconnectJson = cJSON_Parse(disconnect_json);
            	send_request(disconnectJson, port, address, new_socket);
              deleteValue(&clientsList, new_socket);
            }
            break;
        }
        
        cJSON *parsedJson = cJSON_Parse(buffer);
        cJSON *role = cJSON_GetObjectItem(parsedJson, "role");
        cJSON *headers = cJSON_GetObjectItem(parsedJson, "headers");
        
        //connection of backend
        if(role != NULL && (strcmp(role->valuestring, "backend") == 0)){
            printf("%s Backend with ip address %s and port %d is connected\n", get_current_time(), address, port);
          if(server_fd == -1){
            server_fd = new_socket;
          } else {
            const char *message = "There is already a connected backend. The given backend will be disconnected\n";
            printf("%s %s", get_current_time(), message);
            send(new_socket, message, strlen(message), 0);
            close(new_socket);
          }
        }
        
        //connection of frontend
        else if(role != NULL && (strcmp(role->valuestring, "frontend") == 0)){
          printf("%s Frontend with ip address %s and port %d is connected\n", get_current_time(), address, port);
        }
        
        //frontend to backend
        else if(headers != NULL && new_socket != server_fd){
          if(server_fd == -1){
            const char *message = "There is no connected backend side to the server";
            send(new_socket, message, strlen(message), 0);
          } 
          
          else {
            if(!isInArray(&clientsList, new_socket)){
                cJSON *connectJson = cJSON_Parse(connect_json);
            	send_request(connectJson, port, address, new_socket);
                push(&clientsList, new_socket);
                sleep(1);
            }
            usleep(50000);
            send_request(parsedJson, port, address, new_socket);            
          }
        }
        
        //backend to frontend
        else if(headers != NULL && new_socket == server_fd){
          int socket_id = cJSON_GetObjectItem(headers, "socket_id")->valueint;
          send(socket_id, buffer, strlen(buffer), 0);
        }

    }

    // Close the connected socket for this client
    close(new_socket);
    free(clientArgs->client_socket);
    return NULL;
}

int main(int argc, char const* argv[]) {

    if(argc != 3) {
      puts("You should specify the port number and ip as the command line arguments");
      exit(0);
    }
    int PORT;
    PORT = atoi(argv[2]);
    const char* ip = argv[1];
    printf("SERVER IS RUNNING ON IP %s PORT %d\n", ip, PORT);
  
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

    int new_buffer_size = 1048576;
    setsockopt(server_fd, SOL_SOCKET, SO_SNDBUF, &new_buffer_size, sizeof(new_buffer_size));

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr(ip);
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
            struct clientAddress* client = (struct clientAddress*)malloc(sizeof(struct clientAddress));
            
            client->port = address.sin_port;
            client->address = inet_ntoa(address.sin_addr);
            client->client_socket = new_socket; 
            
            if (pthread_create(&client_thread, NULL, handle_client, (void*)client) != 0) {
                perror("pthread_create");
                free(new_socket);
            }
        }
    }

    close(server_fd);
    return 0;
}
