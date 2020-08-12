import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable} from "typeorm";
import {Content} from "./Content";
import {Session} from "./Session";
import {Region} from "./Region";
import {Country} from "./Country";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") firstName;

  @Column ("varchar") lastName;

  @Column ("varchar") email;

  @Column ("varchar") password;

  @OneToMany(type => Session, session => session.user)
  sessions;

  @ManyToOne(type => Country, country => country.users)
  country;

  @ManyToMany(type => Content, content => content.users )
  @JoinTable()
  contents ;
}
