import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import {Provider} from "./Provider";
import {Content} from "./Content";

@Entity()
export class ContentType {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") type;

  @Column ("varchar") downloadable;
}
