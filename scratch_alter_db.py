from sqlalchemy import text
import sys
import os

# Adding current dir to path to import back_tables
sys.path.append(os.getcwd())

from back_tables.database import engine

def alter_table():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE paciente ADD COLUMN tipo_sanguineo VARCHAR(10);"))
            conn.execute(text("ALTER TABLE paciente ADD COLUMN peso VARCHAR(20);"))
            conn.execute(text("ALTER TABLE paciente ADD COLUMN altura VARCHAR(20);"))
            conn.execute(text("ALTER TABLE paciente ADD COLUMN foto_perfil TEXT;"))
            conn.commit()
            print("Columns added successfully")
        except Exception as e:
            print("Error or already exists:", e)

if __name__ == "__main__":
    alter_table()
