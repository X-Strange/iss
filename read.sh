#!/bin/bash

cat $1 | while read LINEA               # Leo el archivo por líneas
do
        # Capturo el número de palabras que tiene la línea
        LECTURA=$(echo $LINEA | wc -w)

        # Recorro la línea por cada palabra que existe en la misma
        for INI in $(seq 2 1 $LECTURA)
        do
                # Separo cada palabra delimitándolas con un espacio
                PALABRA=$(echo $LINEA | cut -d" " -f$INI)

                # Con las siguientes 2 líneas calculo el tamaño de la palabra
#                CALWORD=$(echo $PALABRA | wc -c)
#                TAMWORD=$(($CALWORD-1))

               # Recorro cada palabra para identificar cada letra
#                for FIN in $(seq 1 1 $TAMWORD)
#                do
#                        LETRA=$(echo $PALABRA | cut -c $FIN)
#                        echo $LETRA
#                        LETRA=" "
#                        sleep 1
#                done

               # Imprimo por pantalla para ver las salidas 

               # que me va generando el script

                echo $PALABRA
                PALABRA=" "
                sleep 1
        done

       # Imprimo por pantalla para ver las salidas 

       # que me va generando el script

        echo $LINEA
        LINEA=" "

done

exit 0


