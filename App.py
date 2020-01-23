from flask import Flask
import pandas as pd
import numpy as np

app = Flask(__name__)
df = pd.read_pickle('../IPC(Examined_Levels).pkl')
df1 = pd.read_pickle('../IPC(Final).pkl')
cols = df.columns

def find_district(latitude, longitude):
    df['distance'] = df[df.columns[-1]].map(lambda x: (float(tuple(x)[0]) - latitude)**2 + (float(tuple(x)[1]) - longitude)**2)
    return np.where(df['distance'] == df['distance'].min())[0][0]

@app.route('/coords/<latitude>/<longitude>')
def coords(latitude, longitude):
    output = {}
    index = find_district(float(latitude), float(longitude))
    name = df.loc[index, cols[0]] + ' in ' + df.loc[index, cols[-2]]
    features = df.loc[index, cols[1]: cols[-3]]
    data = df1.loc[index, cols[1]: cols[-3]]
    temp = [(x, y.item(), z.item()) for x, y, z in zip(cols[1:-3], features, data)]
    temp = sorted(temp, key=lambda x: x[1], reverse=True)
    for x, y, z in temp[:6]:
        output[x] = {'Percentage': y, 'Last year reported cases': z}
    output['Name of district'] = name
    return output

app.run(debug=True)