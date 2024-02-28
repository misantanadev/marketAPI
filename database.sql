create table categories (
	id serial primary key,
  	description text not null
);

insert into categories (description) values 
('Accessories'),
('Foods'),
('Beauty'),
('Footwear'),
('Bed and Table'),
('T-shirts'),
('Cellphones'),
('Decoration'),
('Sports'),
('Games'),
('Computers'),
('Books'),
('Stationery'),
('Pets');

create table users (
  id serial primary key,
  store_name text not null,
  email text not null unique,
  password text not null
);

create table products (
	id serial primary key,
  	user_id integer not null references users(id),
  	name text not null,
  	stock integer not null,
  	price integer not null,
  	category text not null,
  	description text not null,
  	image text not null
);