import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany} from "typeorm";
import {Content} from "./Content";

@Entity()
export class Category {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") code;

  @ManyToMany(type => Content, content => content.categories)
  contents;


}
