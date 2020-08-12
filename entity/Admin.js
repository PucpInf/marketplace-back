import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Admin {

  @PrimaryGeneratedColumn()
  id = Number();

  @OneToOne(type => User)
  @JoinColumn()
  user;


}
