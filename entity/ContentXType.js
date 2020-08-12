import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import {Provider} from "./Provider";
import {Content} from "./Content";

@Entity()
export class ContentXType {

  @PrimaryColumn("integer")
  TypeId;

  @PrimaryColumn("integer")
  ContentId;
}
