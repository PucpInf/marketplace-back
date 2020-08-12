import {Entity, PrimaryColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne, CreateDateColumn} from "typeorm";
import {SubscriptionPlan} from "./SubscriptionPlan";
import {Client} from "./Client";
import {Content} from "./Content";
import {SubscriptionPayment} from "./SubscriptionPayment";

@Entity()
export class SubscriptionAgreement {

  @PrimaryColumn("varchar") agreementId ;

  @Column("integer") state;

  @CreateDateColumn () created;

  @Column("integer") billing_cycle;

  @ManyToOne(type => Client, client => client.agreement)
  client;

  @ManyToOne(type => SubscriptionPlan, subscription => subscription.agreement)
  subscription;

  @OneToMany(type => SubscriptionPayment, payment => payment.agreement)
  payment;

}
