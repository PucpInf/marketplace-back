import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  CreateDateColumn, PrimaryColumn
} from "typeorm";
import {Content} from "./Content";
import {Client} from "./Client";

@Entity()
export class Calification {

  @PrimaryColumn("integer")
  UserId;

  @PrimaryColumn("integer") 
  ContentId;

  @Column ("integer") calification;

  @Column ("varchar") description;
}
