# There are steps to get the software programm started:

## For IPC:
- To start IPC you need to install libcjson-dev by using command: 
	``` Terminal
	$sudo apt-get install libcjson-dev
	```
- Then compile file server.c with command: 
	```Terminal
	$gcc -o server server.c -pthread -libcjson
	```
- Start the IPC server by: 
	```Terminal
	$./server <ip address> <port number>
	```
## For Backend:
- To start Backend you need python 3.10 or higher
- You need MySQL DBMS 
- Create .env file in Backend directory: 
	```.env
	DATABASE_URL=mysql://username:password@host/dbname
	ADMIN_PASSWORD=password
	```
- Run the following command: 
	```Terminal
	pip install -r requirements.txt
	```
- Run the following command: 
	```Terminal
	python ./env_loader.py
 	```
- Run the following command to get db migrataions: 
	```Terminal
	alembic upgrade head
	```
- And run the file call_controller.py: 
	```Terminal
	python3 call_controller.py <ip address> <port number>
	```


## For Frontend:
- To start Frontend you need to install npm by entering following command: 
	```Terminal
	$sudo apt install npm
	$sudo npm install -g n
	$sudo n latest
	```
- You need to instal libfuse2 and fuse libraries: 
	```Terminal
	$sudo apt-get install fuse libfuse2
	```
- You need to run command to install node modules by entering following command in side Frontend directory: 
	```Terminal
	$npm install 
	```
- As well you have to define the IP address and port number in .env file by using the following: 
	``` .env
	IP_IPC=<ip address of ipc>
	PORT_IPC=<port number>
	```
- Sometimes it is needed to change owner of the directory, it would be easy to change ownership of all subdirectories recursively: 
	``` Terminal
	sudo chown -R user:group Frontend
	```
- If you want to start application you have to run following command in Frontend directory: 
	```Terminal
	$npm start
	```
- To build application for frontend you should run following command, your builded app will be in Frontend/release/build directory with the name 'ElectronReact-X.X.X.AppImage': 
	```Terminal
	$npm run package
	```
- And add the same .env file into the build directory before starting it 
- And run the 'ElectronReact-X.X.X.AppImage' file in terminal:
	``` Terminal
	./ElectronReact-X.X.X.AppImage
	```