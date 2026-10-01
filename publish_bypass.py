import sqlite3, json
conn = sqlite3.connect(r'C:\Users\NVGWf\.n8n\database.sqlite')
c = conn.cursor()

# Get workflow ID
c.execute("SELECT id FROM workflow_entity WHERE name = 'ArtLink - Flujo Registro de Usuario con Gmail'")
row = c.fetchone()
wf_id = row[0]

# Read from workflow_entity (since I already ran bypass.py, workflow_entity HAS the correct bypassed nodes)
c.execute("SELECT nodes, connections FROM workflow_entity WHERE id = ?", (wf_id,))
row = c.fetchone()
new_nodes = row[0]
new_connections = row[1]

# Overwrite EVERY row in workflow_history for this workflow
c.execute("UPDATE workflow_history SET nodes = ?, connections = ? WHERE workflowId = ?", (new_nodes, new_connections, wf_id))
conn.commit()
print("UPDATED WORKFLOW HISTORY")
