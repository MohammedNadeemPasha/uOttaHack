import json
import paho.mqtt.client as mqtt
import certifi
import time
import random

all_cars = {}
connected_cars = {}
charging_stations = {"station_1":[], "station_2":[]}
station_1_x = 250
station_2_x = 350
ottawa_news = ["Welcome to Ottawa, the capital of Canada!", "Enjoy your trip at Ottawa"]
route_news = ["Construction at route 70, proceed with caution", "Lane diversion ahead!", "Snowy road at route 70"]
car_distance = 300

def get_pairs(numbers_dict):
    keys = list(numbers_dict.keys())
    old_cars = connected_cars.copy()
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            num1 = numbers_dict[keys[i]]
            num2 = numbers_dict[keys[j]]
            if abs(num1 - num2) < car_distance:
                connected_cars[keys[i]] = keys[j]
                connected_cars[keys[j]] = keys[i]
    return connected_cars, old_cars

def on_connect(client, userdata, flags, rc):
    client.subscribe('admin_police')
    client.subscribe('admin_news')    

    print(f'Connected (Result: {rc})')
    client.publish('info', payload='Highway-91 is closed')
    client.publish('alert', payload="Be safe")
    client.subscribe('car_location')
    client.subscribe('emergency')
    client.subscribe('cars')
    client.subscribe('nearby_cars')


# Callback when message is received
def on_message(client, userdata, msg):
    print("Received message:", msg.payload)
    if msg.topic == 'emergency':
        payload = json.loads(msg.payload)
        car_no = payload['car_no']
        car_x = payload['x']
        payload = json.loads(msg.payload) 
        client.publish('alert', 'Crash occured at ' + str(car_x) + 'for ' + str(car_no))
        print("ALERTED")

    if msg.topic in ['admin_police'] :
        client.publish('alert', msg.payload)

    if msg.topic in ['admin_news'] :
        client.publish('info', msg.payload)

    # if msg.topic == 'cars':

            
    if msg.topic == 'car_location':
        payload = json.loads(msg.payload) 
        for car in payload:
            all_cars[car['car_no']] = car

    client.publish('all_cars', payload = json.dumps(all_cars))

    if msg.topic == 'cars':
        payload = json.loads(msg.payload)
        car_no = payload['car_no']
        car_x = payload['x']
        all_cars[car_no] = car_x
        connected_cars, old_cars = get_pairs(all_cars)
        if int(payload['x']) < 100:
            client.publish('news/'+payload['car_no'], "You are starting at Route 70")
        elif int(payload['x']) > 300 and int(payload['x']) <= 400:
            client.publish('news/'+payload['car_no'], "Construction at route 70, proceed with caution")
        elif int(payload['x']) > 600 and int(payload['x']) <= 800:
            client.publish('news/'+payload['car_no'], "Snowy road at route 70")
        elif int(payload['x']) > 800 and int(payload['x'] <= 1200):
            client.publish('news/'+payload['car_no'], "Welcome to Ottawa")
        elif int(payload['x']) > 1200:
            client.publish('news/'+payload['car_no'], "You've reached your destination")
        print(connected_cars)
        for k, v in connected_cars.items():
            client.publish('nearby/'+k, json.dumps({'car_no':v, 'x':all_cars[v]}))
            client.publish('nearby/'+v, json.dumps({'car_no':k, 'x':all_cars[k]}))
        for k, v in list(connected_cars.items()):  # Convert dictionary items to a list before iterating
            if abs(all_cars[k] - all_cars[v]) > car_distance:
                if k in connected_cars:
                    del connected_cars[k]
                if v in connected_cars:
                    del connected_cars[v]

    payload = json.loads(msg.payload) 
    for stat in [("station_1", 500), ('station_2', 700)]:
        print(stat[0])
        if abs(payload['x'] -  stat[1]) <= 200:
            if 'car_no' in payload and payload['car_no'] not in charging_stations[stat[0]]:
                charging_stations[stat[0]].append(payload['car_no'])
                client.publish('news/'+payload['car_no'], json.dumps({"station_name":stat[0],"Average wait time": str(random.choice([1,2,3,1.5]))+" hr", "total_slots":str(random.choice([1,2,3]))}))
                client.publish('charging/'+payload['car_no'], json.dumps({"station_name":stat[0],"Average wait time": str(random.choice([1,2,3,1.5]))+" hr", "total_slots":str(random.choice([1,2,3]))}))
        else:
            if 'car_no' in payload and payload['car_no'] in charging_stations[stat[0]]:
                if payload['car_no']in charging_stations[stat[0]]:
                    del charging_stations[stat[0]][charging_stations[stat[0]].index(payload['car_no'])]


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.tls_set(ca_certs=certifi.where())

client.username_pw_set('solace-cloud-client', 'ksafhjo4ta84h9b5bjl4s4uqqp')
client.connect('mr-connection-a3c5h9h8foc.messaging.solace.cloud',port=8883)


client.loop_forever()