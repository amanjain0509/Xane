DROP VIEW IF EXISTS missing_routings;
CREATE VIEW missing_routings
AS

SELECT DISTINCT q.survey_id, q.id AS question_id, at.answer_type, qa.answer, qa.sequence
FROM question_answers qa
LEFT JOIN question_routings qr ON qr.question_id = qa.question_id AND qr.answer_sequence=qa.sequence
LEFT JOIN questions q ON q.id = qa.question_id
INNER JOIN answer_types at ON at.id = q.answer_type_id
WHERE at.id = 1 AND qr.id IS NULL

UNION

SELECT DISTINCT q.survey_id, q.id as question_id, at.answer_type, null as answer, null as sequence
FROM questions q
INNER JOIN answer_types at ON at.id = q.answer_type_id
LEFT JOIN question_routings qr ON qr.question_id = q.id
WHERE at.id=2 AND qr.id IS NULL

