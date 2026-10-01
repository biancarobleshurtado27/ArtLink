import sqlite3, json
conn = sqlite3.connect(r'C:\Users\NVGWf\.n8n\database.sqlite')
c = conn.cursor()
c.execute('SELECT id, nodes FROM workflow_entity WHERE name = \'ArtLink - Flujo Registro de Usuario con Gmail\'')
row = c.fetchone()
nodes = json.loads(row[1])
for n in nodes:
    if n['name'] == '¿Correo Duplicado?':
        n['type'] = 'n8n-nodes-base.code'
        n['typeVersion'] = 2
        n['parameters'] = {
            'language': 'javaScript',
            'jsCode': 'if (String($input.item.json.isDuplicate) === "true" || $input.item.json.isDuplicate === true) { return [[$input.item], []]; } else { return [[], [$input.item]]; }'
        }
c.execute('UPDATE workflow_entity SET nodes = ? WHERE id = ?', (json.dumps(nodes, ensure_ascii=False), row[0]))
conn.commit()
print("DONE CODE STRING FIX")
