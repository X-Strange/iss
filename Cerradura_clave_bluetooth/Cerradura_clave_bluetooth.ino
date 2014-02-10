#include <Password.h>
//#include <MeetAndroid.h>
#include <SoftwareSerial.h>
#include <MeetAndroidSS.h>
#include <Servo.h>

// declare MeetAndroid so that you can call functions with it
//MeetAndroid meetAndroid;
MeetAndroidSS meetAndroid(9600, 12, 11);

Servo miServo;
int angulo=90;

int lock = 13;          
int LED=9; //pin 9 on Arduino
Password pass = Password("abrime ");    //User-Defined Password
Password IMEI = Password( "356389040420504" ); //356389040420504

int piezo=10;
int notas[] = {1915, 1700, 1519, 1432, 1275, 1136, 1014, 956};
 //cadena con los tiempos que corresponden a las distintas notas
int n=0;
int m=0;
int tnota=100; //nº de repeticiones del pulso. Nos da la duración de la nota
int pausa=500;

//Control motor
int motorPin1 = 3; // pin 2 on L293D IC
int motorPin2 = 4; // pin 7 on L293D IC
int enablePin = 5; // pin 1 on L293D IC
//int state;
int flag=0; 

void setup()
{
  //Pin donde esta conectado el Piezo.
   pinMode(piezo,OUTPUT);
  //Pin donde conectamos el led para ver el correcto funcionamiento del modulo
   pinMode(lock,OUTPUT);
   //Configuracion de la velocidad del modulo 9600 por defecto, se puede cambiar
   //mediante comandos AT
   
    // sets the pins as outputs:
   pinMode(motorPin1, OUTPUT);
   pinMode(motorPin2, OUTPUT);
   pinMode(enablePin, OUTPUT);
   // sets enablePin high so that motor can turn on:
   digitalWrite(enablePin, HIGH);
   
   //Serial.begin(9600);
   digitalWrite(lock, LOW);  //By default, lock is active(locked)
   meetAndroid.registerFunction(controlServo, 's');
   meetAndroid.registerFunction(execute, 'p');
   meetAndroid.registerFunction(getIMEI, 'd');
   meetAndroid.registerFunction(playNotas, 'n');
   meetAndroid.registerFunction(controlMotor, 'm');
   
   miServo.attach(10);
   
   Serial.begin(115200);
   pinMode(LED, OUTPUT);
}

void loop()
{
 meetAndroid.receive(); // you need to keep this in your loop() to receive events
   while (Serial.available() > 0) {
    int i;
      char command[2];
      for (i = 0; i < 1; i++) {
        command[i] = Serial.read();
      }
      command[1] = '\0';
    
      Serial.print(command);
    
      if (strcmp(command, "e") == 0) {
        digitalWrite(LED, HIGH);
        Serial.print("LED13 is ON\n");
        meetAndroid.send("Luz encendida via Tablet.");
      } else if (strcmp(command, "a") == 0) {
        digitalWrite(LED, LOW);
        Serial.print("LED13 is OFF\n");
        meetAndroid.send("Luz apagada via Tablet.");
      } else if (strcmp(command, "0") == 0) {
        digitalWrite(motorPin1, LOW); // set pin 2 on L293D low
        digitalWrite(motorPin2, LOW); // set pin 7 on L293D low
        if(flag == 0){
            meetAndroid.send("Motor apagado via websocket.");
            flag=1;
        }
        Serial.print("Motor is OFF\n");
      } else if (strcmp(command, "1") == 0) {
        digitalWrite(motorPin1, LOW); // set pin 2 on L293D low
        digitalWrite(motorPin2, HIGH); // set pin 7 on L293D high
        delay(100);
        digitalWrite(motorPin2, LOW); // set pin 7 on L293D high
        if(flag == 0){
            meetAndroid.send("Motor izquierda via websocket.");
            flag=1;
        }
        Serial.print("Motor rotated left\n");
      } else if (strcmp(command, "2") == 0) {
        digitalWrite(motorPin1, HIGH); // set pin 2 on L293D high
        digitalWrite(motorPin2, LOW); // set pin 7 on L293D low
        delay(100);
        digitalWrite(motorPin1, LOW); // set pin 2 on L293D high
          if(flag == 0){
            meetAndroid.send("Motor derecha via websocket.");
            flag=1;
        }
        Serial.print("Motor rotated right\n");
      } else if (strcmp(command, "3") == 0) {
        digitalWrite(LED, HIGH);
        Serial.print("Kazoo is on\n");
        delay(5000);
        digitalWrite(LED, LOW);
        Serial.print("Kazoo is off\n");
      }
  } 
}

void execute(byte flag, byte numOfValues)
{
  // first we need to know how long the string was in order to prepare an array big enough to hold it.
  // you should know that: (length == 'length of string sent from Android' + 1)
  // due to the '\0' null char added in Arduino
  int length = meetAndroid.stringLength();
  
  // define an array with the appropriate size which will store the string
  char data[length-1];
  
  // tell MeetAndroid to put the string into your prepared array
  meetAndroid.getString(data);
  
  // go and do something with the string, here we simply send it back to Android
  //meetAndroid.send(data);

  int value;
  for (int i=0; i<length-1; i++) {
   if (data[i] == '!') {
    value = 1;
   } else if (data[i] == '?') {
    value = 2;
    data[i] = '\0'; 
   }
  }
  
  switch (value){
      case 1: //reset password
        pass.reset();
        meetAndroid.send("La contraseña fue reseteada. Diga la frase nueva clave y a continuacion su nueva contraseña.");
      break;
      case 2: //set password
        pass.set(data);
        meetAndroid.send("Nueva contraseña establecida.");
      break;
      default:
        if (pass.is(data)){
         meetAndroid.send("Puerta abierta por 5 segundos!");
         digitalWrite(lock, HIGH);
         delay(5000);
         //for (int i=0; i<length; i++)
         //{
         // data[i] = ' '; 
         //}
         meetAndroid.send("Cerrada");
        }else{
         meetAndroid.send("Contraseña incorrecta!");
        }
       digitalWrite(lock, LOW);
    }
}

void getIMEI(byte flag, byte numOfValues)
{
  // first we need to know how long the string was in order to prepare an array big enough to hold it.
  // you should know that: (length == 'length of string sent from Android' + 1)
  // due to the '\0' null char added in Arduino
  int length = meetAndroid.stringLength();
  
  // define an array with the appropriate size which will store the string
  char data[length];
  
  // tell MeetAndroid to put the string into your prepared array
  meetAndroid.getString(data);
  
  if (IMEI.is(data)){
   meetAndroid.send("IMEI reconocido!");
  }else{
   meetAndroid.send("IMEI desconocido!");
  }
}

void playNotas(byte flag, byte numOfValues)
{
  // first we need to know how long the string was in order to prepare an array big enough to hold it.
  // you should know that: (length == 'length of string sent from Android' + 1)
  // due to the '\0' null char added in Arduino
  int length = meetAndroid.stringLength();
  
  // define an array with the appropriate size which will store the string
  char data[length];
  
  // tell MeetAndroid to put the string into your prepared array
  meetAndroid.getString(data);
  
  for(n=0;n<8;n++){
		 //iteración que recorre la lista con las duraciones de los	pulsos de cada nota
		for(m=0;m<=tnota;m++){
			digitalWrite(piezo,HIGH);
			delayMicroseconds(notas[n]);
			 //Tiempo en microsegundos que está a 5V la salida del piezoeléctrico
			digitalWrite(piezo,LOW);
			delayMicroseconds(notas[n]);
			 //Tiempo en microsegundos que está a 0V la	salida del piezoeléctrico
		}
	delay(pausa); //tiempo en silencio entre escalas
  }
}

void controlServo(byte flag, byte numOfValues)
{
  int length = meetAndroid.stringLength();
  char data[length];
  meetAndroid.getString(data);
  if (data[0] == 'z') {
    angulo+=20;//incrementamos 20
    meetAndroid.send("Servo izquierda");
  } else if (data[0] == 'x') {
    angulo-=20;//decrementamos 20
    meetAndroid.send("Servo derecha");
  } else if (data[0] == 'c') {
    angulo=90;
    meetAndroid.send("Servo centrado");
  }
  angulo=constrain(angulo,0,180);//restringimos el valor de 0 a 180
  miServo.write(angulo);
  delay(100);
}

void controlMotor(byte flag, byte numOfValues)
{
  int length = meetAndroid.stringLength();
  char data[length];
  meetAndroid.getString(data);
  flag=0;
  
   if (data[0] == '0') {
      digitalWrite(motorPin1, LOW); // set pin 2 on L293D low
      digitalWrite(motorPin2, LOW); // set pin 7 on L293D low
      if(flag == 0){
          meetAndroid.send("Motor: off");
          flag=1;
      }
   }
   // if the state is '1' the motor will turn right
   else if (data[0] == '1') {
      digitalWrite(motorPin1, LOW); // set pin 2 on L293D low
      digitalWrite(motorPin2, HIGH); // set pin 7 on L293D high
      delay(100);
      digitalWrite(motorPin2, LOW); // set pin 7 on L293D high
      if(flag == 0){
          meetAndroid.send("Motor: right");
          flag=1;
      }
   }
   // if the state is '2' the motor will turn left
   else if (data[0] == '2') {
      digitalWrite(motorPin1, HIGH); // set pin 2 on L293D high
      digitalWrite(motorPin2, LOW); // set pin 7 on L293D low
      delay(100);
      digitalWrite(motorPin1, LOW); // set pin 2 on L293D high
        if(flag == 0){
          meetAndroid.send("Motor: left");
          flag=1;
      }
   } 
}
