import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";

import {Content} from "./Content";

@Entity()
export class StreamContent {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") type;

  @OneToOne(type => Content)
  @JoinColumn()
  content;

}
