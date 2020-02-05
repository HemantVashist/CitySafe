from flask import Flask, request
from flask_cors import CORS
import sys
import json
import traceback
import sys
import pandas as pd
import numpy as np
from collections import Counter

app = Flask(__name__)
CORS(app)

df = pd.read_pickle('IPC(Examined_Levels).pkl')
df1 = pd.read_pickle('IPC(Final).pkl')
cols = df.columns
weights = [1,0.1,0.2,0.3,0.7,0.2,0.8,0,0,0,1,1,0.5,1,0.2,0.1,0.4,0.5,0.9,0,0,0,1,0.3,0.1]
df['Rating'] = sum([weights*df[col] for weights, col in zip(weights, cols[1:-2])])

def find_district(latitude, longitude):
    df['distance'] = df[df.columns[-2]].map(tuple).map(lambda x: (float(x[0]) - latitude)**2 + (float(x[1]) - longitude)**2)
    x = np.where(df['distance'] == df['distance'].min())[0][0]
    del df['distance']
    return x

def analyse_paths(paths):
    best_rating, best_index = 999999, -1
    for idx, path in enumerate(paths):
        temp = Counter()
        for node in path:
            temp[find_district(node[0], node[1])] += 1
        sum_, max_, count_ = 0, 0, 0
        for key, freq in temp.items():
            temp_holder = df.loc[key, 'Rating']
            sum_ += temp_holder*freq
            count_ += freq
            max_ = max(max_, temp_holder)
        current_rating = sum_ + (sum_/count_) + max_
        if current_rating < best_rating:
            best_rating = current_rating
            best_index = idx
    return best_index

@app.route('/coords/<latitude>/<longitude>', methods=["GET"])
def coords(latitude, longitude):
    if request.method == "GET":        
        output = {}
        index = find_district(float(latitude), float(longitude))
        name = df.loc[index, cols[0]] + ',' + df.loc[index, cols[-2]]
        features = df.loc[index, cols[1]: cols[-3]]
        data = df1.loc[index, cols[1]: cols[-3]]
        temp = [(x, y.item(), z.item()) for x, y, z in zip(cols[1:-3], features, data)]
        temp = sorted(temp, key=lambda x: x[1], reverse=True)
        for x, y, z in temp[:3]:
            output[x] = {'Percentage': y, 'Last year reported cases': z}
        # output['Name of district'] = name
        # output = sorted(output, key=lambda x: , reverse=True)
        return output
    
@app.route('/safepath', methods=["GET","POST"])
def bestpath():
    if request.method == "POST":                     
        routes = json.loads(request.data)['routes']
        paths = [[[float(x), float(y)] for x, y in routes[idx]['geometry']['coordinates']] for idx in range(len(routes))]
        output = analyse_paths(paths)
        if output == -1:
            return "No paths found!"
        return str(output)
    return "No POST form found!"

app.run(debug=True)