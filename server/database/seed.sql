USE kazilink;

-- Local demo accounts use the password "password". Change them outside development.
INSERT INTO users (id, name, email, password_hash, role, email_verified_at)
VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    'Miriam K.',
    'demo-owner@kazilink.local',
    '$2b$12$h.Dqyl/XMU5gcxDoQeInkOYqIzCSLCAmTp0G.1TJ8TMBAGRX9UXC6',
    'owner',
    CURRENT_TIMESTAMP
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Wanjiku Njeri',
    'demo-freelancer@kazilink.local',
    '$2b$12$h.Dqyl/XMU5gcxDoQeInkOYqIzCSLCAmTp0G.1TJ8TMBAGRX9UXC6',
    'freelancer',
    CURRENT_TIMESTAMP
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Brian Otieno',
    'freelancer2@kazilink.local',
    '$2b$12$h.Dqyl/XMU5gcxDoQeInkOYqIzCSLCAmTp0G.1TJ8TMBAGRX9UXC6',
    'freelancer',
    CURRENT_TIMESTAMP
  );

INSERT INTO profiles (
  id, title, service, category, subcategories, price, rating, review_count,
  location, languages, verified, experience, availability, accepts_mpesa,
  online, bio, avatar_url, portfolio, created_at
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'Brand & web designer',
    'Logo and brand identity',
    'Design and Creative',
    JSON_ARRAY('Logo and brand identity', 'Web design and development'),
    6500,
    5,
    1,
    'Nairobi',
    JSON_ARRAY('English', 'Kiswahili'),
    TRUE,
    'expert',
    'this week',
    TRUE,
    TRUE,
    'I help growing Kenyan businesses look confident and consistent online.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=82',
    JSON_ARRAY(JSON_OBJECT(
      'image', 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=720&q=82',
      'title', 'Soko coffee identity',
      'description', 'A warm, modern identity for a Nairobi coffee shop.'
    )),
    CURRENT_TIMESTAMP - INTERVAL 10 MONTH
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Social media manager',
    'Social media management',
    'Digital Marketing',
    JSON_ARRAY('Social media management', 'Content creation and copywriting'),
    8000,
    0,
    0,
    'Nairobi',
    JSON_ARRAY('English', 'Kiswahili', 'Luo'),
    TRUE,
    'established',
    'this week',
    TRUE,
    TRUE,
    'I help local brands grow with thoughtful content and clear reporting.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=82',
    JSON_ARRAY(JSON_OBJECT(
      'image', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=720&q=82',
      'title', 'Kito home socials',
      'description', 'A content refresh for a homeware shop.'
    )),
    CURRENT_TIMESTAMP - INTERVAL 9 MONTH
  );

INSERT INTO job_requests (
  id, client_id, client_name, freelancer_id, freelancer_name, service,
  description, budget, deadline, location, status, created_at
)
VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Miriam K.',
    '10000000-0000-4000-8000-000000000001',
    'Wanjiku Njeri',
    'Logo and brand identity',
    'Refresh the identity for our neighbourhood coffee shop.',
    6500,
    CURRENT_DATE - INTERVAL 20 DAY,
    'Nairobi',
    'completed',
    CURRENT_TIMESTAMP - INTERVAL 2 MONTH
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Miriam K.',
    '10000000-0000-4000-8000-000000000002',
    'Brian Otieno',
    'Social media management',
    'Plan a month of posts for our growing homeware store.',
    8000,
    CURRENT_DATE + INTERVAL 14 DAY,
    'Nairobi',
    'pending',
    CURRENT_TIMESTAMP
  );

INSERT INTO reviews (
  id, request_id, client_id, client_name, freelancer_id, rating, comment,
  created_at
)
VALUES (
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Miriam K.',
  '10000000-0000-4000-8000-000000000001',
  5,
  'Wanjiku listened carefully and gave our shop exactly the fresh look we needed.',
  CURRENT_TIMESTAMP - INTERVAL 2 MONTH
);
