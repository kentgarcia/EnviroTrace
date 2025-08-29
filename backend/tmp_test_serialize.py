from app.apis.v1.sapling_requests import _serialize
from types import SimpleNamespace

# Simulate ORM objects with saplings stored as JSON string or list of legacy strings
objs = [
    SimpleNamespace(id='1', date_received='2025-08-15', requester_name='A', address='Addr1', saplings='["Bougainvillea: 6","Ilang-Ilang: 2"]', created_at='now', updated_at='now'),
    SimpleNamespace(id='2', date_received='2025-08-20', requester_name='B', address='Addr2', saplings='["Fire Tree: 3","Cassia fistula: 2"]', created_at='now', updated_at='now'),
]

for o in objs:
    print(_serialize(o))
