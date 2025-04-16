create view public.vehicle_summary_view as
select
  v.id,
  v.plate_number,
  v.office_name,
  v.driver_name,
  v.vehicle_type,
  v.engine_type,
  v.wheels,
  v.contact_number,
  et.year as latest_test_year,
  et.quarter as latest_test_quarter,
  et.test_date as latest_test_date,
  et.result as latest_test_result
from
  vehicles v
  left join lateral (
    select
      emission_tests.id,
      emission_tests.vehicle_id,
      emission_tests.year,
      emission_tests.quarter,
      emission_tests.test_date,
      emission_tests.result,
      emission_tests.created_by,
      emission_tests.created_at,
      emission_tests.updated_at
    from
      emission_tests
    where
      emission_tests.vehicle_id = v.id
    order by
      emission_tests.year desc,
      emission_tests.quarter desc
    limit
      1
  ) et on true;