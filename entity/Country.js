import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from "typeorm";
import {User} from "./User";
import {Region} from "./Region";
import {Session} from "./Session";

@Entity()
export class Country {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") code;

  @Column ("varchar") name;
  @ManyToOne(type => Region, region => region.countries)
  region;

  @OneToMany(type => User, user => user.country)
  user;
}
