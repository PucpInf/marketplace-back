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
import {Provider} from "./Provider";
import {SubscriptionAgreement} from "./SubscriptionAgreement";

@Entity()
export class Downloads {

  @PrimaryColumn("integer")
  ClientId;

  @PrimaryColumn("integer") 
  ContentId;

  @CreateDateColumn () created;
}
