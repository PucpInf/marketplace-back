import {Entity, PrimaryGeneratedColumn,PrimaryColumn, Column, OneToMany, ManyToMany, JoinTable} from "typeorm";
import {Content} from "./Content";
import {Client} from "./Client";
import {SubscriptionAgreement} from "./SubscriptionAgreement";

@Entity()
export class SubscriptionPlan {

  @PrimaryColumn("varchar") id;

  @Column ("varchar") name;

  @Column ("varchar") description;

  @Column ("double") price;

  @Column ("integer") free;

  @OneToMany(type => SubscriptionAgreement, agreement => agreement.subscription)
  agreement;

  @ManyToMany(type => Content)
  @JoinTable()
  contents ;

  @OneToMany(type => Client, client => client.plan)
  clients;
  
}
