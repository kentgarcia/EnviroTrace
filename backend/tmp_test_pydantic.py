from app.schemas.planting_schemas import SaplingRequestCreate

samples = [
    {
        "date_received": "2025-08-15",
        "requester_name": "Barangay 101 Office",
        "address": "Lot 12, Sampaloc St, Manila",
        "saplings": ['Bougainvillea: 6', 'Ilang-Ilang: 2']
    },
    {
        "date_received": "2025-08-20",
        "requester_name": "Green City NGO",
        "address": "Rizal Park, Ermita, Manila",
        "saplings": '["Fire Tree: 3", "Cassia fistula: 2"]'
    }
]

for s in samples:
    obj = SaplingRequestCreate(**s)
    print(obj)
    print(obj.saplings)
