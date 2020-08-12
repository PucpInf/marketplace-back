import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable} from "typeorm";
import {Content} from "./Content";
import {Country} from "./Country";

@Entity()
export class Region {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") code;

  @OneToMany(type => Country, country => country.region)
  countries ;

  @ManyToMany(type => Content)
  @JoinTable()
  contents ;

}
