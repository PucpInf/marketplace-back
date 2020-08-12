import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import {Provider} from "./Provider";
import {Category} from "./Category";
import {SubscriptionPlan} from "./SubscriptionPlan";
import {Region} from "./Region";
import {Payment} from "./Payment";
import {User} from "./User";
import {ContentType} from "./ContentType";
import {Content} from "./Content";
import {Client} from "./Client";

@Entity()
export class IosCode {

  @PrimaryGeneratedColumn()
  id = Number();


  @Column("varchar")
  code;

  @CreateDateColumn () created;

  //0=free, 1=assigned
  @Column ("integer") assigned;

  @ManyToOne(type => Content, content => content.ioscode)
  content;

  @ManyToOne(type => Client, client => client.ioscode,{nullable: true})
  client;
}
