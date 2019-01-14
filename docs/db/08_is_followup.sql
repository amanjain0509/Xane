alter table question_routings
add column is_followup boolean default false after next_question_id;