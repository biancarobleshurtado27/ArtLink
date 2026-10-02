import sqlite3, json, uuid
from datetime import datetime

conn = sqlite3.connect(r'C:\Users\NVGWf\.n8n\database.sqlite')
c = conn.cursor()

# Load workflow definition from file
with open(r'c:\Users\NVGWf\OneDrive\Documents\Proyecto_Final\n8n\flujo-asistente-admin.json', 'r', encoding='utf-8') as f:
    wf_data = json.load(f)

wf_id = 'ArtLinkAdminGem1'
wf_name = wf_data['name']
nodes_json = json.dumps(wf_data['nodes'], ensure_ascii=False)
connections_json = json.dumps(wf_data['connections'], ensure_ascii=False)
settings_json = json.dumps(wf_data.get('settings', {'executionOrder': 'v1'}), ensure_ascii=False)

now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
version_id = str(uuid.uuid4())

# Delete if already exists to ensure idempotent registration
c.execute("DELETE FROM webhook_entity WHERE workflowId = ?", (wf_id,))
c.execute("DELETE FROM shared_workflow WHERE workflowId = ?", (wf_id,))
c.execute("DELETE FROM workflow_history WHERE workflowId = ?", (wf_id,))
c.execute("DELETE FROM workflow_entity WHERE id = ?", (wf_id,))

# Insert into workflow_entity
c.execute("""
INSERT INTO workflow_entity (
    id, name, active, nodes, connections, settings, staticData, pinData,
    versionId, triggerCount, meta, parentFolderId, createdAt, updatedAt,
    isArchived, versionCounter, description, activeVersionId, nodeGroups, sourceWorkflowId
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    wf_id, wf_name, 1, nodes_json, connections_json, settings_json, None, None,
    version_id, 1, None, None, now_str, now_str,
    0, 1, 'Asistente IA Administrativo ArtLink impulsado por Gemini y N8N', version_id, '[]', None
))

# Insert into shared_workflow
c.execute("""
INSERT INTO shared_workflow (workflowId, projectId, role, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?)
""", (wf_id, 'O6geHd44EOlQOmZT', 'workflow:owner', now_str, now_str))

# Insert into workflow_history
c.execute("""
INSERT INTO workflow_history (versionId, workflowId, nodes, connections, authors, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", (version_id, wf_id, nodes_json, connections_json, 'Administrador ArtLink', now_str, now_str))

# Insert into webhook_entity for live webhook routing
c.execute("""
INSERT INTO webhook_entity (workflowId, webhookPath, method, node, webhookId, pathLength)
VALUES (?, ?, ?, ?, ?, ?)
""", (wf_id, 'artlink-admin-assistant', 'POST', 'Webhook ArtLink Admin', 'artlink-admin-assistant', None))

conn.commit()
print("SUCCESSFULLY REGISTERED AND ACTIVATED ADMIN WORKFLOW IN N8N DATABASE")
