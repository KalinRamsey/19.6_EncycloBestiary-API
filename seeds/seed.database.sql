BEGIN;

TRUNCATE
  bestiary_data,
  bestiaries,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password, about_me)
VALUES
  (
    'Demo',
    'test@gmail.com',
    '$2a$12$qgg6.WbRFqqYEO3Pxx2QKubYrL/Xw0THdSVTXC1PbUk62nLAxN742',
    'This is the sample "About Me" section. Write something nice!'
  );

  INSERT INTO bestiaries (user_id, bestiary_name, bestiary_description)
  VALUES 
    (
      1,
      'Demo Bestiary 1',
      'Demo Description 1'
    ),
    (
      1,
      'Demo Bestiary 2',
      'Demo Description 2'
    ),
    (
      1,
      'Demo Bestiary 3',
      'Demo Description 3'
    ),
    (
      1,
      'Demo Bestiary 4',
      'Demo Description 4'
    );

    INSERT INTO bestiary_data (user_id, bestiary_id, data_name, data_description)
    VALUES
      (
        1,
        1,
        'Test Data 1',
        'Test Desc 1: Should be logged under user "Demo" first Bestiary'
      ),
      (
        1,
        1,
        'Test Data 2',
        'Test Desc 2: Should be logged under user "Demo" first Bestiary'
      ),
      (
        1,
        2,
        'Test Data 3',
        'Test Desc 3: Should be logged under user "Demo" second Bestiary'
      );
    
COMMIT;