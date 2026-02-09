"""migrate tree codes to yyyy-0000

Revision ID: migrate_tree_codes_to_yyyy_0000_20260210
Revises: remove_unused_permissions_20260206
Create Date: 2026-02-10

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "migrate_tree_codes_to_yyyy_0000_20260210"
down_revision: Union[str, None] = "remove_unused_permissions_20260206"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert TAG-YYYY-XXXXXX tree codes to YYYY-0000 format."""
    op.execute(
        """
        DO $$
        DECLARE
          dup_count integer;
        BEGIN
          WITH mapped AS (
            SELECT
              id,
              tree_code,
              substring(tree_code from 5 for 4) AS year_part,
              right(tree_code, 4) AS seq_part,
              substring(tree_code from 5 for 4) || '-' || right(tree_code, 4) AS new_code
            FROM urban_greening.tree_inventory
            WHERE tree_code ~ '^TAG-[0-9]{4}-[0-9]{6}$'
          ),
          all_codes AS (
            SELECT new_code AS code FROM mapped
            UNION ALL
            SELECT tree_code AS code
            FROM urban_greening.tree_inventory
            WHERE tree_code !~ '^TAG-[0-9]{4}-[0-9]{6}$'
          )
          SELECT COUNT(*) INTO dup_count
          FROM (
            SELECT code
            FROM all_codes
            GROUP BY code
            HAVING COUNT(*) > 1
          ) duplicates;

          IF dup_count > 0 THEN
            RAISE EXCEPTION 'Tree code migration would create duplicates. Resolve collisions before applying.';
          END IF;
        END $$;
        """
    )

    op.execute(
        """
        UPDATE urban_greening.tree_inventory
        SET tree_code = substring(tree_code from 5 for 4) || '-' || right(tree_code, 4)
        WHERE tree_code ~ '^TAG-[0-9]{4}-[0-9]{6}$';
        """
    )


def downgrade() -> None:
    """Downgrade is not supported because original sequence precision is lost."""
    raise RuntimeError("Cannot downgrade tree_code format migration safely.")
