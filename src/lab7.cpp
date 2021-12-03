#include <iostream>
#include <string>
#include <string.h>
#include <wiringPi.h>
#include "lab7.h"
#include <stdlib.h>
#include <wiringSerial.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <cstdlib>
#include <iomanip>
using namespace std;

int sock = 0;
int kobuki, bumper, wheelDrop, cliff, button;
int createServer;


string initialize(string spd){
	setenv("WIRINGPI_GPIOMEM", "1", 1);
	wiringPiSetup();
	kobuki = serialOpen("/dev/ttyUSB0", 115200);

	if(createServer == 0){
		createSocket("10.198.214.55", 3004);
		createServer += 1;
	}
	
    int sp = speed(spd);
    int r  = 0;//radius(spd);
	movement(sp, r);
	
	readData();
	string val = "Value";
	const char *output = val.c_str();
	send(sock, output, strlen(output), 0);
    close(kobuki);
    
    return spd;
}


int speed(string value){
	int ind = value.find('y', 0);
	string index = value.substr(5,(ind - 5));
	ind = stoi(index);
	cout << "Speed: " << index;

	return 2*ind;
}

int radius(string value){
	int ind0 = value.find('y', 16) + 10;
    int ind = value.find('%', ind0);
	string index = value.substr(ind0,(ind - ind0));

	ind = stoi(index);
    ind = ind > 0 ? (1000 - 10 * ind):(-1000 - 10 * ind);
	cout << " Radius: " << ind << endl;

    return ind;
}

int movement(int sp, int r){

	uint8_t header0 = 0xaa;
	uint8_t header1 = 0x55;
	uint8_t packet2 = 6;
	uint8_t packet3 = 1;
	uint8_t packet4 = 4;
	uint8_t packet5 = sp & 0xff;
	uint8_t packet6 = (sp >> 8) & 0xff;
	uint8_t packet7 = r & 0xff;
	uint8_t packet8 = (r >> 8) & 0xff;
	uint8_t cs      = 0;

	serialPutchar(kobuki, header0);
	serialPutchar(kobuki, header1);
	serialPutchar(kobuki, packet2);
	serialPutchar(kobuki, packet3);
	serialPutchar(kobuki, packet4);
	serialPutchar(kobuki, packet5);
	serialPutchar(kobuki, packet6);
	serialPutchar(kobuki, packet7);
	serialPutchar(kobuki, packet8);

	cs ^= packet2;
	cs ^= packet3;
	cs ^= packet4;
	cs ^= packet5;
	cs ^= packet6;
	cs ^= packet7;
	cs ^= packet8;

	serialPutchar(kobuki, cs);
	usleep(20000);

  return 0;
}

int readData(){
	while(true){
		//Read data until you arrive at Basic Sensor Data packet
		char read = serialGetchar(kobuki);
		if(read == 1){
			if(serialGetchar(kobuki) == 15) break;
		}
	}
	//Read past timestamp
	serialGetchar(kobuki);
	serialGetchar(kobuki);
	//Convert char data to int for use in case statement
	bumper    = static_cast<int>(serialGetchar(kobuki));
	wheelDrop = static_cast<int>(serialGetchar(kobuki));
	cliff     = static_cast<int>(serialGetchar(kobuki));

	//Read data until button data is found
	//Used to cleanly close script
	for(int i = 0; i < 6; i++) serialGetchar(kobuki);
	button = static_cast<int>(serialGetchar(kobuki));

	return 0;
}

int createSocket(string ipAddress, int PORT){
	struct sockaddr_in address;
	struct sockaddr_in serv_addr;

	if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0){
		printf("\nSocket creation error \n");
		return -1;
	}

	memset(&serv_addr, '0', sizeof(serv_addr));

	serv_addr.sin_family = AF_INET;
	serv_addr.sin_port   = htons(PORT);

	char* cstr = new char[ipAddress.length() + 1];
	strcpy(cstr, ipAddress.c_str());
	//Use the IP Address of the server you are connecting to.
	if(inet_pton(AF_INET, "127.0.0.1" , &serv_addr.sin_addr) <= 0){
		printf("\nInvalid address/ Address not supported \n");
		return -1;
	}

	if(connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0){
		printf("\nConnection Failed \n");
        return -1;
	}
}