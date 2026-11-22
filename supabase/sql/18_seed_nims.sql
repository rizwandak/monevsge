-- Update NIM for all Board of Directors, C-Level, and Staff in public.profiles
-- Matches by LOWER(TRIM(full_name))

DO $$
DECLARE
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT * FROM (VALUES
      -- BOARD OF DIRECTORS
      ('Maulidya I''tikaf Maghfiroh', '235150701111037'),
      ('Rizwanda Keysha Cahya Putra', '235150601111041'),
      ('Ana Zahratul Firdausi', '235150201111049'),
      ('Fira Zaha Iklila', '235150207111007'),

      -- HUMAN CAPITAL MINISTRY
      ('Muhammad Abdillah', '245150401111015'),
      ('Faradilla Aurellia Lianto', '245150407111055'),
      ('Rafi Ibnushaleh', '245150301111012'),
      ('Naura Arni Paramita', '255150600111011'),
      ('Viona Putri Maghfiroh', '255150401111050'),
      ('Matthew Eric Myomin', '255150400111008'),
      ('Queen Kasandra Kurniawan', '255150701111033'),
      ('Lana Nabila Zahirah', '255150401111038'),
      ('Habib Umar Muhtar', '255150700111023'),
      ('A. Zhafir Mahfudz Ubaidillah', '255150307111042'),
      ('Muchisan Luffi Tarandeli', '255150401111034'),
      ('Adinda Marcelina F. Lumban Tobing', '255150401111046'),

      -- TALENT GROWTH MINISTRY
      ('M Dzakir Thuha Al Ghaffar', '245150307111004'),
      ('Sang Pimandu Banjaran', '245150300111006'),
      ('Layla ''Afifah Ramadhani', '245150301111007'),
      ('Briliant Ghithraf Albari', '255150207111092'),
      ('Aloysius Aris Budi Setiawan', '255150600111018'),
      ('Ananda', '255150307111034'),
      ('Claudio Amadeus Modena', '255150400111072'),
      ('Faiq Fajar Islamay', '255150707111016'),
      ('Yenny Bubun', '255150307111059'),
      ('Aaisyah Aura Wijaya Kusuma', '255150301111035'),
      ('Ferrencya Audina Rudianissa', '255150407111061'),
      ('Rofiatul Faizah', '255150200111019'),
      ('Fitri Nur Annisa', '255150401111006'),

      -- CREATIVE ENTERPRISE MINISTRY
      ('Azka Mitsalia Zamzami', '245150407111044'),
      ('Niken Nur Baiti', '245150707111016'),
      ('Muhammad Dzakwan Ikram', '245150301111019'),
      ('Aqila Najia Puterykitta', '255150400111043'),
      ('Aliyah Putri Azra', '255150400111077'),
      ('Puty Hanifa', '255150701111037'),
      ('Samuel Putra Halomoan Silitonga', '245150307111049'),
      ('Rafi Ageng Suryawijaya', '255150601111006'),
      ('Boyjes Sam Domu Situngkir', '245150300111040'),
      ('Alya Ashila Zhafira', '255150407111076'),
      ('Michael Reynaldo Tan', '255150407111066'),
      ('Fairuz Zata Amani', '255150301111037'),
      ('Muhammad Zaki Mahfuzi', '255150200111005'),

      -- STUDENT ADVOCACY AND WELFARE MINISTRY
      ('Syarief Choirul Anwar', '245150301111028'),
      ('Nayla Salmanda Lupita', '245150400111025'),
      ('R. Herjuno Rizky Anugrah', '245150300111047'),
      ('Muhammad Rizki Rizaldi', '255150201111043'),
      ('Rizkya Dwi Aulya Fasyaa', '255150401111025'),
      ('Aulia Putri Dewi Parawansa', '255150207111097'),
      ('Muhammad Arfa Aflahdani', '255150301111033'),
      ('Chalista Anggun Permata', '255150201111051'),
      ('Ryan Putra Adivara', '255150700111025'),
      ('Inka Nadine Chandrawinata', '255150607111029'),
      ('Senja Cahya Tirta', '255150200111016'),
      ('Aulia Rahmah', '255150707111085'),
      ('M. Farhan Zaky', '245150207111041'),

      -- INTER-AGENCY AFFAIRS MINISTRY
      ('Ahmad Rayhan Sofian', '245150407111086'),
      ('Mahessi Putri Septananta', '245150401111028'),
      ('Gangsar Wijayanto', '245150407111022'),
      ('Aziz Muhammad Ar-Razy', '255150201111015'),
      ('Jovant Viendra Lee', '255150401111013'),
      ('Ahmad Rafly Aditya', '255150407111030'),
      ('Rakaditya Fajrian Haryadi', '255150400111032'),
      ('Muhammad Adhi Nawf Adrian', '255150300111018'),
      ('Dennis Putra Sutikno', '255150207111087'),
      ('Jasmine Aqilah Rahmadia', '255150400111053'),
      ('Ni Made Intan Cahyadewi', '255150601111007'),
      ('Ilfa Zakiyah Al-Abidah', '255150601111021'),
      ('Devita Adhani Yumna Musti', '255150407111093'),

      -- STUDIES AND STRATEGIC ACTION MINISTRY
      ('Muhammad Rafi Alfarel K', '245150307111018'),
      ('Muhammad Najhan Adz Zikra', '245150307111042'),
      ('Muhammad Cahyo Bintang', '245150301111025'),
      ('Difa Meifia Afana', '255150307111032'),
      ('Muhammad Varrel Diandra', '245150307111029'),
      ('Alif Dany Al Ghifari', '255150607111012'),
      ('Kamilla Ulfa Berlian Rosyida', '255150307111082'),
      ('Rouf Daniswara', '255150700111013'),
      ('Kamilia Ishmah Alya Hanifah', '255150407111009'),
      ('Naufal Azis Muzakki', '255150307111018'),
      ('Naufaldo Dafa Zaki Bastian', '255150307111045'),
      ('Fithri Luluul Maknun', '255150607111028'),
      ('Achmad Zidni Riziq', '255150601111027'),

      -- SOCIAL EQUITY AND ENVIRONMENT MINISTRY
      ('RAIHAN ENDRI PRATAMA', '245150300111019'),
      ('Zanita Alya Khairunnisa', '245150707111019'),
      ('Anindhita Faiza Aulia', '245150201111042'),
      ('Muhammad Aqil Rusydi', '255150307111064'),
      ('Valentino Febrian Sanggoleo Hamid', '255150400111063'),
      ('Andina Mega Kusuma', '255150601111020'),
      ('Sharen Charismariani Shallom', '255150407111090'),
      ('Fatikha Ulinnuha', '255150207111114'),
      ('Michael Juanio Patrick', '255150201111037'),
      ('Novelina Raditya Triwiranti', '255150700111039'),
      ('Jaler Zuhdi Nail', '255150207111062'),
      ('Rameyza Alya Zuhra', '255150701111029'),
      ('Mauliddya Nabilla Tri Aprillyani', '255150701111009'),

      -- ADMINISTRATION AND FINANCE BUREAU
      ('Nayla Shafa Khairunnisa', '245150707111028'),
      ('Cantika Putri Permatasari', '245150401111010'),
      ('Raden Fatih Abdul Jabbar', '245150307111017'),
      ('Mohammad Alvin R Ramadhan', '255150400111057'),
      ('Intan Fitriah', '255150607111011'),
      ('Aluna Sassy Elfriyan', '255150400111036'),
      ('Mufidah Samlawi', '255150700111014'),
      ('M.Jefri Leonardi', '255150407111050'),
      ('Wirya Ayu Amalia', '255150407111054'),
      ('Ahmad Fathi Al Ghifari', '255150200111032'),
      ('Revalia Rahmadani', '255150400111059'),
      ('Nadilla Nur Awalia R.', '255150600111032'),

      -- CREATIVE MEDIA AND INFORMATION BUREAU
      ('Ezra Fara Al Ihsan', '245150401111043'),
      ('Ahsana Maswa', '245150607111008'),
      ('Ifka Rosmalita Nur Nazjila', '245150207111022'),
      ('Farica Natarina', '255150600111026'),
      ('Ariel Fardian Aysel', '255150401111022'),
      ('Damar Utomo', '255150201111007'),
      ('Muhammad Akbar Aji Ramadhan', '255150201111008'),
      ('Callysta Fredelina', '255150407111080'),
      ('Tabina Kenar Imani', '255150400111046'),
      ('Wardatul Umma', '255150600111050'),
      ('Pristian Yhayhan Fazira', '255150701111040'),
      ('Lutfiatul Rofiah', '255150200111026'),

      -- IT SOLUTION BUREAU
      ('Muhammad Naufal Mathara Rahman', '245150307111006'),
      ('Novita Azka Maghfira', '245150407111078'),
      ('Fernando Putra Islamy', '245150301111013'),
      ('Rifky Cahya Setyaji', '255150401111002'),
      ('Fadhila Zalfa Alisya', '255150407111047'),
      ('Inas Tuqa Haura Bekti Harsono', '255150400111076'),
      ('Rhyu Santosa', '255150200111029'),
      ('Lintang Muhammad Shidiq', '255150607111009'),
      ('Rifqi Fadhil Abrar', '255150200111015'),
      ('Nayla Nur Amalia', '255150707111065'),
      ('Intsany Rofilah', '255150207111003'),
      ('Rosy Fredycia Bagaskara', '255150201111006')
    ) AS t(full_name, nim)
  LOOP
    UPDATE public.profiles
    SET nim = v_row.nim
    WHERE LOWER(TRIM(full_name)) = LOWER(TRIM(v_row.full_name));
  END LOOP;
END $$;
