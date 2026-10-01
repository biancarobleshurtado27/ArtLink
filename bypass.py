import sqlite3, json
conn = sqlite3.connect(r'C:\Users\NVGWf\.n8n\database.sqlite')
c = conn.cursor()
c.execute('SELECT id, nodes, connections FROM workflow_entity WHERE name = \'ArtLink - Flujo Registro de Usuario con Gmail\'')
row = c.fetchone()
nodes = json.loads(row[1])
connections = json.loads(row[2])

# Find the DB node and change it to output 2 arrays
for n in nodes:
    if n['name'] == 'Consultar Correo en DB':
        # Add output configuration if not present
        if 'typeOptions' not in n:
            n['typeOptions'] = {}
        # Ensure it has 2 outputs
        # Usually it's just handled by returning an array of 2 arrays
        n['jsCode'] = """
const payload = $('Validar Payload').item.json;
let users = [];
try {
  users = await this.helpers.httpRequest({
    method: 'GET',
    url: 'http://localhost:3000/users?email=' + encodeURIComponent(payload.email)
  });
} catch (error) {
  users = [];
}
// json-server returns string if not parsed? Parse it just in case
if (typeof users === 'string') {
    try { users = JSON.parse(users); } catch(e) {}
}

const isDuplicate = Array.isArray(users) && users.length > 0;
const outItem = { json: { ...payload, isDuplicate } };

if (isDuplicate) {
    return [[outItem], []];
} else {
    return [[], [outItem]];
}
"""

# Re-route connections from Consultar Correo en DB
# main[0] -> TRUE branch -> Enviar Aviso Duplicado con Gmail
# main[1] -> FALSE branch -> Insertar Usuario en DB
connections['Consultar Correo en DB'] = {
    'main': [
        [{'node': 'Enviar Aviso Duplicado con Gmail', 'type': 'main', 'index': 0}],
        [{'node': 'Insertar Usuario en DB', 'type': 'main', 'index': 0}]
    ]
}

# Remove the buggy IF node from the workflow completely
nodes = [n for n in nodes if n['name'] != '¿Correo Duplicado?']

c.execute('UPDATE workflow_entity SET nodes = ?, connections = ? WHERE id = ?', 
          (json.dumps(nodes, ensure_ascii=False), json.dumps(connections, ensure_ascii=False), row[0]))
conn.commit()
print("DONE BYPASS")
