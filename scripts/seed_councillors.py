"""
Seed script - Populates initial councillor data
Run this once to create councillor records in the database
"""
from db_utils import get_db_connection


COUNCILLORS_2022 = [
    {
        "slug": "sheila-levy",
        "full_name": "Sheila Levy",
        "role": "Mayor",
        "ward": "At Large",
        "votes_received": 14203,
        "vote_pct": 52.3,
    },
    {
        "slug": "rod-truscott",
        "full_name": "Rod Truscott",
        "role": "Councillor",
        "ward": "Ward 1",
        "votes_received": 8941,
        "vote_pct": 48.2,
    },
    {
        "slug": "monica-beckerson",
        "full_name": "Monica Beckerson",
        "role": "Councillor",
        "ward": "Ward 2",
        "votes_received": 8234,
        "vote_pct": 44.4,
    },
    {
        "slug": "sean-duffy",
        "full_name": "Sean Duffy",
        "role": "Councillor",
        "ward": "Ward 3",
        "votes_received": 7920,
        "vote_pct": 42.7,
    },
    {
        "slug": "victoria-macleod",
        "full_name": "Victoria Macleod",
        "role": "Councillor",
        "ward": "Ward 4",
        "votes_received": 7654,
        "vote_pct": 41.3,
    },
    {
        "slug": "pat-moreira",
        "full_name": "Pat Moreira",
        "role": "Councillor",
        "ward": "Ward 5",
        "votes_received": 7432,
        "vote_pct": 40.1,
    },
    {
        "slug": "bev-aitcheson",
        "full_name": "Bev Aitcheson",
        "role": "Councillor",
        "ward": "Ward 6",
        "votes_received": 7189,
        "vote_pct": 38.8,
    },
]


def seed_councillors():
    """Insert councillor data into database"""
    print("[v0] Seeding councillor data...")
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # First, create/get the 2022 election
                cur.execute(
                    """
                    INSERT INTO elections (year, election_date, status)
                    VALUES (%s, %s, %s)
                    ON CONFLICT DO NOTHING
                    RETURNING id
                    """,
                    (2022, "2022-10-24", "closed"),
                )
                
                result = cur.fetchone()
                if result:
                    election_id = result[0]
                else:
                    # Election already exists, fetch its ID
                    cur.execute("SELECT id FROM elections WHERE year = %s", (2022,))
                    election_id = cur.fetchone()[0]
                
                print(f"[v0] Using election ID: {election_id}")
                
                # Insert each councillor
                for councillor in COUNCILLORS_2022:
                    # Create or update person record
                    cur.execute(
                        """
                        INSERT INTO persons (slug, full_name, ward)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (slug) DO UPDATE SET
                            full_name = EXCLUDED.full_name,
                            ward = EXCLUDED.ward
                        RETURNING id
                        """,
                        (
                            councillor["slug"],
                            councillor["full_name"],
                            councillor["ward"],
                        ),
                    )
                    
                    person_id = cur.fetchone()[0]
                    print(f"[v0] Created/updated person: {councillor['full_name']} ({person_id})")
                    
                    # Create role record for this election
                    cur.execute(
                        """
                        INSERT INTO roles (
                            person_id, election_id, title, ward,
                            won, votes_received, vote_pct, start_date
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT DO NOTHING
                        """,
                        (
                            person_id,
                            election_id,
                            councillor["role"],
                            councillor["ward"],
                            True,  # Won the election
                            councillor["votes_received"],
                            councillor["vote_pct"],
                            "2022-10-24",
                        ),
                    )
                
                conn.commit()
                print(f"[v0] Successfully seeded {len(COUNCILLORS_2022)} councillors")
                
    except Exception as e:
        print(f"[v0] Error seeding database: {e}")
        raise


if __name__ == "__main__":
    seed_councillors()
