#!/usr/bin/env python3
import sys
import subprocess
import datetime
import time
import numpy as np
import soundfile as sf
import http.client
import os.path
import math
import random
import ftplib
import time
import Adafruit_DHT
import requests
import matplotlib.pyplot as plt


# Settings
folder_record = "/home/pi/WSN_Code/recordfiles" # Folder for storing the sound files
fileFormat_record = ".wav" # File format of the sound files
#folder_log = "/home/pi/WSN_Code/logfiles" # Folder for storing the log files
#fileFormat_log = ".txt" # File format of the log file
folder_json = "/home/pi/WSN_Code/jsonfiles"
fileFormat_json = ".json"
interval= 10 # log and JSON file writig interval, seconds

subprocess._cleanup()

def writeJSON(folder_json, fileFormat_json, temp, hum, soundFlag):
    timeStamp = round(time.time())
    fileName = folder_json + "/" +  str(timeStamp) + fileFormat_json  
    dataToWrite = '{\n"dateTime":'+ str(timeStamp) + ',\n"temperature":' + str(round(temp,3)) + ',\n"humidity":' + str(round(hum,3)) + ',\n"sound":' + str(soundFlag) + '\n}'
    print(dataToWrite)
    with open(fileName, "w") as f:
       f.write(dataToWrite)
    return fileName

def writeToLog(fileName, fieldName, val): # Writes data to the log file
    now = datetime.datetime.now()
    timeStamp = str(now.hour).zfill(2) + ":" + str(now.minute).zfill(2) + ":" + str(now.second).zfill(2)
    currentSample = '{"time": ' + '"' + timeStamp + '","' + fieldName + '": ' + str(round(val,3)) + '}\n'
    print(currentSample)
    with open(fileName, "a") as f:
       f.write(currentSample)
    return 1
     
def uploadJSON(fileName): # Upload the log file
    url = "http://46.101.187.77:3000/upload"
    payload = '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"file\"; filename=\"' + fileName + '\"\r\nContent-Type: application/json\r\n\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    headers = {
    'content-type': "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
    'Cache-Control': "no-cache",
    'Postman-Token': "732e45b2-2664-0fd5-8513-76edd46e321c"
    }
    response = requests.request("POST", url, data=payload, headers=headers)
    print(response.text)
    res = conn.getresponse()
    data = res.read()
    print(data.decode("utf-8"))
    print("Log file sent!")
    return 1

def analyzeSoundFile(fileName): # Analyzes the sound files and decides if a noise is present or not
    data, samplerate = sf.read(fileName)
    std = np.std(data) 
    ppmBelow = 1000000*((data < -0.008).sum()/len(data)) # over 0.00 
    ppmAbove = 1000000*((data > -0.000).sum()/len(data)) #under -0.008
    if (abs(ppmBelow) > 0.01) | (abs(ppmAbove) > 0.01) | (std > 0.004): #0.004
        noiseDetected = 1
    else:
        noiseDetected = 0
    #print(std) #Code to visualize noise data
    #print(ppmBelow)
    #print(ppmAbove)
    #print(noiseDetected)
    #plt.plot(data)
    #plt.xlabel("Sample")
    #plt.ylabel("Sound level")
    #plt.show()
    return noiseDetected


while True: # Main loop
    # Record sound file
    now = datetime.datetime.now()
    currentDate = str(now.year).zfill(4) + "-" + str(now.month).zfill(2) + "-" + str(now.day).zfill(2)
    currentTime = str(now.hour).zfill(2) + ":" + str(now.minute).zfill(2) + ":" + str(now.second).zfill(2)
    fileName_record = "SL_" + currentDate + "_" + currentTime
    path_record = folder_record + "/" + fileName_record + fileFormat_record
    #path_log = folder_log + "/" + currentDate + fileFormat_log
    print("Starting to record")
    pSound = subprocess.Popen(["arecord", path_record, "-r", "44100", "-f", "U8", "-D", "sysdefault:CARD=1"])
    
    # Temperature and humidity data
    hum, temp = Adafruit_DHT.read_retry(11, 4)
    #temp = 10*random.random() + 15 # simulated version
    #hum = 20*random.random() + 30 # simulated version
    writeToLog(path_log, "temp", temp)
    writeToLog(path_log, "hum", hum)
    time.sleep(interval)
               
    pSound.terminate()
    print("Recording terminated")
    soundFlag = analyzeSoundFile(path_record)
    writeToLog(path_log, "noiseFlag", noiseDetected)

    latestJSON = writeJSON(folder_json, fileFormat_json, temp, hum, soundFlag)
    uploadJSON(latestJSON)
           
subprocess._cleanup() 