import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne, JoinTable} from "typeorm";
import {User} from "./User";
import {Payment} from "./Payment";
import {SubscriptionAgreement} from "./SubscriptionAgreement";
import {SubscriptionPlan} from "./SubscriptionPlan";
import {SubscriptionPayment} from "./SubscriptionPayment";
import {IosCode} from "./IosCode";

@Entity()
export class Client {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column("varchar") customer;

  @OneToOne(type => User)
  @JoinColumn()
  user;

  @ManyToOne(type => SubscriptionPlan, plan => plan.clients)
  plan;

  @OneToMany(type => IosCode, ioscode => ioscode.client)
  ioscode;


  @OneToMany(type => Payment, payment => payment.client)
  payment;

  @OneToMany(type => SubscriptionPayment, payment => payment.client)
  invoice;

  @OneToMany(type => SubscriptionAgreement, agreement => agreement.client)
  agreement;
}
