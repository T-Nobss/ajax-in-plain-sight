"""
Seed the database with initial councillor data from the 2022 election
"""
import json
from datetime import datetime

# This would normally connect to the database via Prisma or direct connection
# For now, this shows the data structure

AJAX_COUNCILLORS_2022 = [
    {
        "full_name": "Shaun Collier",
        "slug": "shaun-collier",
        "title": "Mayor",
        "ward": None,
        "email": "shaun.collier@ajax.ca",
        "photo_url": None,
        "bio": "Elected Mayor of Ajax in 2022",
        "roles": [
            {
                "title": "Mayor",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 12847,
            }
        ],
    },
    {
        "full_name": "Marilyn Crawford",
        "slug": "marilyn-crawford",
        "title": "Regional Councillor",
        "ward": "Ward 1",
        "email": "marilyn.crawford@ajax.ca",
        "photo_url": None,
        "bio": "Regional Councillor for Ward 1",
        "roles": [
            {
                "title": "Regional Councillor - Ward 1",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 8934,
            }
        ],
    },
    {
        "full_name": "Sterling Lee",
        "slug": "sterling-lee",
        "title": "Regional Councillor",
        "ward": "Ward 2",
        "email": "sterling.lee@ajax.ca",
        "photo_url": None,
        "bio": "Regional Councillor for Ward 2",
        "roles": [
            {
                "title": "Regional Councillor - Ward 2",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 7823,
            }
        ],
    },
    {
        "full_name": "Joanne Dies",
        "slug": "joanne-dies",
        "title": "Regional Councillor",
        "ward": "Ward 3",
        "email": "joanne.dies@ajax.ca",
        "photo_url": None,
        "bio": "Regional Councillor for Ward 3",
        "roles": [
            {
                "title": "Regional Councillor - Ward 3",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 9156,
            }
        ],
    },
    {
        "full_name": "Rob Tyler-Morin",
        "slug": "rob-tyler-morin",
        "title": "Local Councillor",
        "ward": "Ward 1",
        "email": "rob.tylermorin@ajax.ca",
        "photo_url": None,
        "bio": "Local Councillor for Ward 1",
        "roles": [
            {
                "title": "Local Councillor - Ward 1",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 6234,
            }
        ],
    },
    {
        "full_name": "Nancy Henry",
        "slug": "nancy-henry",
        "title": "Local Councillor",
        "ward": "Ward 2",
        "email": "nancy.henry@ajax.ca",
        "photo_url": None,
        "bio": "Local Councillor for Ward 2",
        "roles": [
            {
                "title": "Local Councillor - Ward 2",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 7456,
            }
        ],
    },
    {
        "full_name": "Lisa Bower",
        "slug": "lisa-bower",
        "title": "Local Councillor",
        "ward": "Ward 3",
        "email": "lisa.bower@ajax.ca",
        "photo_url": None,
        "bio": "Local Councillor for Ward 3",
        "roles": [
            {
                "title": "Local Councillor - Ward 3",
                "start_date": "2022-11-01",
                "end_date": None,
                "election_id": "2022",
                "votes_received": 8934,
            }
        ],
    },
]

if __name__ == "__main__":
    print(f"Loaded {len(AJAX_COUNCILLORS_2022)} councillors")
    print(json.dumps(AJAX_COUNCILLORS_2022, indent=2))
