import sqlite3, json
conn = sqlite3.connect(r'C:\Users\NVGWf\.n8n\database.sqlite')
c = conn.cursor()

c.execute('SELECT id, nodes, connections FROM workflow_entity WHERE name = \'ArtLink - Flujo Registro de Usuario con Gmail\'')
row = c.fetchone()
wf_id = row[0]
nodes = json.loads(row[1])
connections = json.loads(row[2])

for n in nodes:
    if n['name'] == '¿Correo Duplicado?':
        n['typeVersion'] = 1
        n['parameters'] = {
            'conditions': {
                'boolean': [
                    {
                        'value1': '={{ $json["isDuplicate"] }}',
                        'value2': True
                    }
                ]
            }
        }

c.execute('UPDATE workflow_entity SET nodes = ?, connections = ? WHERE id = ?', (json.dumps(nodes, ensure_ascii=False), json.dumps(connections, ensure_ascii=False), wf_id))
c.execute('UPDATE workflow_history SET nodes = ?, connections = ? WHERE workflowId = ?', (json.dumps(nodes, ensure_ascii=False), json.dumps(connections, ensure_ascii=False), wf_id))
conn.commit()
print('RESTORED V1 IF NODE WITH BRACKET NOTATION')
