DECLARE
  result jsonb;
  stats_data jsonb;
  quarterly_data jsonb;
  upcoming_tests_data jsonb;
  recent_tests_data jsonb;
  history_data jsonb;
  engine_type_data jsonb;
  vehicle_type_data jsonb;
  wheel_count_data jsonb;
  current_q integer;
  current_yr integer;
BEGIN
  -- Get current year and quarter for upcoming schedule logic
  SELECT EXTRACT(YEAR FROM NOW()), EXTRACT(QUARTER FROM NOW()) INTO current_yr, current_q;

  -- 1. Calculate Stats
  SELECT jsonb_build_object(
      'totalVehicles', COUNT(DISTINCT v.id),
      'testedVehicles', COUNT(DISTINCT CASE WHEN et.test_date BETWEEN make_date(selected_year, 1, 1) AND make_date(selected_year, 12, 31) THEN et.vehicle_id ELSE NULL END),
      'complianceRate', COALESCE(SUM(CASE WHEN et.result = true AND et.test_date BETWEEN make_date(selected_year, 1, 1) AND make_date(selected_year, 12, 31) THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(CASE WHEN et.test_date BETWEEN make_date(selected_year, 1, 1) AND make_date(selected_year, 12, 31) THEN 1 ELSE NULL END), 0), 0),
      'failRate', COALESCE(SUM(CASE WHEN et.result = false AND et.test_date BETWEEN make_date(selected_year, 1, 1) AND make_date(selected_year, 12, 31) THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(CASE WHEN et.test_date BETWEEN make_date(selected_year, 1, 1) AND make_date(selected_year, 12, 31) THEN 1 ELSE NULL END), 0), 0),
      'officeDepartments', COUNT(DISTINCT v.office_name)
  )
  INTO stats_data
  FROM public.vehicles v
  LEFT JOIN public.emission_tests et ON v.id = et.vehicle_id;

  -- 2. Calculate Quarterly Data
  SELECT jsonb_agg(q_data)
  INTO quarterly_data
  FROM (
    SELECT
      'Q' || EXTRACT(QUARTER FROM et.test_date) as quarter,
      SUM(CASE WHEN et.result = true THEN 1 ELSE 0 END) as pass,
      SUM(CASE WHEN et.result = false THEN 1 ELSE 0 END) as fail
    FROM public.emission_tests et
    WHERE EXTRACT(YEAR FROM et.test_date) = selected_year
    GROUP BY EXTRACT(QUARTER FROM et.test_date)
    ORDER BY quarter
  ) q_data;

  -- 3. Get Upcoming Test Schedule Info
  SELECT jsonb_agg(ut_data)
  INTO upcoming_tests_data
  FROM (
    SELECT
      ets.id::text,
      ets.location as "vehicleId",
      ets.assigned_personnel as department,
      ets.conducted_on::text as scheduledDate
    FROM public.emission_test_schedules ets
    WHERE (ets.year = current_yr AND ets.quarter >= current_q)
       OR (ets.year = current_yr + 1 AND ets.quarter = 1 AND current_q = 4)
    ORDER BY ets.year, ets.quarter
    LIMIT 1
  ) ut_data;

  -- 4. Get Recent Tests
  SELECT jsonb_agg(rt_data)
  INTO recent_tests_data
  FROM (
    SELECT
      et.id::text,
      v.plate_number as vehicleId,
      et.test_date::text,
      et.result
    FROM public.emission_tests et
    JOIN public.vehicles v ON et.vehicle_id = v.id
    WHERE EXTRACT(YEAR FROM et.test_date) = selected_year
    ORDER BY et.test_date DESC
    LIMIT 10
  ) rt_data;

  -- 5. Get Historical Compliance Data
  SELECT jsonb_agg(h_data)
  INTO history_data
  FROM (
      SELECT
          EXTRACT(YEAR FROM et.test_date)::integer as year,
          COALESCE(SUM(CASE WHEN et.result = true THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as rate
      FROM public.emission_tests et
      WHERE EXTRACT(YEAR FROM et.test_date) BETWEEN selected_year - 4 AND selected_year
      GROUP BY EXTRACT(YEAR FROM et.test_date)
      ORDER BY year
  ) h_data;

  -- 6. Get Engine Type Data
  SELECT jsonb_agg(etd_data)
  INTO engine_type_data
  FROM (
      SELECT
          v.engine_type as type,
          COUNT(*) as count
      FROM public.vehicles v
      GROUP BY v.engine_type
  ) etd_data;

  -- 7. Get Vehicle Type Data
  SELECT jsonb_agg(vtd_data)
  INTO vehicle_type_data
  FROM (
      SELECT
          v.vehicle_type as type,
          COUNT(*) as count
      FROM public.vehicles v
      GROUP BY v.vehicle_type
  ) vtd_data;

  -- 8. Get Wheel Count Data
  SELECT jsonb_agg(wcd_data)
  INTO wheel_count_data
  FROM (
      SELECT
          v.wheels as wheel_count,
          COUNT(*) as count
      FROM public.vehicles v
      GROUP BY v.wheels
  ) wcd_data;

  -- Combine all parts into the final JSON object
  result := jsonb_build_object(
      'stats', COALESCE(stats_data, '{}'::jsonb),
      'quarterlyData', COALESCE(quarterly_data, '[]'::jsonb),
      'upcomingTests', COALESCE(upcoming_tests_data, '[]'::jsonb),
      'recentTests', COALESCE(recent_tests_data, '[]'::jsonb),
      'historyData', COALESCE(history_data, '[]'::jsonb),
      'engineTypeData', COALESCE(engine_type_data, '[]'::jsonb),
      'vehicleTypeData', COALESCE(vehicle_type_data, '[]'::jsonb),
      'wheelCountData', COALESCE(wheel_count_data, '[]'::jsonb)
  );

  RETURN result;
END;