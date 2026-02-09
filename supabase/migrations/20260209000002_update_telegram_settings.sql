-- Update Telegram settings with user provided values
UPDATE admin_settings SET value = '"8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU"' WHERE key = 'telegram_bot_token';
UPDATE admin_settings SET value = '"8508057441"' WHERE key = 'telegram_chat_id';

-- If they don't exist, insert them
INSERT INTO admin_settings (key, value)
SELECT 'telegram_bot_token', '"8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU"'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE key = 'telegram_bot_token');

INSERT INTO admin_settings (key, value)
SELECT 'telegram_chat_id', '"8508057441"'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE key = 'telegram_chat_id');
