-- Seed Staff Members for Kabinet Bumi Cakrawala 2026
-- Inserts into public.profiles, public.user_assignments (role = 'STAFF'), and public.ministry_members (is_c_level = FALSE)

DO $$
DECLARE
  v_row RECORD;
  v_ministry_id UUID;
  v_user_id UUID;
BEGIN
  FOR v_row IN
    SELECT * FROM (VALUES
      -- 1. Human Capital Ministry (MIN-HC)
      ('MIN-HC', 'Naura Arni Paramita'),
      ('MIN-HC', 'Viona Putri Maghfiroh'),
      ('MIN-HC', 'Matthew Eric Myomin'),
      ('MIN-HC', 'Queen Kasandra Kurniawan'),
      ('MIN-HC', 'Lana Nabila Zahirah'),
      ('MIN-HC', 'Habib Umar Muhtar'),
      ('MIN-HC', 'A. Zhafir Mahfudz Ubaidillah'),
      ('MIN-HC', 'Muchisan Luffi Tarandeli'),
      ('MIN-HC', 'Adinda Marcelina F. Lumban Tobing'),

      -- 2. Talent Growth Ministry (MIN-TG)
      ('MIN-TG', 'Briliant Ghithraf Albari'),
      ('MIN-TG', 'Aloysius Aris Budi Setiawan'),
      ('MIN-TG', 'Ananda'),
      ('MIN-TG', 'Claudio Amadeus Modena'),
      ('MIN-TG', 'Faiq Fajar Islamay'),
      ('MIN-TG', 'Yenny Bubun'),
      ('MIN-TG', 'Aaisyah Aura Wijaya Kusuma'),
      ('MIN-TG', 'Ferrencya Audina Rudianissa'),
      ('MIN-TG', 'Rofiatul Faizah'),
      ('MIN-TG', 'Fitri Nur Annisa'),

      -- 3. Creative Enterprise Ministry (MIN-CE)
      ('MIN-CE', 'Aqila Najia Puterykitta'),
      ('MIN-CE', 'Aliyah Putri Azra'),
      ('MIN-CE', 'Puty Hanifa'),
      ('MIN-CE', 'Samuel Putra Halomoan Silitonga'),
      ('MIN-CE', 'Rafi Ageng Suryawijaya'),
      ('MIN-CE', 'Boyjes Sam Domu Situngkir'),
      ('MIN-CE', 'Alya Ashila Zhafira'),
      ('MIN-CE', 'Michael Reynaldo Tan'),
      ('MIN-CE', 'Fairuz Zata Amani'),
      ('MIN-CE', 'Muhammad Zaki Mahfuzi'),

      -- 4. Student Advocacy and Welfare Ministry (MIN-SAW)
      ('MIN-SAW', 'Muhammad Rizki Rizaldi'),
      ('MIN-SAW', 'Rizkya Dwi Aulya Fasyaa'),
      ('MIN-SAW', 'Aulia Putri Dewi Parawansa'),
      ('MIN-SAW', 'Muhammad Arfa Aflahdani'),
      ('MIN-SAW', 'Chalista Anggun Permata'),
      ('MIN-SAW', 'Ryan Putra Adivara'),
      ('MIN-SAW', 'Inka Nadine Chandrawinata'),
      ('MIN-SAW', 'Senja Cahya Tirta'),
      ('MIN-SAW', 'Aulia Rahmah'),
      ('MIN-SAW', 'M. Farhan Zaky'),

      -- 5. Inter-Agency Affairs Ministry (MIN-IAA)
      ('MIN-IAA', 'Aziz Muhammad Ar-Razy'),
      ('MIN-IAA', 'Jovant Viendra Lee'),
      ('MIN-IAA', 'Ahmad Rafly Aditya'),
      ('MIN-IAA', 'Rakaditya Fajrian Haryadi'),
      ('MIN-IAA', 'Muhammad Adhi Nawf Adrian'),
      ('MIN-IAA', 'Dennis Putra Sutikno'),
      ('MIN-IAA', 'Jasmine Aqilah Rahmadia'),
      ('MIN-IAA', 'Ni Made Intan Cahyadewi'),
      ('MIN-IAA', 'Ilfa Zakiyah Al-Abidah'),
      ('MIN-IAA', 'Devita Adhani Yumna Musti'),

      -- 6. Studies and Strategic Action Ministry (MIN-SSA)
      ('MIN-SSA', 'Difa Meifia Afana'),
      ('MIN-SSA', 'Muhammad Varrel Diandra'),
      ('MIN-SSA', 'Alif Dany Al Ghifari'),
      ('MIN-SSA', 'Kamilla Ulfa Berlian Rosyida'),
      ('MIN-SSA', 'Rouf Daniswara'),
      ('MIN-SSA', 'Kamilia Ishmah Alya Hanifah'),
      ('MIN-SSA', 'Naufal Azis Muzakki'),
      ('MIN-SSA', 'Naufaldo Dafa Zaki Bastian'),
      ('MIN-SSA', 'Fithri Luluul Maknun'),
      ('MIN-SSA', 'Achmad Zidni Riziq'),

      -- 7. Social Equity and Environment Ministry (MIN-SEE)
      ('MIN-SEE', 'Muhammad Aqil Rusydi'),
      ('MIN-SEE', 'Valentino Febrian Sanggoleo Hamid'),
      ('MIN-SEE', 'Andina Mega Kusuma'),
      ('MIN-SEE', 'Sharen Charismariani Shallom'),
      ('MIN-SEE', 'Fatikha Ulinnuha'),
      ('MIN-SEE', 'Michael Juanio Patrick'),
      ('MIN-SEE', 'Novelina Raditya Triwiranti'),

      -- 8. Administration and Finance Bureau (MIN-AF)
      ('MIN-AF', 'Mohammad Alvin R Ramadhan'),
      ('MIN-AF', 'Intan Fitriah'),
      ('MIN-AF', 'Aluna Sassy Elfriyan'),
      ('MIN-AF', 'Mufidah Samlawi'),
      ('MIN-AF', 'M.Jefri Leonardi'),
      ('MIN-AF', 'Wirya Ayu Amalia'),
      ('MIN-AF', 'Ahmad Fathi Al Ghifari'),
      ('MIN-AF', 'Revalia Rahmadani'),
      ('MIN-AF', 'Nadilla Nur Awalia R.'),

      -- 9. Creative Media and Information Bureau (MIN-CMI)
      ('MIN-CMI', 'Farica Natarina'),
      ('MIN-CMI', 'Ariel Fardian Aysel'),
      ('MIN-CMI', 'Damar Utomo'),
      ('MIN-CMI', 'Muhammad Akbar Aji Ramadhan'),
      ('MIN-CMI', 'Callysta Fredelina'),
      ('MIN-CMI', 'Tabina Kenar Imani'),
      ('MIN-CMI', 'Wardatul Umma'),
      ('MIN-CMI', 'Pristian Yhayhan Fazira'),
      ('MIN-CMI', 'Lutfiatul Rofiah'),

      -- 10. IT Solutions Bureau (MIN-ITS)
      ('MIN-ITS', 'Rifky Cahya Setyaji'),
      ('MIN-ITS', 'Fadhila Zalfa Alisya'),
      ('MIN-ITS', 'Inas Tuqa Haura Bekti Harsono'),
      ('MIN-ITS', 'Rhyu Santosa'),
      ('MIN-ITS', 'Lintang Muhammad Shidiq'),
      ('MIN-ITS', 'Rifqi Fadhil Abrar'),
      ('MIN-ITS', 'Nayla Nur Amalia'),
      ('MIN-ITS', 'Intsany Rofilah'),
      ('MIN-ITS', 'Rosy Fredycia Bagaskara')
    ) AS t(ministry_code, full_name)
  LOOP
    SELECT id INTO v_ministry_id FROM public.ministries WHERE code = v_row.ministry_code LIMIT 1;
    IF v_ministry_id IS NULL THEN
      RAISE NOTICE 'Ministry % not found, skipping %', v_row.ministry_code, v_row.full_name;
      CONTINUE;
    END IF;

    v_user_id := gen_random_uuid();

    INSERT INTO public.profiles (id, full_name)
    VALUES (v_user_id, v_row.full_name)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_assignments (profile_id, role, ministry_id)
    VALUES (v_user_id, 'STAFF', v_ministry_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.ministry_members (ministry_id, profile_id, member_name, position_title, is_c_level)
    VALUES (v_ministry_id, v_user_id, v_row.full_name, 'Staff', FALSE)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
