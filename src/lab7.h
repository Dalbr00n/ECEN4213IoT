#include <string>
#include <stdio.h>
#include <wiringPi.h>
using namespace std;

string initialize(string);
int speed(string);
int radius(string);
int movement(int, int);
int readData();
int createSocket(string, int);