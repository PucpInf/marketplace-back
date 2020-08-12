import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from "typeorm";
import {Provider} from "./Provider";
import {User} from "./User";

@Entity()
export class Session {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") token;

  @Column ("date") emission;

  @ManyToOne(type => User, user => user.sessions)
  user;
}
