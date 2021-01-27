import requests
import json
import time

filename = "./Warriors.mp3"
api_url = "https://audiotag.info/api"
api_key = ""


def identifyMusic():
    payload = {"action": "identify", "apikey": api_key}

    result = requests.post(api_url, data=payload, files={"file": open(filename, "rb")})
    global token
    token = json.loads(result.text)["token"]
    return result

def getResult(token):
    payload = {"action": "get_result", "token": token, "apikey": api_key}
    
    return requests.post(api_url, data=payload)

def printResult(result):
    json_object = json.loads(result.text)
    pretty_print = json.dumps(json_object, indent=4, sort_keys=True)
    print(pretty_print)

printResult(identifyMusic())
print("token", token)
time.sleep(5)
printResult(getResult(token))

