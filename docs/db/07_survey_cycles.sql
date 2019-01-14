drop table if exists survey_cycles; 
create table survey_cycles(
	id int not null AUTO_INCREMENT,
    cycle_number int not null,
    survey_id int,
    start datetime not null default '1970-01-01 00:00:00',
    end datetime not null default '2099-12-31 23:59:59',
    active boolean not null default true,
    created_at datetime not null default now(),
    updated_at datetime null default null,
    delete_at datetime null default null,
    primary key(id),
    foreign key (survey_id) references surveys(id)
);          
alter table user_answers add column survey_cycles_id int not null after sentiment_id;